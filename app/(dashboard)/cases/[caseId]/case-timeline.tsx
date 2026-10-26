"use client";

import { useState } from "react";

import { CardContent } from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard-card";
import { ListPagination } from "@/components/list-pagination";
import { useCaseTimeline } from "@/hooks/features/use-cases";
import { useRedirectIfRemovedFromCase } from "@/hooks/use-case-access";
import {
  ActivityEmpty,
  ActivityItem,
  ActivitySkeleton,
} from "../../dashboard/recent-activity";
import { DashboardError } from "../../dashboard/dashboard-error";

export function CaseTimeline({ caseId }: { caseId: string }) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const { data, isLoading, isError, error, refetch } = useCaseTimeline(
    caseId,
    { page, size },
  );
  useRedirectIfRemovedFromCase(error);
  const events = data?.data ?? [];

  return (
    <DashboardCard>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <ActivitySkeleton rows={5} />
        ) : isError ? (
          <div className="py-8">
            <DashboardError error={error} onRetry={() => refetch()} />
          </div>
        ) : events.length ? (
          <>
            <div className="flex flex-col gap-0.5">
              {events.map((entry) => (
                <ActivityItem key={entry.id} entry={entry} />
              ))}
            </div>
            {data && (
              <ListPagination
                pagination={data.pagination}
                onPageChange={setPage}
                onPageSizeChange={(next) => {
                  setSize(next);
                  setPage(0);
                }}
              />
            )}
          </>
        ) : (
          <div className="py-8">
            <ActivityEmpty />
          </div>
        )}
      </CardContent>
    </DashboardCard>
  );
}
