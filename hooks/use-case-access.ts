"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { normalizeApiError } from "@/lib/error";

/**
 * A client removed from a case gets 404 on its detail, timeline, deadlines,
 * documents and invoices. Treat that as "no longer on this case" and send them
 * back to their case list.
 */
export function useRedirectIfRemovedFromCase(error: unknown) {
  const router = useRouter();
  const removed = !!error && normalizeApiError(error).status === 404;

  useEffect(() => {
    if (!removed) return;
    toast.error("You no longer have access to that case.");
    router.replace("/cases");
  }, [removed, router]);

  return removed;
}
