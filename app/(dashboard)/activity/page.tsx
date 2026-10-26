import { generateMeta } from "@/lib/utils";
import { ActivityFeed } from "./activity-feed";

export const metadata = generateMeta({
  title: "Activity",
  description: "Court updates across your cases.",
});

export default function ActivityPage() {
  return <ActivityFeed />;
}
