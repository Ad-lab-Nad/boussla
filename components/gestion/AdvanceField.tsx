"use client";

import { useState } from "react";
import { fmt } from "@/lib/gestion/format";
import { useLocale } from "@/components/i18n/LocaleProvider";

/** "Le client a payé une avance" — tick it, type the advance, and the rest
 * to pay is worked out from the order total. Saved as advanceAmount
 * (lib/gestion/actions.ts); unticked = no advance. */
export function AdvanceField({ total, defaultAdvance = 0 }: { total: number; defaultAdvance?: number }) {
  const { t } = useLocale();
  const [enabled, setEnabled] = useState(defaultAdvance > 0);
  const [amount, setAmount] = useState(defaultAdvance > 0 ? String(defaultAdvance) : "");
  const advance = Math.max(0, Number(amount.replace(",", ".")) || 0);
  const rest = Math.max(0, total - advance);

  return (
    <div className="g-advance">
      <label className="g-advance__toggle">
        <input type="checkbox" name="hasAdvance" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        {t("gestion.commandes.advanceToggle")}
      </label>
      {enabled && (
        <div className="g-advance__row">
          <div className="g-field">
            <label htmlFor="advance-amount">{t("gestion.commandes.advanceLabel")}</label>
            <input
              id="advance-amount"
              type="number"
              name="advanceAmount"
              min="0"
              max={total || undefined}
              step="0.001"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="g-advance__rest">
            {advance >= total && total > 0 ? (
              <span className="g-advance__paid">{t("gestion.commandes.advanceCoversAll")}</span>
            ) : (
              <>
                <span>{t("gestion.commandes.remainingLabel")}</span>
                <strong className="num">{fmt(rest)}</strong>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
