import { API_BASE_URL } from "./constants";
import { setAuthCookie } from "./cookie";

type TokenPayload = {
  accessToken?: string;
  refreshToken?: string;
};

type RefreshResponse = TokenPayload & { data?: TokenPayload };

/**
 * Refresh tokens rotate, so the old one stops working once used. Several proxied
 * requests can hit an expired access token at the same moment; they share one
 * refresh call per token instead of racing and revoking each other's session.
 */
const inFlightRefreshes = new Map<string, Promise<TokenPayload | null>>();

async function requestRefresh(
  refreshToken: string,
): Promise<TokenPayload | null> {
  const response = await fetch(`${API_BASE_URL}/api/v1/client/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  if (!response.ok) return null;

  const body = (await response.json()) as RefreshResponse;
  const tokens = body.data ?? body;
  return tokens.accessToken ? tokens : null;
}

/** Exchanges the refresh token for a new pair and stores it. Returns the new access token. */
export async function refreshClientSession(
  refreshToken: string,
): Promise<string | null> {
  let pending = inFlightRefreshes.get(refreshToken);

  if (!pending) {
    pending = requestRefresh(refreshToken)
      .catch(() => null)
      .finally(() => {
        // Keep the result briefly so requests that arrive just after still reuse it.
        setTimeout(() => inFlightRefreshes.delete(refreshToken), 10_000);
      });
    inFlightRefreshes.set(refreshToken, pending);
  }

  const tokens = await pending;
  if (!tokens?.accessToken) return null;

  await setAuthCookie(tokens.accessToken, tokens.refreshToken ?? refreshToken);
  return tokens.accessToken;
}

/** Best-effort server-side logout so the refresh token can't be reused. */
export async function revokeClientSession(
  refreshToken: string,
  accessToken?: string | null,
) {
  try {
    await fetch(`${API_BASE_URL}/api/v1/client/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
  } catch {
    // The cookies are cleared either way; a failed revoke just leaves the token to expire.
  }
}
