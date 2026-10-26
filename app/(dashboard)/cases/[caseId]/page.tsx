import { Suspense } from "react";
import { generateMeta } from "@/lib/utils";
import { CaseDetail, CaseDetailSkeleton } from "./case-detail";

export const metadata = generateMeta({
  title: "Case",
  description: "Case details, court updates, deadlines and shared documents.",
});

export default function CasePage({ params }: PageProps<"/cases/[caseId]">) {
  // params is request-time data; with cacheComponents it must resolve inside Suspense.
  return (
    <Suspense fallback={<CaseDetailSkeleton />}>
      <CaseDetail params={params} />
    </Suspense>
  );
}
