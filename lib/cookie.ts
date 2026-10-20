import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

export const ACCESS_COOKIE = "legalconnect-access-token";
export const REFRESH_COOKIE = "legalconnect-refresh-token";

type JwtExp = {
  exp?: number;
};

function decodeExp(accessToken: string): number | null {
  try {
    const decoded = jwtDecode<JwtExp>(accessToken);
    return typeof decoded.exp === "number" ? decoded.exp : null;
  } catch {
    return null;
  }
}

function getCookieMaxAge(
  expSeconds: number | null,
  fallbackSeconds: number,
): number {
  if (!expSeconds) return fallbackSeconds;

  const maxAge = expSeconds - Math.floor(Date.now() / 1000);
  return Math.max(maxAge, 0);
}

export async function setAuthCookie(
  accessToken: string,
  refreshToken?: string,
) {
  const cookieStore = await cookies();
  const exp = decodeExp(accessToken);
  const accessMaxAge = getCookieMaxAge(exp, 60 * 15);

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAge,
  });

  if (refreshToken) {
    cookieStore.set(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function getAccessTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (accessToken) {
    const exp = decodeExp(accessToken);
    if (!exp || exp > Math.floor(Date.now() / 1000)) {
      return accessToken;
    }
  }
  return null;
}
