export interface NormalizedApiError {
  status: number;
  code: string;
  message: string;
  traceId: string | null;
  path: string | null;
  fieldErrors: Record<string, string>;
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  const fallback: NormalizedApiError = {
    status: 0,
    code: "UNKNOWN",
    message: "An unexpected error occurred",
    traceId: null,
    path: null,
    fieldErrors: {},
  };

  if (!error || typeof error !== "object") return fallback;

  const err = error as Record<string, unknown>;

  if (err.response && typeof err.response === "object") {
    const response = err.response as Record<string, unknown>;
    const data = response.data as Record<string, unknown> | undefined;

    const status = typeof response.status === "number" ? response.status : 0;
    const code = typeof data?.code === "string" ? data.code : "";
    const message =
      typeof data?.message === "string"
        ? data.message
        : typeof err.message === "string"
          ? err.message
          : "";
    const traceId = typeof data?.traceId === "string" ? data.traceId : null;
    const path = typeof data?.path === "string" ? data.path : null;

    const fieldErrors: Record<string, string> = {};
    if (Array.isArray(data?.details)) {
      for (const detail of data.details) {
        if (detail && typeof detail === "object") {
          const d = detail as Record<string, unknown>;
          if (typeof d.field === "string" && typeof d.reason === "string") {
            fieldErrors[d.field] = d.reason;
          }
        }
      }
    }

    return { status, code, message, traceId, path, fieldErrors };
  }

  return {
    ...fallback,
    message: (err.message as string) || fallback.message,
  };
}

export class ApiRequestError extends Error {
  public status: number;
  public code: string;
  public traceId: string | null;
  public path: string | null;
  public fieldErrors: Record<string, string>;

  constructor(normalized: NormalizedApiError) {
    super(normalized.message);
    this.name = "ApiRequestError";
    this.status = normalized.status;
    this.code = normalized.code;
    this.traceId = normalized.traceId;
    this.path = normalized.path;
    this.fieldErrors = normalized.fieldErrors;
  }

  getFieldError(field: string): string | undefined {
    return this.fieldErrors[field];
  }

  hasFieldErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }
}

export function toApiError(error: unknown): ApiRequestError {
  return new ApiRequestError(normalizeApiError(error));
}

export function isValidationError(error: unknown): boolean {
  const normalized = normalizeApiError(error);
  return normalized.status === 422 && normalized.code === "VALIDATION_ERROR";
}
