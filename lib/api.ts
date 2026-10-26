import { ApiResponse, PagedResponse } from "@/types/shared";
import { Notification } from "@/types/notification";
import { apiClient, toPage, unwrap } from "./api-client";
import {
  CaseListParams,
  ClientCaseDeadline,
  ClientCaseDetail,
  ClientCaseSummary,
} from "@/types/case";
import { ClientDocument, DocumentListParams } from "@/types/document";
import { CalendarEvent, CalendarParams } from "@/types/calendar";
import { getFileNameFromContentDispositionHeader } from "./download";
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
} from "@/types/auth";
import { Dashboard, RecentActivity } from "@/types/dashboard";
import { ClientProfile, UpdateProfilePayload } from "@/types/profile";

export const authAPI = {
  login: async (payload: LoginPayload) =>
    await apiClient
      .post<ApiResponse<AuthResponse>>("/client/auth/login", payload)
      .then(unwrap),

  register: async (payload: RegisterPayload) =>
    await apiClient
      .post<ApiResponse<RegisterResponse>>("/onboarding/setup", payload)
      .then(unwrap),

  forgotPassword: async (payload: { email: string }) =>
    await apiClient
      .post<
        ApiResponse<{ message: string; expiresIn: number }>
      >("/client/auth/password/reset-request", payload)
      .then(unwrap),

  resetPassword: async (payload: { password: string; token: string }) =>
    await apiClient.post("/client/auth/password/reset", payload).then(unwrap),

  /** Stores the tokens in httpOnly cookies; every proxied request reads them from there. */
  createSession: async ({ accessToken, refreshToken }: AuthResponse) => {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Unable to create authenticated session");
    }
  },

  /** Revokes the refresh token server-side (the browser can't read it) and clears the cookies. */
  logout: async () => {
    await fetch("/api/auth/session", {
      method: "DELETE",
      credentials: "include",
    });
  },

  enableMFA: async () =>
    await apiClient
      .post<
        ApiResponse<{ secret: string; qrCodeUrl: string; verified: boolean }>
      >("/client/auth/mfa/enroll", { type: "totp" })
      .then(unwrap),

  verifyMFA: async (payload: { code: string }) =>
    await apiClient.post("/client/auth/mfa/verify", payload).then(unwrap),

  acceptInvite: async (payload: {
    token: string;
    email: string;
    password: string;
  }) =>
    await apiClient
      .post<
        ApiResponse<AuthResponse>
      >("/client/auth/invitation/accept", payload)
      .then(unwrap),
};

export const dashboardAPI = {
  getDashboard: async () =>
    await apiClient
      .get<ApiResponse<Dashboard>>("/client/dashboard")
      .then(unwrap),

  getActivity: async (params?: { limit?: number }) =>
    await apiClient
      .get<ApiResponse<RecentActivity[]>>("/client/activity", { params })
      .then(unwrap),
};

export const notificationAPI = {
  getNotifications: async (params?: {
    page?: number;
    size?: number;
    unreadOnly?: boolean;
  }) =>
    await apiClient
      .get<ApiResponse<PagedResponse<Notification>>>(`/client/notifications`, {
        params,
      })
      .then(unwrap),
  getUnreadCount: async () =>
    await apiClient
      .get<ApiResponse<number>>(`/client/notifications/unread-count`)
      .then(unwrap),
  markAsRead: async (notificationId: string) =>
    await apiClient
      .post<
        ApiResponse<{ message: string }>
      >(`/client/notifications/${notificationId}/read`)
      .then(unwrap),
  markAllAsRead: async () =>
    await apiClient
      .post<ApiResponse<{ message: string }>>(`/client/notifications/read-all`)
      .then(unwrap),
};

type ListPayload<T> = Parameters<typeof toPage<T>>[0];

export const casesAPI = {
  getCases: async (params: CaseListParams = {}) =>
    await apiClient
      .get<ApiResponse<ListPayload<ClientCaseSummary>>>("/client/cases", {
        params,
      })
      .then(unwrap)
      .then((payload) => toPage(payload, params)),

  getCase: async (caseId: string) =>
    await apiClient
      .get<ApiResponse<ClientCaseDetail>>(`/client/cases/${caseId}`)
      .then(unwrap),

  /** Court events in plain words — the same entries as the activity feed. */
  getTimeline: async (
    caseId: string,
    params: { page?: number; size?: number } = {},
  ) =>
    await apiClient
      .get<
        ApiResponse<ListPayload<RecentActivity>>
      >(`/client/cases/${caseId}/timeline`, { params })
      .then(unwrap)
      .then((payload) => toPage(payload, params)),

  getDeadlines: async (caseId: string) =>
    await apiClient
      .get<
        ApiResponse<ClientCaseDeadline[]>
      >(`/client/cases/${caseId}/deadlines`)
      .then(unwrap),
};

export const documentsAPI = {
  getCaseDocuments: async (caseId: string, params: DocumentListParams = {}) =>
    await apiClient
      .get<
        ApiResponse<ListPayload<ClientDocument>>
      >(`/client/cases/${caseId}/documents`, { params })
      .then(unwrap)
      .then((payload) => toPage(payload, params)),

  getDocument: async (documentId: string) =>
    await apiClient
      .get<ApiResponse<ClientDocument>>(`/client/documents/${documentId}`)
      .then(unwrap),

  /** Raw file stream, not JSON. Falls back to the stored name if the header has none. */
  download: async (document: Pick<ClientDocument, "id" | "fileName">) => {
    const response = await apiClient.get<Blob>(
      `/client/documents/${document.id}/download`,
      { responseType: "blob" },
    );

    let fileName = document.fileName;
    try {
      fileName = getFileNameFromContentDispositionHeader(
        response.headers["content-disposition"] ?? null,
      );
    } catch {
      // keep the stored file name
    }

    return { blob: response.data, fileName };
  },
};

export const calendarAPI = {
  getEvents: async (params: CalendarParams = {}) =>
    await apiClient
      .get<ApiResponse<CalendarEvent[]>>("/client/calendar/events", { params })
      .then(unwrap),
};

export const profileAPI = {
  getProfile: async () =>
    await apiClient
      .get<ApiResponse<ClientProfile>>("/client/profile")
      .then(unwrap),

  updateProfile: async (payload: UpdateProfilePayload) =>
    await apiClient
      .put<ApiResponse<ClientProfile>>("/client/profile", payload)
      .then(unwrap),
};
