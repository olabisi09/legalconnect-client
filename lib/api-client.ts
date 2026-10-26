import axios from "axios";
import type {
  AdvancedPageResponse,
  ApiResponse,
  ApiError,
  PagedResponse,
} from "@/types/shared";
import { useAuthStore } from "@/store/auth-store";
import { isOrgUnavailableError, normalizeApiError } from "./error";

const AUTH_PAGES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/accept-invitation",
  "/unavailable",
];

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
  return (
    normalized.endsWith("/client/auth/login") ||
    normalized === "/client/auth/login"
  );
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

    // A suspended/archived firm isn't a session problem — logging in again won't help.
    if (isOrgUnavailableError(error) && !isLoginRequest(requestUrl)) {
      useAuthStore.getState().clearAuthState();

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/unavailable"
      ) {
        const reason = normalizeApiError(error).errorCode ?? "ORG_SUSPENDED";
        window.location.replace(`/unavailable?reason=${reason}`);
      }

      return Promise.reject(error);
    }

    if (
      status === 401 &&
      !isLoginRequest(requestUrl) &&
      !isHandlingUnauthorized
    ) {
      isHandlingUnauthorized = true;

      const { clearAuthState } = useAuthStore.getState();
      clearAuthState();

      if (typeof window !== "undefined") {
        const isAuthPage = AUTH_PAGES.some((page) =>
          window.location.pathname.startsWith(page),
        );

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

/**
 * Client list endpoints aren't consistent: some return a bare array, some a
 * PagedResponse ({data, pagination}), some a raw Spring Page ({content, ...}).
 * Normalise all three to PagedResponse so pages don't care which they got.
 */
export function toPage<T>(
  payload: T[] | PagedResponse<T> | AdvancedPageResponse<T> | null,
  requested: { page?: number; size?: number } = {},
): PagedResponse<T> {
  const page = requested.page ?? 0;
  const size = requested.size ?? 20;

  if (Array.isArray(payload) || !payload) {
    const data = payload ?? [];
    // No totals on a bare array; a full page is the only hint there may be more.
    const hasNext = data.length >= size;
    return {
      data,
      pagination: {
        page,
        size,
        total: page * size + data.length,
        totalPages: page + (hasNext ? 2 : 1),
        hasNext,
        hasPrevious: page > 0,
      },
    };
  }

  if ("content" in payload) {
    return {
      data: payload.content,
      pagination: {
        page: payload.number,
        size: payload.size,
        total: payload.totalElements,
        totalPages: payload.totalPages,
        hasNext: !payload.last,
        hasPrevious: !payload.first,
      },
    };
  }

  return payload;
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
