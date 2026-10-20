"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiFolderLine,
  RiGovernmentLine,
  RiReceiptLine,
  RiCalendarLine,
  RiFileSearchLine,
  RiScrollToBottomLine,
  RiBuilding2Line,
  RiSettings3Line,
  RiExpandUpDownLine,
  RiLogoutBoxRLine,
  RiHomeLine,
  RiUserLine,
} from "@remixicon/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth-store";
import { useLogout } from "@/hooks/features/use-auth";
import { getInitials } from "@/lib/utils";
import { P, Permission } from "@/lib/permissions";
import { usePermission } from "@/hooks/use-permission";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: Permission;
}

const practiceNav = [
  { title: "Dashboard", href: "/dashboard", icon: RiHomeLine },
  { title: "Case Management", href: "/cases", icon: RiFolderLine },
  { title: "Events", href: "/events", icon: RiCalendarLine },
  // {
  //   title: "Conflict Check",
  //   href: "/conflicts",
  //   icon: RiFileSearchLine,
  // },
  {
    title: "Hearings",
    href: "/hearings",
    icon: RiFileSearchLine,
  },
];

const financeNav = [
  {
    title: "Trust Accounting",
    href: "/trust",
    icon: RiGovernmentLine,
  },
  { title: "Billing", href: "/billing", icon: RiReceiptLine },
];

const firmNav = [
  {
    title: "Audit Logs",
    href: "/audit-logs",
    icon: RiScrollToBottomLine,
    permission: P.REPORTING_READ,
  },
  {
    title: "Organizations",
    href: "/organizations",
    icon: RiBuilding2Line,
    permission: P.ORGANIZATION_READ,
  },
  { title: "Profile", href: "/profile", icon: RiUserLine },
  { title: "Settings", href: "/settings", icon: RiSettings3Line },
];

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  const { has } = usePermission();
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-plexmono text-[10px] tracking-widest text-sidebar-foreground/45">
        {label}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items
          .filter((x) => !x.permission || has(x.permission))
          .map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                isActive={pathname.startsWith(item.href)}
                render={
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                }
              />
            </SidebarMenuItem>
          ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border-[1.5px] border-sidebar-foreground/40 font-plexmono text-[11px] font-semibold text-sidebar-foreground">
            LC
          </span>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate font-newsreader text-sm font-medium text-sidebar-foreground">
              LegalConnect
            </span>
            <span className="font-plexmono text-[10px] text-sidebar-foreground/50">
              {user?.orgName || "No organization"}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="PRACTICE" items={practiceNav} pathname={pathname} />
        <NavGroup label="FINANCE" items={financeNav} pathname={pathname} />
        <NavGroup label="FIRM" items={firmNav} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent">
                    <Avatar className="h-6 w-6 rounded-sm">
                      <AvatarFallback className="rounded-sm bg-sidebar-accent text-[10px] text-sidebar-foreground">
                        {getInitials(`${user?.firstName} ${user?.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <RiExpandUpDownLine className="ml-auto h-4 w-4 opacity-50" />
                  </SidebarMenuButton>
                }
              />

              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem
                  render={<Link href="/settings">Account settings</Link>}
                />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isLoggingOut}
                  onClick={() => {
                    logout(undefined);
                  }}
                  variant="destructive"
                >
                  <RiLogoutBoxRLine />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
