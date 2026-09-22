"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, dirFor, isLocale, type Locale } from "@/lib/i18n/config";
import { arabicFont } from "@/lib/i18n/fonts";
import fr from "@/lib/i18n/locales/fr.json";
import ar from "@/lib/i18n/locales/ar.json";
import en from "@/lib/i18n/locales/en.json";

type Dictionary = typeof fr;
const DICTIONARIES: Record<Locale, Dictionary> = { fr, ar, en };

function readPath(dict: Dictionary, path: string): string | undefined {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined),
      dict
    ) as string | undefined;
}

function detectBrowserLocale(): Locale {
  const candidates = navigator.languages && navigator.languages.length > 0 ? navigator.languages : [navigator.language];
  for (const lang of candidates) {
    const base = lang?.slice(0, 2).toLowerCase();
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

function readCookieLocale(): Locale | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : null;
  return isLocale(value) ? value : null;
}

function writeCookieLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

// Module-level external store: the active locale is a single browser-only
// value (cookie + phone-language detection), shared across every consumer.
// useSyncExternalStore lets the client settle on it after hydration without
// the cascading-render setState-in-effect that a useState+useEffect pair
// would need, while the server snapshot keeps SSR output at the default.
let cachedLocale: Locale | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): Locale {
  if (cachedLocale === null) {
    cachedLocale = readCookieLocale() ?? detectBrowserLocale();
  }
  return cachedLocale;
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setStoreLocale(locale: Locale) {
  cachedLocale = locale;
  writeCookieLocale(locale);
  listeners.forEach((listener) => listener());
}

type LocaleContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dir = dirFor(locale);

  const t = useMemo(() => {
    const dict = DICTIONARIES[locale];
    const fallback = DICTIONARIES[DEFAULT_LOCALE];
    return (key: string) => readPath(dict, key) ?? readPath(fallback, key) ?? key;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, dir, setLocale: setStoreLocale, t }),
    [locale, dir, t]
  );

  return (
    <LocaleContext.Provider value={value}>
      <div dir={dir} lang={locale} className={dir === "rtl" ? arabicFont.variable : undefined}>
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
