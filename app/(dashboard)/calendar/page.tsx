import { generateMeta } from "@/lib/utils";
import { CalendarView } from "./calendar-view";

export const metadata = generateMeta({
  title: "Calendar",
  description: "Hearings, court dates, meetings and deadlines across your cases.",
});

export default function CalendarPage() {
  return <CalendarView />;
}
