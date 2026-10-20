"use client";

import { hasPermission, Permission } from "@/lib/permissions";
import { useAuthStore } from "@/store/auth-store";

export function usePermission() {
  const permissions = useAuthStore((s) => s.user?.permissions || []);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  return {
    has: (code: Permission | Permission[]) => hasPermission(permissions, code),
    hasAny: (codes: Permission[]) =>
      codes.some((code) => hasPermission(permissions, code)),
    hasAll: (codes: Permission[]) =>
      codes.every((code) => hasPermission(permissions, code)),
    isReady: isHydrated,
  };
}
