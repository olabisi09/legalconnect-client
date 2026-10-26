// Clients only see documents the firm shared with the case's clients (CASE_CLIENTS).
// Field names follow the Document entity; confirm the client DTO against the backend.

export interface ClientDocument {
  id: string;
  caseId: string;
  fileName: string;
  fileType?: string | null;
  fileSize?: number | null;
  status?: string;
  description?: string | null;
  currentVersionNumber?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentListParams {
  page?: number;
  size?: number;
  fileType?: string;
  search?: string;
}
