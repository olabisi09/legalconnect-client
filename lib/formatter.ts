/** Shared locale for dashboard (charts, KPIs, tables). */
export const DASHBOARD_LOCALE = "en-NG";

/** Noon anchor avoids off-by-one labels around timezone boundaries for ISO date strings. */
export function parseIsoCalendarDate(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00`);
}

export type DashboardDateStyle = "month" | "day-month" | "full";

export function formatDate(
  isoDate: string,
  style: DashboardDateStyle = "full",
): string {
  const date = parseIsoCalendarDate(isoDate);
  if (style === "month") {
    return date.toLocaleDateString(DASHBOARD_LOCALE, { month: "short" });
  }
  if (style === "day-month") {
    return date.toLocaleDateString(DASHBOARD_LOCALE, {
      day: "numeric",
      month: "short",
    });
  }
  return date.toLocaleDateString(DASHBOARD_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// formatDateString function to format a date string in "2026-08-12T12:43:29.594372" format to "Aug 12, 2026, 12:43 PM"
export function formatDateString(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(DASHBOARD_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

// formatTimeString function to format a date string in "2026-08-12T12:43:29.594372" format to "12:43 PM"
export function formatTimeString(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString(DASHBOARD_LOCALE, {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

export function formatDateTimeString(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(DASHBOARD_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatRelativeTime(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
}

/** X-axis for range charts: weekday when showing ~a week, otherwise month + day. */
export function formatChartAxisTick(
  isoDate: string,
  periodDays: number,
): string {
  const date = parseIsoCalendarDate(isoDate);
  if (periodDays <= 7) {
    return date.toLocaleDateString(DASHBOARD_LOCALE, { weekday: "short" });
  }
  return formatDate(isoDate, "day-month");
}

export type ChartTooltipWeekdayStyle = "short" | "long";

/** Tooltip label for a chart point (weekday + month + day). */
export function formatChartTooltipDate(
  isoDate: string,
  weekdayStyle: ChartTooltipWeekdayStyle = "short",
): string {
  const date = parseIsoCalendarDate(isoDate);
  return date.toLocaleDateString(DASHBOARD_LOCALE, {
    weekday: weekdayStyle,
    day: "numeric",
    month: "short",
  });
}

export function formatCompactCurrency(
  value: number,
  options?: { maximumFractionDigits?: number },
) {
  const { maximumFractionDigits = 0 } = options ?? {};
  return new Intl.NumberFormat(DASHBOARD_LOCALE, {
    currency: "USD",
    maximumFractionDigits,
    notation: "compact",
    style: "currency",
  }).format(value);
}

/** Full-precision USD (e.g. average order value). */
export function formatFullCurrency(value: number) {
  return new Intl.NumberFormat(DASHBOARD_LOCALE, {
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: "currency",
  }).format(value);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat(DASHBOARD_LOCALE, {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}

/** Whole numbers with grouping (visits, sessions, counts). */
export function formatInteger(value: number) {
  return new Intl.NumberFormat(DASHBOARD_LOCALE, {
    maximumFractionDigits: 0,
  }).format(value);
}

/** Percentage with fixed decimal places (e.g. conversion rate). */
export function formatPercent(value: number, fractionDigits = 2) {
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function toDateTimeLocal(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDateTimeLocal(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
