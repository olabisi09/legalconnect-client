"use client";

import { use } from "react";
import Link from "next/link";
import { RiArrowLeftSLine } from "@remixicon/react";

import { CardContent } from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard-card";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCase } from "@/hooks/features/use-cases";
import { useRedirectIfRemovedFromCase } from "@/hooks/use-case-access";
import { formatDate } from "@/lib/formatter";
import { formatEnum } from "@/lib/utils";
import { DashboardError } from "../../dashboard/dashboard-error";
import { CaseDeadlines } from "./case-deadlines";
import { CaseTimeline } from "./case-timeline";
import { CaseDocuments } from "./case-documents";

function BackToCases() {
  return (
    <Link
      href="/cases"
      className="inline-flex w-fit items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
    >
      <RiArrowLeftSLine className="size-4" />
      All cases
    </Link>
  );
}

export function CaseDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <BackToCases />
      <DashboardCard>
        <CardContent className="space-y-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </DashboardCard>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-plexmono text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="truncate text-[13px] text-foreground">{value}</dd>
    </div>
  );
}

export function CaseDetail({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = use(params);
  const { data, isLoading, isError, error, refetch } = useCase(caseId);
  const removed = useRedirectIfRemovedFromCase(error);

  if (isLoading || removed) return <CaseDetailSkeleton />;

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-4">
        <BackToCases />
        <DashboardCard>
          <CardContent className="py-8">
            <DashboardError error={error} onRetry={() => refetch()} />
          </CardContent>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <BackToCases />

      <DashboardCard>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-plexmono text-[11px] uppercase tracking-wider text-lc-slate">
                {data.caseNumber}
              </p>
              <h1 className="font-newsreader text-2xl font-medium text-foreground">
                {data.title}
              </h1>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <StatusBadge value={data.status} />
              {data.priority && <StatusBadge value={data.priority} />}
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Fact label="Stage" value={formatEnum(data.stage)} />
            <Fact label="Type" value={formatEnum(data.caseType)} />
            <Fact label="Practice area" value={formatEnum(data.practiceArea)} />
            <Fact
              label="Opened"
              value={data.openedAt ? formatDate(data.openedAt.slice(0, 10)) : "—"}
            />
          </dl>

          {data.description && (
            <p className="max-w-3xl whitespace-pre-line text-[13px] leading-relaxed text-muted-foreground">
              {data.description}
            </p>
          )}
        </CardContent>
      </DashboardCard>

      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">Deadlines</TabsTrigger>
          <TabsTrigger value="timeline">Court updates</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <CaseDeadlines caseId={caseId} />
        </TabsContent>
        <TabsContent value="timeline">
          <CaseTimeline caseId={caseId} />
        </TabsContent>
        <TabsContent value="documents">
          <CaseDocuments caseId={caseId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
