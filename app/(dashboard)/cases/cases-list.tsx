"use client";

import { useState } from "react";
import Link from "next/link";
import { RiArrowRightSLine, RiBriefcase4Line } from "@remixicon/react";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardCard } from "@/components/dashboard-card";
import { AppEmpty } from "@/components/app-empty";
import { StatusBadge } from "@/components/status-badge";
import { ListPagination } from "@/components/list-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useCases } from "@/hooks/features/use-cases";
import { formatDate } from "@/lib/formatter";
import { formatEnum } from "@/lib/utils";
import { DashboardError } from "../dashboard/dashboard-error";

const DEFAULT_PAGE_SIZE = 20;

export function CasesList() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const { data, isLoading, isError, error, refetch } = useCases({
    page,
    size,
  });
  const cases = data?.data ?? [];

  return (
    <DashboardCard>
      <CardHeader>
        <CardTitle>Your cases</CardTitle>
        <CardDescription>
          Cases your law firm has shared with you in the portal.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-8">
            <DashboardError error={error} onRetry={() => refetch()} />
          </div>
        ) : cases.length ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Stage</TableHead>
                  <TableHead className="hidden md:table-cell">Opened</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((c) => (
                  <TableRow key={c.id} className="relative">
                    <TableCell className="max-w-0 w-full py-3">
                      {/* The link's ::after covers the row, so the whole row is clickable. */}
                      <Link
                        href={`/cases/${c.id}`}
                        className="block truncate text-[13px] font-medium text-foreground after:absolute after:inset-0"
                      >
                        {c.title}
                      </Link>
                      <p className="font-plexmono text-[10.5px] text-muted-foreground">
                        {c.caseNumber}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={c.status} />
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatEnum(c.stage)}
                    </TableCell>
                    <TableCell className="hidden font-plexmono text-[11px] text-muted-foreground md:table-cell">
                      {c.openedAt ? formatDate(c.openedAt.slice(0, 10)) : "—"}
                    </TableCell>
                    <TableCell>
                      <RiArrowRightSLine className="size-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

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
            <AppEmpty
              title={page > 0 ? "No more cases" : "No cases yet"}
              description="When your law firm links a case to your account, it will show up here."
              icon={<RiBriefcase4Line />}
            />
          </div>
        )}
      </CardContent>
    </DashboardCard>
  );
}
