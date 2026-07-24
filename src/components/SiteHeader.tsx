"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "./I18nProvider";

export function SiteHeader() {
  const { d } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-[color-mix(in_srgb,var(--background)_75%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5 focus-ring rounded-lg">
          <Logo size={34} className="transition-transform duration-300 group-hover:rotate-6" />
          <span className="text-lg font-semibold tracking-tight">
            Form<span className="text-gradient">Pilot</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <a
            href="#how-it-works"
            className="hidden rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-foreground sm:inline-block"
          >
            {d.header.howItWorks}
          </a>
          <a
            href="#faq"
            className="hidden rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-foreground sm:inline-block"
          >
            {d.header.faq}
          </a>
          <LanguageSwitcher />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
