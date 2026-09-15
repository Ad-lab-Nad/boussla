// A product's sellPrice/unitCost are "per sellUnit" — 25 for a Kg-priced
// product means 25 DT/kg, not 25 DT for the whole batch.
import { fmt, fmtNumber } from "@/lib/gestion/format";

export const SELL_UNIT_OPTIONS = [
  { value: "PIECE", label: "Pièce" },
  { value: "KG", label: "Kg" },
  { value: "GRAM", label: "Gramme" },
  { value: "LITRE", label: "Litre" },
] as const;

export const SELL_UNIT_LABELS: Record<string, string> = Object.fromEntries(
  SELL_UNIT_OPTIONS.map((o) => [o.value, o.label])
);

// Pièce is the original, unambiguous default — left suffix-free so the
// common case looks exactly as clean as it did before this field existed.
// The other units are the ones that actually needed disambiguating.
const PRICE_SUFFIX: Record<string, string> = { PIECE: "", KG: "/kg", GRAM: "/g", LITRE: "/L" };
const QTY_SUFFIX: Record<string, string> = { PIECE: "", KG: " kg", GRAM: " g", LITRE: " L" };

/** 25 -> "25,000 DT" or "25,000 DT/kg" depending on sellUnit. */
export function fmtPrice(amount: number | null | undefined, sellUnit: string): string {
  return fmt(amount) + (PRICE_SUFFIX[sellUnit] ?? "");
}

/** 1.5 -> "1,5" or "1,5 kg" depending on sellUnit. */
export function fmtQty(n: number | null | undefined, sellUnit: string): string {
  return fmtNumber(n) + (QTY_SUFFIX[sellUnit] ?? "");
}
