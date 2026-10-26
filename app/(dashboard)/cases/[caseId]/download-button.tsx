"use client";

import { RiDownload2Line } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { useDownloadDocument } from "@/hooks/features/use-documents";
import type { ClientDocument } from "@/types/document";

export function DownloadButton({
  document,
  label,
}: {
  document: ClientDocument;
  label?: string;
}) {
  const download = useDownloadDocument();
  const isDownloading =
    download.isPending && download.variables?.id === document.id;

  return (
    <Button
      variant={label ? "outline" : "ghost"}
      size={label ? "sm" : "icon-sm"}
      aria-label={`Download ${document.fileName}`}
      disabled={isDownloading}
      onClick={(e) => {
        e.stopPropagation();
        download.mutate(document);
      }}
    >
      <RiDownload2Line className={isDownloading ? "animate-pulse" : ""} />
      {label}
    </Button>
  );
}
