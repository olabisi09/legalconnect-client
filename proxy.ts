import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/cookie";
import { type NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/activity",
  "/cases",
  "/calendar",
];
// Signed-in clients are sent to the dashboard instead of these.
const guestOnlyRoutes = ["/login", "/forgot-password", "/reset-password"];

function matches(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // An expired access token can still be refreshed by the API proxy, so either cookie counts.
  const hasSession =
    request.cookies.has(ACCESS_COOKIE) || request.cookies.has(REFRESH_COOKIE);

  if (matches(pathname, protectedRoutes) && !hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (matches(pathname, guestOnlyRoutes) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/activity/:path*",
    "/cases/:path*",
    "/calendar/:path*",
    "/login",
    "/forgot-password",
    "/reset-password",
  ],
};
