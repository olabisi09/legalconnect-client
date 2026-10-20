"use client";

import { useTheme } from "next-themes";
import Link from "next/link";

export function AppLogo() {
  const { resolvedTheme: theme } = useTheme();
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span
        className={[
          "flex h-6.5 w-6.5 items-center justify-center rounded-sm border-[1.5px] font-plexmono text-[11px] font-semibold",
          theme === "light"
            ? "border-lc-ink text-lc-ink"
            : "border-lc-paper text-lc-paper",
        ].join(" ")}
      >
        LC
      </span>
      <span
        className={[
          "font-newsreader text-lg font-medium tracking-tight",
          theme === "light" ? "text-lc-ink" : "text-lc-paper",
        ].join(" ")}
      >
        LegalConnect
      </span>
    </Link>
  );
}

export function AppLogoDark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-6.5 w-6.5 items-center justify-center rounded-sm border-[1.5px] border-lc-paper font-plexmono text-[11px] font-semibold text-lc-paper">
        LC
      </span>
      <span className="font-newsreader text-lg font-medium tracking-tight text-lc-paper">
        LegalConnect
      </span>
    </Link>
  );
}

export function AppLogoLight() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-6.5 w-6.5 items-center justify-center rounded-sm border-[1.5px] border-lc-ink font-plexmono text-[11px] font-semibold text-lc-ink">
        LC
      </span>
      <span className="font-newsreader text-lg font-medium tracking-tight text-lc-ink">
        LegalConnect
      </span>
    </Link>
  );
}
