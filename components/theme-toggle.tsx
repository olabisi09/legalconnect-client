"use client";

import { useTheme } from "next-themes";
import { Switch } from "./ui/switch";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <Switch
      id="theme-toggle"
      checked={isDarkMode}
      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      className="data-[state=checked]:bg-lc-ink data-[state=unchecked]:bg-lc-paper"
    />
  );
}
