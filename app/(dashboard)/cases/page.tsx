import { generateMeta } from "@/lib/utils";
import { CasesList } from "./cases-list";

export const metadata = generateMeta({
  title: "Cases",
  description: "The cases your law firm is handling for you.",
});

export default function CasesPage() {
  return <CasesList />;
}
