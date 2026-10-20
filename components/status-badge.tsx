export type StatusTone = "positive" | "negative" | "neutral";

export function statusTone(value: string): StatusTone {
  const v = value.toUpperCase();
  if (["ACTIVE", "CURRENT", "VERIFIED"].includes(v)) return "positive";
  if (
    [
      "ARCHIVED",
      "SUSPENDED",
      "CANCELED",
      "CANCELLED",
      "PAST_DUE",
      "DELINQUENT",
      "DEACTIVATED",
    ].includes(v)
  )
    return "negative";
  return "neutral";
}

const toneStyles: Record<StatusTone, string> = {
  positive: "bg-lc-ledger-pale text-lc-ledger",
  negative: "bg-lc-stamp/12 text-lc-stamp",
  neutral: "bg-secondary text-muted-foreground",
};

export function StatusBadge({ value }: Readonly<{ value: string }>) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-plexmono text-[10px] uppercase tracking-wide ${toneStyles[statusTone(value)]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {value.replaceAll("_", " ")}
    </span>
  );
}
