import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import fr from "@/lib/i18n/locales/fr.json";
import ar from "@/lib/i18n/locales/ar.json";
import en from "@/lib/i18n/locales/en.json";

type Dictionary = typeof fr;
const DICTIONARIES: Record<Locale, Dictionary> = { fr, ar, en };

export type TFunction = (key: string, params?: Record<string, string | number>) => string;

function readPath(dict: Dictionary, path: string): string | undefined {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined),
      dict
    ) as string | undefined;
}

/** Replaces `{name}` tokens with `params.name`. A missing param is left
 * visible as `{name}` rather than silently blank, so a forgotten param is
 * loud during QA instead of hiding in the UI. */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key];
    return value === undefined ? match : String(value);
  });
}

/** One translator per locale, resolving a key against that locale's
 * dictionary and falling back to fr then to the raw key. Shared by both the
 * client LocaleProvider and the server-side getServerT(). */
export function createTranslator(locale: Locale): TFunction {
  const dict = DICTIONARIES[locale];
  const fallback = DICTIONARIES[DEFAULT_LOCALE];
  return (key, params) => interpolate(readPath(dict, key) ?? readPath(fallback, key) ?? key, params);
}

/**
 * Picks between two pre-formatted strings by count. A deliberate
 * simplification: real Arabic has 6 plural categories (zero/one/two/few/
 * many/other), but this app only distinguishes "one" vs "other" for all
 * three locales — imprecise for Arabic, slightly off for French's treatment
 * of 0, but adequate for a small-business tool. Callers build each branch
 * with t() themselves (e.g. `plural(n, { one: t("...one", {n}), other:
 * t("...other", {n}) })`), so this helper stays a trivial count check.
 */
export function plural(n: number, forms: { one: string; other: string }): string {
  return n === 1 ? forms.one : forms.other;
}
