import { API_BASE_URL } from "@/lib/constants";
import {
  clearAuthCookie,
  getAccessTokenFromCookie,
  REFRESH_COOKIE,
} from "@/lib/cookie";
import { refreshClientSession } from "@/lib/session";
import type { NextRequest } from "next/server";

const PUBLIC_PATH_PREFIXES = [
  "client/auth/login",
  "client/auth/invitation/accept",
  "onboarding/setup",
  "client/auth/password/reset-request",
  "client/auth/password/reset",
];

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

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
  return refreshToken ? refreshClientSession(refreshToken) : null;
}

async function forwardRequest(
  request: NextRequest,
  path: string[],
  body: BodyInit | undefined,
  accessToken?: string,
): Promise<Response> {
  // Normalize the search parameters to ensure empty/null/undefined values are not included in the forwarded request
  const cleanedParams = new URLSearchParams();
  request.nextUrl.searchParams.forEach((value, key) => {
    if (value && value.trim() !== "") {
      cleanedParams.set(key, value);
    }
  });

  const search = cleanedParams.toString();
  const backendUrl = new URL(
    `/api/v1/${path.join("/")}${search ? `?${search}` : ""}`,
    API_BASE_URL,
  );

  // Pass the buffered body directly (not a ReadableStream): undici needs a
  // re-readable body source when the backend responds with 401.
  return fetch(backendUrl, {
    method: request.method,
    headers: createForwardHeaders(request, accessToken),
    body,
    cache: "no-store",
    redirect: "manual",
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

  // The incoming body can only be read once, so buffer it for possible retries
  const body = await readRequestBody(request);

  let response = await forwardRequest(
    request,
    path,
    body,
    accessToken ?? undefined,
  );

  if (!publicPath && response.status === 401) {
    const refreshedAccessToken = await refreshAccessToken(request);

    if (!refreshedAccessToken) {
      await clearAuthCookie();
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    response = await forwardRequest(request, path, body, refreshedAccessToken);

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
