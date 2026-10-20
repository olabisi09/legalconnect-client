import { API_BASE_URL } from "@/lib/constants";
import { clearAuthCookie, REFRESH_COOKIE, setAuthCookie } from "@/lib/cookie";
import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type RefreshResponse = {
  accessToken?: string;
  refreshToken?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
};

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { message: "Refresh token not found" },
      { status: 401 },
    );
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/auth/refresh`,
      { refresh_token: refreshToken },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      },
    );

    const data = response?.data as RefreshResponse;
    const payload = data?.data ?? data;

    if (!payload.accessToken) {
      throw new Error("No access token returned from refresh endpoint");
    }

    await setAuthCookie(
      payload.accessToken,
      payload.refreshToken ?? refreshToken,
    );

    return NextResponse.json({ success: true });
  } catch {
    await clearAuthCookie();
    return NextResponse.json(
      { message: "Unable to refresh session" },
      { status: 401 },
    );
  }
}
