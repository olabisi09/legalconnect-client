"use client";

import { useState } from "react";
import { RiFolderOpenLine, RiSearchLine } from "@remixicon/react";

import { CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { DashboardCard } from "@/components/dashboard-card";
import { AppEmpty } from "@/components/app-empty";
import { ListPagination } from "@/components/list-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useCaseDocuments } from "@/hooks/features/use-documents";
import { useRedirectIfRemovedFromCase } from "@/hooks/use-case-access";
import { useDebounce } from "@/hooks/use-debounce";
import { formatBytes, formatDate } from "@/lib/formatter";
import { DashboardError } from "../../dashboard/dashboard-error";
import { DocumentFileIcon } from "./document-file-icon";
import { DocumentSheet } from "./document-sheet";
import { DownloadButton } from "./download-button";

export function CaseDocuments({ caseId }: { caseId: string }) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [search, setSearch] = useState("");
  const [openDocumentId, setOpenDocumentId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search.trim(), 400);

  const { data, isLoading, isError, error, refetch } = useCaseDocuments(
    caseId,
    { page, size, search: debouncedSearch || undefined },
  );
  useRedirectIfRemovedFromCase(error);
  const documents = data?.data ?? [];

  return (
    <DashboardCard>
      <CardContent className="flex flex-col gap-4">
        <InputGroup className="sm:max-w-xs">
          <InputGroupAddon>
            <RiSearchLine />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search documents"
            aria-label="Search documents"
          />
        </InputGroup>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-8">
            <DashboardError error={error} onRetry={() => refetch()} />
          </div>
        ) : documents.length ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Size</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Updated
                  </TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Download</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="max-w-0 w-full py-3">
                      <button
                        type="button"
                        onClick={() => setOpenDocumentId(doc.id)}
                        className="flex w-full min-w-0 items-center gap-3 text-left"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] border border-border bg-lc-paper-warm text-lc-slate">
                          <DocumentFileIcon
                            fileName={doc.fileName}
                            fileType={doc.fileType}
                            className="size-4"
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium text-foreground hover:underline">
                            {doc.fileName}
                          </span>
                          {doc.description && (
                            <span className="block truncate text-[11.5px] text-muted-foreground">
                              {doc.description}
                            </span>
                          )}
                        </span>
                      </button>
                    </TableCell>
                    <TableCell className="hidden font-plexmono text-[11px] text-muted-foreground sm:table-cell">
                      {doc.fileSize ? formatBytes(doc.fileSize) : "—"}
                    </TableCell>
                    <TableCell className="hidden font-plexmono text-[11px] text-muted-foreground md:table-cell">
                      {doc.updatedAt || doc.createdAt
                        ? formatDate(
                            (doc.updatedAt ?? doc.createdAt)!.slice(0, 10),
                          )
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <DownloadButton document={doc} />
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
              title={debouncedSearch ? "No matching documents" : "No documents yet"}
              description={
                debouncedSearch
                  ? "Try a different search."
                  : "Documents your law firm shares with you on this case will show up here."
              }
              icon={<RiFolderOpenLine />}
            />
          </div>
        )}
      </CardContent>

      <DocumentSheet
        documentId={openDocumentId}
        onClose={() => setOpenDocumentId(null)}
      />
    </DashboardCard>
  );
}
