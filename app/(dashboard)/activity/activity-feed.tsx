"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard-card";
import { useActivity } from "@/hooks/features/use-dashboard";
import {
  ActivityEmpty,
  ActivityItem,
  ActivitySkeleton,
} from "../dashboard/recent-activity";
import { DashboardError } from "../dashboard/dashboard-error";

// The backend caps the feed at 100 entries.
const ACTIVITY_LIMIT = 100;

export function ActivityFeed() {
  const { data, isLoading, isError, error, refetch } =
    useActivity(ACTIVITY_LIMIT);
  const activity = data ?? [];

  return (
    <DashboardCard>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>
          Court proceedings, appeals, stays and other court updates across your
          cases.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5">
        {isLoading ? (
          <ActivitySkeleton rows={8} />
        ) : isError ? (
          <div className="py-8">
            <DashboardError error={error} onRetry={() => refetch()} />
          </div>
        ) : activity.length ? (
          activity.map((entry) => <ActivityItem key={entry.id} entry={entry} />)
        ) : (
          <div className="py-8">
            <ActivityEmpty />
          </div>
        )}
      </CardContent>
    </DashboardCard>
  );
}
