"use client";

import { Moon, Sun } from "lucide-react";
import { Tooltip } from "./ui/Tooltip";

export function ThemeToggle() {
  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("fp-theme", isDark ? "dark" : "light");
    } catch {
      /* storage unavailable — non-fatal */
    }
  }

  return (
    <Tooltip content="Toggle light / dark" side="bottom">
      <button
        type="button"
        onClick={toggle}
        aria-label="Toggle color theme"
        className="group grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-foreground transition-colors hover:bg-surface-2 focus-ring"
      >
        <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-transform duration-300 group-hover:rotate-45 dark:hidden" />
        <Moon className="hidden h-[18px] w-[18px] transition-transform duration-300 group-hover:-rotate-12 dark:block" />
      </button>
    </Tooltip>
  );
}
