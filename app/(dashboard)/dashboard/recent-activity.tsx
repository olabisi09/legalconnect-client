"use client";

import Link from "next/link";
import {
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard-card";
import { AppEmpty } from "@/components/app-empty";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/features/use-dashboard";
import { type RecentActivity } from "@/types/dashboard";
import { formatRelativeTime } from "@/lib/formatter";
import { RiArrowRightSLine, RiInformationLine, RiScales3Line } from "@remixicon/react";
import { DashboardError } from "./dashboard-error";

const MAX_VISIBLE_ACTIVITY = 5;

/** The backend phrases client activity in plain words; fall back to the action code. */
function activityText(entry: RecentActivity) {
  return entry.description || entry.action.replaceAll("_", " ").toLowerCase();
}

export function ActivityItem({ entry }: { entry: RecentActivity }) {
  return (
    <div className="-mx-2 flex items-start gap-3 rounded-[3px] px-2 py-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-lc-paper-warm text-lc-slate">
        {/* Client activity is court events only. */}
        <RiScales3Line className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-foreground first-letter:uppercase">
          {activityText(entry)}
        </p>
        <p className="font-plexmono text-[10.5px] text-muted-foreground">
          {formatRelativeTime(entry.timestamp)}
        </p>
      </div>
    </div>
  );
}

export function ActivitySkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function ActivityEmpty() {
  return (
    <AppEmpty
      title="No recent activity"
      description="Court updates on your cases will show up here."
      icon={<RiInformationLine />}
    />
  );
}

export function RecentActivity({ className }: { className?: string }) {
  const { data, isLoading, isError, error, refetch } = useDashboard();
  const visibleActivity = (data?.recentActivity ?? []).slice(
    0,
    MAX_VISIBLE_ACTIVITY,
  );

  return (
    <DashboardCard className={className}>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Latest court updates on your cases.</CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            render={<Link href="/activity" />}
          >
            See all
            <RiArrowRightSLine data-icon="inline-end" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5">
        {isLoading ? (
          <ActivitySkeleton />
        ) : isError ? (
          <div className="py-8">
            <DashboardError error={error} onRetry={() => refetch()} />
          </div>
        ) : visibleActivity.length ? (
          visibleActivity.map((entry) => (
            <ActivityItem key={entry.id} entry={entry} />
          ))
        ) : (
          <div className="py-8">
            <ActivityEmpty />
          </div>
        )}
      </CardContent>
    </DashboardCard>
  );
}
