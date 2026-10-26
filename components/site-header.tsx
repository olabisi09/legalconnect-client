"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Notifications } from "./notifications";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const pathname = usePathname();

  const routeMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/matters": "Matters",
    "/profile": "Profile",
    "/activity": "Activity",
    "/cases": "Cases",
    "/calendar": "Calendar",
  };
  // Prefix match so nested routes like /cases/[caseId] keep their section title.
  const title =
    Object.entries(routeMap).find(
      ([route]) => pathname === route || pathname.startsWith(`${route}/`),
    )?.[1] ?? "Dashboard";
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-1">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Notifications />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
