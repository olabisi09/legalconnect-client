import {
  clearAuthCookie,
  getAccessTokenFromCookie,
  setAuthCookie,
} from "@/lib/cookie";
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
  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
