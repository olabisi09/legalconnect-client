"use client";

import { RiCalendarCheckLine } from "@remixicon/react";

import { CardContent } from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard-card";
import { AppEmpty } from "@/components/app-empty";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCaseDeadlines } from "@/hooks/features/use-cases";
import { useRedirectIfRemovedFromCase } from "@/hooks/use-case-access";
import { formatDateString } from "@/lib/formatter";
import type { ClientCaseDeadline } from "@/types/case";
import { DashboardError } from "../../dashboard/dashboard-error";

/** Open deadlines soonest first; completed ones after, most recent first. */
function sortDeadlines(deadlines: ClientCaseDeadline[]) {
  const open = deadlines
    .filter((d) => d.status !== "COMPLETED")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const done = deadlines
    .filter((d) => d.status === "COMPLETED")
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  return [...open, ...done];
}

function relativeDue({ status, daysRemaining }: ClientCaseDeadline) {
  if (status === "COMPLETED") return null;
  if (daysRemaining < 0) {
    const days = Math.abs(daysRemaining);
    return `${days} day${days === 1 ? "" : "s"} overdue`;
  }
  if (daysRemaining === 0) return "Due today";
  if (daysRemaining === 1) return "Due tomorrow";
  return `Due in ${daysRemaining} days`;
}

export function CaseDeadlines({ caseId }: { caseId: string }) {
  const { data, isLoading, isError, error, refetch } =
    useCaseDeadlines(caseId);
  useRedirectIfRemovedFromCase(error);
  const deadlines = sortDeadlines(data ?? []);

  return (
    <DashboardCard>
      <CardContent className="flex flex-col gap-0.5">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-8">
            <DashboardError error={error} onRetry={() => refetch()} />
          </div>
        ) : deadlines.length ? (
          deadlines.map((deadline) => {
            const due = relativeDue(deadline);
            return (
              <div
                key={deadline.id}
                className="flex flex-col gap-2 border-b border-border py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p
                    className={`text-[13px] font-medium ${
                      deadline.status === "COMPLETED"
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {deadline.title}
                  </p>
                  {deadline.description && (
                    <p className="line-clamp-2 text-[12px] text-muted-foreground">
                      {deadline.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                  <StatusBadge value={deadline.status} />
                  <p className="font-plexmono text-[10.5px] text-muted-foreground">
                    {due ? `${due} · ` : ""}
                    {formatDateString(deadline.dueDate)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8">
            <AppEmpty
              title="No deadlines"
              description="Filing and court deadlines for this case will show up here."
              icon={<RiCalendarCheckLine />}
            />
          </div>
        )}
      </CardContent>
    </DashboardCard>
  );
}
