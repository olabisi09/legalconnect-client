import {
  clearAuthCookie,
  getAccessTokenFromCookie,
  REFRESH_COOKIE,
  setAuthCookie,
} from "@/lib/cookie";
import type { NextRequest } from "next/server";

type RefreshTokenPayload = {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
};

const PUBLIC_PATH_PREFIXES = [
  "auth/login",
  "onboarding/setup",
  "auth/password/reset-request",
  "auth/password/reset",
];

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

type RefreshPayload = RefreshTokenPayload & {
  data?: RefreshTokenPayload;
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function resolveRefreshTokens(payload: RefreshPayload): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  const data = payload.data ?? payload;

  return {
    accessToken: data.accessToken ?? data.access_token ?? null,
    refreshToken: data.refreshToken ?? data.refresh_token ?? null,
  };
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname === prefix);
}

function createForwardHeaders(request: NextRequest, accessToken?: string) {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();

    if (
      lowerKey === "host" ||
      lowerKey === "cookie" ||
      lowerKey === "content-length" ||
      lowerKey === "connection"
    ) {
      return;
    }

    headers.set(key, value);
  });

  headers.set("Accept", headers.get("Accept") ?? "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  } else {
    headers.delete("Authorization");
  }

  return headers;
}

async function readRequestBody(
  request: NextRequest,
): Promise<BodyInit | undefined> {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  const body = await request.arrayBuffer();
  return body.byteLength > 0 ? body : undefined;
}

async function refreshAccessToken(
  request: NextRequest,
): Promise<string | null> {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return null;
  }

  const refreshResponse = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });

  if (!refreshResponse.ok) {
    return null;
  }

  const refreshData = (await refreshResponse.json()) as RefreshPayload;
  const tokens = resolveRefreshTokens(refreshData);

  if (!tokens.accessToken) {
    return null;
  }

  await setAuthCookie(tokens.accessToken, tokens.refreshToken ?? refreshToken);
  return tokens.accessToken;
}

async function forwardRequest(
  request: NextRequest,
  path: string[],
  accessToken?: string,
): Promise<Response> {
  // Normalize the search parameters to ensure empty/null/undefined values are not included in the forwarded request
  const cleanedParams = new URLSearchParams();
  request.nextUrl.searchParams.forEach((value, key) => {
    if (value && value.trim() !== "") {
      cleanedParams.set(key, value);
    }
  });

  const normalizedUrl = new URL(request.url);
  normalizedUrl.search = cleanedParams.toString();

  const normalizedRequest = new Request(normalizedUrl.toString(), {
    method: request.method,
    headers: createForwardHeaders(request, accessToken),
    body: await readRequestBody(request),
    cache: "no-store",
    redirect: "manual",
  });

  const backendUrl = new URL(
    `/api/v1/${path.join("/")}${normalizedUrl.search}`,
    API_BASE_URL,
  );

  return fetch(backendUrl, {
    method: normalizedRequest.method,
    headers: normalizedRequest.headers,
    body: normalizedRequest.body,
    cache: "no-store",
    redirect: "manual",
    ...(normalizedRequest.body && { duplex: "half" }),
  });
}

function toClientResponse(response: Response): Response {
  const headers = new Headers();
  const contentType = response.headers.get("content-type");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  const disposition = response.headers.get("content-disposition");
  if (disposition) {
    headers.set("content-disposition", disposition);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function handleRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const normalizedPath = path.join("/");
  const publicPath = isPublicPath(normalizedPath);

  let accessToken = publicPath ? null : await getAccessTokenFromCookie();

  if (!publicPath && !accessToken) {
    accessToken = await refreshAccessToken(request);
  }

  if (!publicPath && !accessToken) {
    await clearAuthCookie();
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let response = await forwardRequest(request, path, accessToken ?? undefined);

  if (!publicPath && response.status === 401) {
    const refreshedAccessToken = await refreshAccessToken(request);

    if (!refreshedAccessToken) {
      await clearAuthCookie();
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    response = await forwardRequest(request, path, refreshedAccessToken);

    if (response.status === 401) {
      await clearAuthCookie();
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

  return toClientResponse(response);
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
