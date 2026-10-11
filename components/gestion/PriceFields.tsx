"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";

type Unit = "DT" | "MILLIMES";

function convert(value: string, to: Unit): string {
  const n = Number(value.replace(",", "."));
  if (value.trim() === "" || !Number.isFinite(n)) return value;
  return to === "MILLIMES" ? String(Math.round(n * 1000)) : String(Math.round(n) / 1000);
}

/** Sell price + unit cost, typed in dinars or millimes — many Tunisian
 * shops price small items in millimes ("700" for a 0,700 DT brik), which
 * otherwise got saved as 700 DT. Prices are always stored in DT: with
 * priceUnit=MILLIMES the server divides by 1000 (lib/gestion/actions.ts).
 * Switching the unit converts what's already typed. */
export function PriceFields({ sellPrice, unitCost }: { sellPrice?: number; unitCost?: number }) {
  const { t } = useLocale();
  const [unit, setUnit] = useState<Unit>("DT");
  const [sell, setSell] = useState(sellPrice === undefined ? "" : String(sellPrice));
  const [cost, setCost] = useState(unitCost === undefined ? "" : String(unitCost));

  function pick(next: Unit) {
    if (next === unit) return;
    setUnit(next);
    setSell((v) => convert(v, next));
    setCost((v) => convert(v, next));
  }

  const unitLabel = t(unit === "DT" ? "gestion.produits.unitDt" : "gestion.produits.unitMillime");
  const step = unit === "DT" ? "0.001" : "1";

  return (
    <>
      <input type="hidden" name="priceUnit" value={unit} />
      <div className="g-field g-field--full">
        <label>{t("gestion.produits.priceUnitLabel")}</label>
        <div className="g-seg" role="radiogroup">
          {(["DT", "MILLIMES"] as const).map((u) => (
            <button
              key={u}
              type="button"
              role="radio"
              aria-checked={unit === u}
              className={unit === u ? "is-on" : undefined}
              onClick={() => pick(u)}
            >
              {t(u === "DT" ? "gestion.produits.priceUnitDinar" : "gestion.produits.priceUnitMillime")}
            </button>
          ))}
        </div>
        <span className="g-field-hint">
          {t(unit === "DT" ? "gestion.produits.priceExampleDinar" : "gestion.produits.priceExampleMillime")}
        </span>
      </div>
      <div className="g-field">
        <label>{t("gestion.produits.sellPriceIn", { unit: unitLabel })}</label>
        <input type="number" name="sellPrice" min="0" step={step} inputMode="decimal" value={sell} onChange={(e) => setSell(e.target.value)} required />
      </div>
      <div className="g-field">
        <label>{t("gestion.produits.unitCostIn", { unit: unitLabel })}</label>
        <input type="number" name="unitCost" min="0" step={step} inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} required />
      </div>
    </>
  );
}
