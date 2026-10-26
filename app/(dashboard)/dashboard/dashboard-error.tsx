"use client";

import { AppEmpty } from "@/components/app-empty";
import { Button } from "@/components/ui/button";
import { normalizeApiError } from "@/lib/error";
import { RiErrorWarningLine } from "@remixicon/react";

export function DashboardError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  // Every /client/** route is a 404 while the portal is switched off app-wide.
  const portalOff = normalizeApiError(error).status === 404;

  return (
    <AppEmpty
      title={portalOff ? "Client portal unavailable" : "Couldn't load this"}
      description={
        portalOff
          ? "The portal is temporarily switched off. Please check back later."
          : "Something went wrong while fetching your information."
      }
      icon={<RiErrorWarningLine />}
    >
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </AppEmpty>
  );
}
