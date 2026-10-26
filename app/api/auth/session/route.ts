import {
  clearAuthCookie,
  getAccessTokenFromCookie,
  REFRESH_COOKIE,
  setAuthCookie,
} from "@/lib/cookie";
import { revokeClientSession } from "@/lib/session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const accessToken = await getAccessTokenFromCookie();

  return NextResponse.json({
    authenticated: Boolean(accessToken),
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    accessToken?: string;
    refreshToken?: string;
  };

  if (!body.accessToken || typeof body.accessToken !== "string") {
    return NextResponse.json(
      { message: "accessToken is required" },
      { status: 400 },
    );
  }

  await setAuthCookie(body.accessToken, body.refreshToken);

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  // The refresh token is httpOnly, so the browser can't send it to /logout itself.
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    await revokeClientSession(refreshToken, await getAccessTokenFromCookie());
  }

  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
