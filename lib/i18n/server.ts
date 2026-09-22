import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, dirFor, isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator, type TFunction } from "@/lib/i18n/translate";

/**
 * Server-only locale read. No client-side phone-language detection happens
 * here (that's browser-only, in LocaleProvider) — a visitor's very first
 * server render, before the client has ever written the cookie, falls back
 * to French. Expected bootstrap behavior, not a bug.
 */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export async function getServerT(): Promise<{ t: TFunction; locale: Locale; dir: "ltr" | "rtl" }> {
  const locale = await getServerLocale();
  return { t: createTranslator(locale), locale, dir: dirFor(locale) };
}
