"use client";

import { DashboardCard } from "@/components/dashboard-card";
import { CardContent } from "@/components/ui/card";
import { DASHBOARD_LOCALE } from "@/lib/formatter";
import { useAuthStore } from "@/store/auth-store";
import { useIsClient } from "@/hooks/use-is-client";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function GreetingText() {
  const user = useAuthStore((state) => state.user);

  const now = new Date();
  const today = now.toLocaleDateString(DASHBOARD_LOCALE, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <p className="font-plexmono text-[11px] uppercase tracking-wider text-lc-slate">
        {today}
      </p>
      <h1 className="font-newsreader text-2xl font-medium text-foreground">
        {greetingForHour(now.getHours())}
        {user?.firstName ? `, ${user.firstName}` : ""}
      </h1>
      {user?.firmName && (
        <p className="text-xs text-muted-foreground">{user.firmName}</p>
      )}
    </>
  );
}

export function DashboardGreeting({ className }: { className?: string }) {
  const isClient = useIsClient();

  return (
    <DashboardCard className={className}>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-14">{isClient && <GreetingText />}</div>
      </CardContent>
    </DashboardCard>
  );
}
