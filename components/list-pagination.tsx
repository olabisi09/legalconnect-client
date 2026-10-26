"use client";

import { AppPagination } from "@/components/app-pagination";
import type { PagedResponse } from "@/types/shared";

/** AppPagination driven by a PagedResponse; hidden when everything fits on one page. */
export function ListPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
}: {
  pagination: PagedResponse<unknown>["pagination"];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  if (pagination.totalPages <= 1 && !pagination.hasPrevious) return null;

  return (
    <AppPagination
      pageIndex={pagination.page}
      pageCount={Math.max(pagination.totalPages, 1)}
      canPreviousPage={pagination.hasPrevious}
      canNextPage={pagination.hasNext}
      pageSize={pagination.size}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
