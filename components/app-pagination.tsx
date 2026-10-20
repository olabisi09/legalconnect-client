"use client";

import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { getPaginationRange } from "@/lib/get-pagination-range";

interface AppPaginationProps {
  /** 0-based, matches TanStack's pageIndex */
  pageIndex: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function AppPagination({
  pageIndex,
  pageCount,
  canPreviousPage,
  canNextPage,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
}: AppPaginationProps) {
  const pages = getPaginationRange(pageIndex, pageCount);

  return (
    <Pagination>
      <PaginationContent className="w-full justify-between">
        <PaginationItem>
          <span className="text-muted-foreground text-sm">
            Page{" "}
            <span className="text-foreground font-medium">{pageIndex + 1}</span>{" "}
            of <span className="text-foreground font-medium">{pageCount}</span>
          </span>
        </PaginationItem>

        <PaginationItem className="flex items-center gap-1">
          <PaginationPrevious
            href="#"
            aria-disabled={!canPreviousPage}
            className={
              !canPreviousPage ? "pointer-events-none opacity-50" : undefined
            }
            onClick={(e) => {
              e.preventDefault();
              if (canPreviousPage) onPageChange(pageIndex - 1);
            }}
          />

          {pages.map((page, i) =>
            page === "ellipsis" ? (
              <PaginationEllipsis key={`ellipsis-${i}`} />
            ) : (
              <PaginationLink
                key={page}
                href="#"
                isActive={page === pageIndex}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}
              >
                {page + 1}
              </PaginationLink>
            ),
          )}

          <PaginationNext
            href="#"
            aria-disabled={!canNextPage}
            className={
              !canNextPage ? "pointer-events-none opacity-50" : undefined
            }
            onClick={(e) => {
              e.preventDefault();
              if (canNextPage) onPageChange(pageIndex + 1);
            }}
          />
        </PaginationItem>

        <PaginationItem>
          <NativeSelect
            className="w-28"
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <NativeSelectOption key={size} value={String(size)}>
                {size} / page
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
