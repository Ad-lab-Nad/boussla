"use client";

import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span className="g-hint" style={{ margin: 0 }}>
        {t("settings.language.label")}
      </span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as (typeof LOCALES)[number])}
        aria-label={t("settings.language.label")}
      >
        {LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_LABELS[loc]}
          </option>
        ))}
      </select>
    </label>
  );
}
