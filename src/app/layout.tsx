import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { I18nProvider } from "@/components/I18nProvider";
import {
  LOCALE_COOKIE,
  localeFromAcceptLanguage,
  parseLocale,
  type Locale,
} from "@/lib/i18n";
import { SITE } from "@/lib/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://formpilot.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Short label for the browser tab; richer titles are set on openGraph/twitter.
  title: {
    default: "FormPilot",
    template: "%s · FormPilot",
  },
  description:
    "Paste a Google Form link, review the parsed questions, define weighted or random answers per question, and submit real responses in bulk — no spreadsheets, no code.",
  applicationName: "FormPilot",
  keywords: [
    "Google Forms",
    "form filler",
    "auto fill forms",
    "survey testing",
    "response generator",
    "weighted random answers",
    "form automation",
  ],
  authors: [{ name: SITE.author, url: SITE.github }],
  creator: SITE.author,
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "FormPilot",
    title: "FormPilot — Auto-fill Google Forms with smart answer distributions",
    description:
      "Parse any public Google Form, configure per-question answer strategies, and generate realistic responses on a schedule you control.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FormPilot — Auto-fill Google Forms",
    description:
      "Parse a Google Form, set weighted answer distributions, and submit real responses in bulk.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  category: "productivity",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#07070d" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Runs before hydration to apply the saved theme and avoid a flash.
const themeInit = `(function(){try{var t=localStorage.getItem('fp-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d){document.documentElement.classList.add('dark');}}catch(e){}})();`;

async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  if (fromCookie) return fromCookie;
  const headerStore = await headers();
  return localeFromAcceptLanguage(headerStore.get("accept-language"));
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await resolveLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-dvh flex flex-col">
        <I18nProvider initialLocale={locale}>
          <SiteHeader />
          <main className="flex-1 w-full">{children}</main>
          <SiteFooter />
        </I18nProvider>
      </body>
    </html>
  );
}
