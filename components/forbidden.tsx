"use client";

import Link from "next/link";
import { RiLockLine } from "@remixicon/react";
import type { Permission } from "@/lib/permissions"; // adjust to wherever PERMISSIONS/Permission actually live

export function Forbidden({
  title = "This file is sealed",
  message = "You don't have permission to view this page. Contact your firm administrator if you believe this is a mistake.",
  requiredPermission,
}: {
  title?: string;
  message?: string;
  requiredPermission?: Permission | Permission[];
}) {
  const permissions = Array.isArray(requiredPermission)
    ? requiredPermission
    : requiredPermission
      ? [requiredPermission]
      : [];

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border-[1.5px] border-lc-stamp text-lc-stamp">
        <RiLockLine className="h-6 w-6" />
      </span>

      <p className="mt-6 font-plexmono text-[11px] font-semibold uppercase tracking-[0.14em] text-lc-stamp">
        § Access Restricted
      </p>
      <h1 className="mt-2 font-newsreader text-2xl font-medium text-foreground">
        {title}
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>

      {permissions.length > 0 ? (
        <p className="mt-4 rounded-[3px] border border-border bg-secondary px-3 py-1.5 font-plexmono text-[11px] text-muted-foreground">
          Requires: {permissions.join(", ")}
        </p>
      ) : null}

      <Link
        href="/dashboard"
        className="mt-6 text-sm font-medium text-lc-ink underline underline-offset-2"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
