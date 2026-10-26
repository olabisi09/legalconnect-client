import { clearAuthCookie, REFRESH_COOKIE } from "@/lib/cookie";
import { refreshClientSession } from "@/lib/session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { message: "Refresh token not found" },
      { status: 401 },
    );
  }

  const accessToken = await refreshClientSession(refreshToken);

  if (!accessToken) {
    await clearAuthCookie();
    return NextResponse.json(
      { message: "Unable to refresh session" },
      { status: 401 },
    );
  }

  return NextResponse.json({ success: true });
}
