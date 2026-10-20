"use client";

import { usePermission } from "@/hooks/use-permission";
import { matchRoutePermission, Permission } from "@/lib/permissions";
import { usePathname } from "next/navigation";
import { Forbidden } from "./forbidden";

export function PermissionGuard({
  permissions,
  children,
  areAllRequired = false,
  fallback,
}: {
  permissions: Permission[];
  children: React.ReactNode;
  areAllRequired?: boolean;
  fallback?: React.ReactNode;
}) {
  const { hasAny, hasAll } = usePermission();

  const hasAccess = areAllRequired ? hasAll(permissions) : hasAny(permissions);

  if (!hasAccess) {
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const required = matchRoutePermission(pathname);

  const { has, isReady } = usePermission();

  if (!required) return <>{children}</>;

  if (!isReady) return null;

  if (!has(required)) {
    return <Forbidden requiredPermission={required} />;
  }

  return <>{children}</>;
}
