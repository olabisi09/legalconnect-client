import axios from "axios";
import type { ApiResponse, ApiError, PagedResponse } from "@/types/shared";
import { useAuthStore } from "@/store/auth-store";

export const apiClient = axios.create({
  baseURL: "/api/proxy",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 30000,
});

let isHandlingUnauthorized = false;

function isLoginRequest(url?: string): boolean {
  if (!url) return false;

  // Handle both relative urls ("/auth/login") and absolute urls.
  const normalized = url.startsWith("http") ? new URL(url).pathname : url;
  return normalized.endsWith("/auth/login") || normalized === "auth/login";
}

apiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (response.status === 204 && !response.data) {
      return {
        ...response,
        data: {
          success: true,
          data: null,
          message: null,
          timestamp: new Date().toISOString(),
        },
      };
    }

    return response;
  },
  async (error) => {
    const status = error?.response?.status as number | undefined;
    const requestUrl = error?.config?.url as string | undefined;

    if (
      status === 401 &&
      !isLoginRequest(requestUrl) &&
      !isHandlingUnauthorized
    ) {
      isHandlingUnauthorized = true;

      const { clearAuthState } = useAuthStore.getState();
      clearAuthState();

      if (typeof window !== "undefined") {
        const isAuthPage =
          window.location.pathname === "/login" ||
          window.location.pathname.startsWith("/signup") ||
          window.location.pathname.startsWith("/forgot-password") ||
          window.location.pathname.startsWith("/mfa");

        if (!isAuthPage) {
          window.location.replace("/login");
        }
      }

      isHandlingUnauthorized = false;
    }

    return Promise.reject(error);
  },
);

// ─── Helpers ──────────────────────────────────────────────────────────────

export function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export function unwrapPage<T>(response: {
  data: ApiResponse<PagedResponse<T>>;
}): PagedResponse<T> {
  return response.data.data;
}

export function getApiData<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

// ─── Error Handling Helpers ────────────────────────────────────────────────

export function getFieldErrors(error: unknown): Record<string, string> {
  if (!isApiError(error)) return {};
  const errors: Record<string, string> = {};
  error.details?.forEach((detail) => {
    errors[detail.field] = detail.reason;
  });
  return errors;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "status" in error
  );
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}
