"use client";

import { useTable, type ColumnDef, type RowData } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { features } from "./data-table-features";
import { Skeleton } from "./ui/skeleton";
import { AppPagination } from "./app-pagination";
import { Fragment } from "react/jsx-runtime";

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<typeof features, TData>[];
  data: TData[];
  emptyText?: string;
  emptyComponent?: React.ReactNode;
  loading?: boolean;
  isRowClickable?: boolean;
  onRowClick?: (row: TData) => void;
  pagination?: {
    /** 1-based page number */
    pageNumber: number;
    pageSize: number;
    onPageChange: (pageNumber: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    totalItems: number;
  };
  details?: (row: TData) => React.ReactNode;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  emptyText = "No results.",
  emptyComponent,
  loading = false,
  isRowClickable = false,
  onRowClick,
  pagination,
  details,
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    data,
    columns,
    getRowCanExpand: () => true,
    manualPagination: true,
    rowCount: pagination?.totalItems,
  });

  const totalPages = pagination
    ? Math.ceil(pagination.totalItems / pagination.pageSize)
    : 0;

  return (
    <div>
      <div className="w-full min-w-0 overflow-x-auto border">
        <Table className="min-w-max">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: columns.length }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full rounded-none" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      if (isRowClickable) onRowClick?.(row.original);
                      if (details) row.getToggleExpandedHandler()();
                    }}
                    className={
                      isRowClickable || details ? "cursor-pointer" : ""
                    }
                    data-page-number={pagination?.pageNumber}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell colSpan={row.getAllCells().length}>
                        {row.getIsExpanded() && details?.(row.original)}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyComponent ?? emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <div className="py-4">
          <AppPagination
            pageIndex={pagination?.pageNumber}
            pageCount={totalPages}
            canPreviousPage={table.getCanPreviousPage()}
            canNextPage={table.getCanNextPage()}
            pageSize={pagination?.pageSize ?? 0}
            onPageChange={(index) => pagination?.onPageChange(index)}
            onPageSizeChange={(size) => pagination?.onPageSizeChange(size)}
          />
        </div>
      )}
    </div>
  );
}
