"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  getDict,
  LOCALE_COOKIE,
  type Dict,
  type Locale,
} from "@/lib/i18n";

interface I18nContextValue {
  locale: Locale;
  d: Dict;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
      try {
        document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      } catch {
        /* cookies unavailable — non-fatal */
      }
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, d: getDict(locale), setLocale }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
