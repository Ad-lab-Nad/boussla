"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, dirFor, isLocale, type Locale } from "@/lib/i18n/config";
import { arabicFont } from "@/lib/i18n/fonts";
import { createTranslator, type TFunction } from "@/lib/i18n/translate";

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
// would need.
let cachedLocale: Locale | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): Locale {
  if (cachedLocale === null) {
    cachedLocale = readCookieLocale() ?? detectBrowserLocale();
  }
  return cachedLocale;
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
  t: TFunction;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  mirrorLayout = false,
  initialLocale,
}: {
  children: ReactNode;
  /**
   * Whether to actually flip the DOM to `dir="rtl"`/swap the Arabic font for
   * this subtree. Defaults to false so untranslated content never mirrors
   * with mismatched text. Pass true only once everything inside is actually
   * translated.
   */
  mirrorLayout?: boolean;
  /** Locale the server already resolved from the cookie (see
   * lib/i18n/server.ts), so SSR markup matches instead of always starting
   * from the default. */
  initialLocale?: Locale;
}) {
  // A per-render closure (not module-level shared state, which would risk
  // leaking one request's locale into another's concurrent SSR render) —
  // only used for the SSR pass and the client's first hydration snapshot,
  // so it matches what the server already saw in the cookie.
  const getServerSnapshot = useCallback(() => initialLocale ?? DEFAULT_LOCALE, [initialLocale]);
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dir = mirrorLayout ? dirFor(locale) : "ltr";

  const t = useMemo(() => createTranslator(locale), [locale]);

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
