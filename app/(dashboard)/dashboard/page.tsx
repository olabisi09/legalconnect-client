import { DashboardGreeting } from "./greeting";
import { DashboardStats } from "./stats";
import { UpcomingDeadlines } from "./upcoming-deadlines";
import { RecentActivity } from "./recent-activity";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <DashboardGreeting />
      <div className="grid grid-cols-1 gap-px bg-border p-px sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStats />
      </div>
      <div className="grid grid-cols-1 gap-px bg-border p-px lg:grid-cols-2">
        <UpcomingDeadlines />
        <RecentActivity />
      </div>
    </div>
  );
}
