// The reference only pins down a few fields of the client case DTOs; the rest
// mirror the Case entity and are optional until confirmed against the backend.

export type CaseStatus = "INTAKE" | "ACTIVE" | "RESOLVED" | "CLOSED";
export type CasePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface ClientCaseSummary {
  id: string;
  caseNumber: string;
  title: string;
  status: CaseStatus;
  stage?: string;
  caseType?: string;
  priority?: CasePriority;
  practiceArea?: string | null;
  openedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** `status` and `priority` come back as plain strings here, not the enums the summary uses. */
export interface ClientCaseDetail extends Omit<
  ClientCaseSummary,
  "status" | "priority"
> {
  status: string;
  priority?: string;
  description?: string | null;
  jurisdictionCode?: string | null;
  closedAt?: string | null;
  resolvedAt?: string | null;
}

/** Status is computed server-side; `daysRemaining` is negative once overdue. */
export type DeadlineStatus = "COMPLETED" | "OVERDUE" | "UPCOMING";

export interface ClientCaseDeadline {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  completed: boolean;
  completedAt?: string | null;
  status: DeadlineStatus;
  daysRemaining: number;
}

export interface CaseListParams {
  page?: number;
  size?: number;
}
