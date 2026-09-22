"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function SpreadExpenseFields({
  defaultSpreadMonths,
}: {
  defaultSpreadMonths?: number | null;
}) {
  const { t } = useLocale();
  const [spread, setSpread] = useState(Boolean(defaultSpreadMonths && defaultSpreadMonths > 1));

  return (
    <>
      <div className="g-check-field">
        <input
          type="checkbox"
          id="isSpread"
          name="isSpread"
          checked={spread}
          onChange={(e) => setSpread(e.target.checked)}
        />
        <label htmlFor="isSpread">{t("gestion.depenses.spreadCheckbox")}</label>
      </div>
      {spread && (
        <div className="g-field">
          <label>{t("gestion.depenses.spreadMonthsLabel")}</label>
          <input
            type="number"
            name="spreadMonths"
            min="2"
            step="1"
            defaultValue={defaultSpreadMonths && defaultSpreadMonths > 1 ? defaultSpreadMonths : 12}
            required
          />
        </div>
      )}
    </>
  );
}
