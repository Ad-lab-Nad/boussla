"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";

type Unit = "DT" | "MILLIMES";

/** A whole number of 100 or more typed as dinars is most likely millimes
 * (a 6,500 DT jar of jam typed as "6500"). */
function looksLikeMillimes(value: string): boolean {
  const n = Number(value.replace(",", "."));
  return Number.isInteger(n) && n >= 100;
}

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

  // Values the user confirmed really are dinars — no warning for those.
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const suspect = unit === "DT" ? [sell, cost].find((v) => looksLikeMillimes(v) && !confirmed.includes(v)) : undefined;
  const guardRef = useRef<HTMLInputElement>(null);
  const warning = suspect
    ? t("gestion.produits.millimesWarning", { typed: suspect, dt: (Number(suspect) / 1000).toFixed(3).replace(".", ",") })
    : "";
  // Blocks the form's submit until the user answers the warning.
  useEffect(() => {
    guardRef.current?.setCustomValidity(warning);
  }, [warning]);

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
        <input
          type="number"
          name="sellPrice"
          min="0"
          step={step}
          inputMode="decimal"
          placeholder={unit === "DT" ? "6,500" : "6500"}
          value={sell}
          onChange={(e) => setSell(e.target.value)}
          required
        />
      </div>
      <div className="g-field">
        <label>{t("gestion.produits.unitCostIn", { unit: unitLabel })}</label>
        <input
          type="number"
          name="unitCost"
          min="0"
          step={step}
          inputMode="decimal"
          placeholder={unit === "DT" ? "3,200" : "3200"}
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          required
        />
      </div>
      {suspect && (
        <div className="g-warn-box" role="alert">
          <p style={{ margin: 0 }}>{warning}</p>
          <div className="g-warn-box__actions">
            {/* Typed numbers stay as they are, now read as millimes. */}
            <button type="button" className="g-btn" onClick={() => setUnit("MILLIMES")}>
              {t("gestion.produits.millimesYes")}
            </button>
            <button type="button" className="g-btn secondary" onClick={() => setConfirmed((c) => [...c, suspect])}>
              {t("gestion.produits.millimesNo", { typed: suspect })}
            </button>
          </div>
          <input ref={guardRef} className="g-sr-only" tabIndex={-1} aria-hidden="true" value="" onChange={() => {}} required />
        </div>
      )}
    </>
  );
}
