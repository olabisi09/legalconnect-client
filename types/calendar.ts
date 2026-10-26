export type CalendarEventType =
  | "HEARING"
  | "MEETING"
  | "DEADLINE"
  | "REMINDER"
  | "COURT_DATE"
  | "DEPOSITION"
  | "MEDIATION"
  | "TRIAL"
  | "OTHER";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  eventType: CalendarEventType;
  /** LocalDateTime — no zone, read as local time. */
  startTime: string;
  endTime?: string | null;
  allDay?: boolean;
  location?: string | null;
  caseId?: string | null;
  reminders?: number[];
}

export interface CalendarParams {
  /** LocalDate, yyyy-MM-dd */
  from?: string;
  to?: string;
  caseId?: string;
}
