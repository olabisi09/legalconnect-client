"use client";

import { type RemixiconComponentType } from "@remixicon/react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: RemixiconComponentType;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-4">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/brand/concept-a/legalconnect-icon.svg"
                alt="LegalConnect"
                width={28}
                height={28}
                className="shrink-0"
              />
              <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
                LegalConnect
              </span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                render={
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                }
              ></SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
