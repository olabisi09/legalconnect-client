"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard-card";
import { AppEmpty } from "@/components/app-empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/features/use-dashboard";
import { formatDateString, parseIsoCalendarDate } from "@/lib/formatter";
import { RiCalendarCheckLine } from "@remixicon/react";
import { DashboardError } from "./dashboard-error";

function daysUntil(dueDate: string): number {
  const due = parseIsoCalendarDate(dueDate.slice(0, 10));
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / 86_400_000);
}

function dueLabel(dueDate: string): { text: string; tone: string } {
  const diff = daysUntil(dueDate);
  if (diff < 0) {
    return { text: `${Math.abs(diff)}d overdue`, tone: "text-lc-stamp" };
  }
  if (diff === 0) {
    return { text: "Due today", tone: "text-lc-stamp" };
  }
  if (diff === 1) {
    return { text: "Due tomorrow", tone: "text-foreground" };
  }
  return { text: `Due in ${diff}d`, tone: "text-muted-foreground" };
}

export function UpcomingDeadlines({ className }: { className?: string }) {
  const { data, isLoading, isError, error, refetch } = useDashboard();
  const deadlines = data?.upcomingDeadlines ?? [];

  return (
    <DashboardCard className={className}>
      <CardHeader>
        <CardTitle>Upcoming deadlines</CardTitle>
        <CardDescription>
          Filing and task due dates across your cases.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-8">
            <DashboardError error={error} onRetry={() => refetch()} />
          </div>
        ) : deadlines.length ? (
          deadlines.map((deadline) => {
            const label = dueLabel(deadline.dueDate);
            return (
              <div
                key={deadline.id}
                className="-mx-2 flex items-center justify-between gap-3 rounded-[3px] px-2 py-2.5"
              >
                <div className="min-w-0">
                  <p
                    className={`truncate text-[13px] font-medium ${
                      deadline.completed
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {deadline.title}
                  </p>
                  <p className="truncate text-[11.5px] text-muted-foreground">
                    {deadline.caseNumber} · {deadline.caseTitle}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`font-plexmono text-[11px] ${label.tone}`}>
                    {deadline.completed ? "Completed" : label.text}
                  </p>
                  <p className="font-plexmono text-[10px] text-muted-foreground">
                    {formatDateString(deadline.dueDate)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8">
            <AppEmpty
              title="No upcoming deadlines"
              description="Deadlines from your active cases will show up here."
              icon={<RiCalendarCheckLine />}
            />
          </div>
        )}
      </CardContent>
    </DashboardCard>
  );
}
