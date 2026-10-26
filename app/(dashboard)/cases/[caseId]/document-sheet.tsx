"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocument } from "@/hooks/features/use-documents";
import { formatBytes, formatDateString } from "@/lib/formatter";
import { formatEnum } from "@/lib/utils";
import { DashboardError } from "../../dashboard/dashboard-error";
import { DocumentFileIcon } from "./document-file-icon";
import { DownloadButton } from "./download-button";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 text-[12.5px] last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right text-foreground">{value}</dd>
    </div>
  );
}

export function DocumentSheet({
  documentId,
  onClose,
}: {
  documentId: string | null;
  onClose: () => void;
}) {
  const { data, isLoading, isError, error, refetch } = useDocument(documentId);

  return (
    <Sheet open={!!documentId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        {isLoading || !data ? (
          <SheetHeader>
            <SheetTitle className="sr-only">Document</SheetTitle>
            {isError ? (
              <div className="py-8">
                <DashboardError error={error} onRetry={() => refetch()} />
              </div>
            ) : (
              <div className="space-y-3">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-24 w-full" />
              </div>
            )}
          </SheetHeader>
        ) : (
          <>
            <SheetHeader>
              <span className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-border bg-lc-paper-warm text-lc-slate">
                <DocumentFileIcon
                  fileName={data.fileName}
                  fileType={data.fileType}
                  className="size-5"
                />
              </span>
              <SheetTitle className="break-all font-newsreader text-lg font-medium">
                {data.fileName}
              </SheetTitle>
              {data.description && (
                <SheetDescription>{data.description}</SheetDescription>
              )}
            </SheetHeader>

            <dl className="px-4">
              <Row label="Type" value={data.fileType || "—"} />
              <Row
                label="Size"
                value={data.fileSize ? formatBytes(data.fileSize) : "—"}
              />
              <Row label="Status" value={formatEnum(data.status)} />
              {data.currentVersionNumber != null && (
                <Row label="Version" value={`v${data.currentVersionNumber}`} />
              )}
              {data.createdAt && (
                <Row label="Added" value={formatDateString(data.createdAt)} />
              )}
              {data.updatedAt && (
                <Row label="Updated" value={formatDateString(data.updatedAt)} />
              )}
            </dl>

            <SheetFooter>
              <DownloadButton document={data} label="Download" />
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
