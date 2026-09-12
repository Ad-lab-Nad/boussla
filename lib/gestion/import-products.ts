import * as XLSX from "xlsx";

export type ImportRowStatus = "valid" | "warning" | "error";

export type ImportRow = {
  rowNumber: number; // 1-based spreadsheet row number (row 1 is the header)
  name: string;
  sellPrice: number | null;
  unitCost: number | null;
  status: ImportRowStatus;
  message?: string;
};

// Header matching is alias-based and accent/punctuation-insensitive, so
// "Prix de vente (DT)", "prix_vente", "PrixVente" all resolve the same way.
const NAME_ALIASES = ["nom", "produit", "name", "product"];
const SELL_PRICE_ALIASES = ["prixdevente", "prixvente", "sellprice", "price", "prix"];
const UNIT_COST_ALIASES = ["coutunitaire", "unitcost", "cost", "cout"];

function normalizeHeader(h: string): string {
  return h
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function findColumn(headers: string[], aliases: string[]): number {
  const normalized = headers.map(normalizeHeader);
  for (let i = 0; i < normalized.length; i++) {
    if (aliases.some((alias) => normalized[i].includes(alias))) return i;
  }
  return -1;
}

function parseNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;

  // Strip currency symbols/spaces, keep only digits and the two possible
  // separators. Then figure out which of "," / "." is the decimal separator
  // by taking whichever one appears last (1.234,56 -> comma decimal;
  // 1,234.56 -> dot decimal; 12,50 alone -> comma decimal).
  let str = String(raw).trim().replace(/[^\d,.\-]/g, "");
  if (str === "") return null;

  const lastComma = str.lastIndexOf(",");
  const lastDot = str.lastIndexOf(".");
  if (lastComma !== -1 && lastDot !== -1) {
    str =
      lastComma > lastDot
        ? str.replace(/\./g, "").replace(",", ".")
        : str.replace(/,/g, "");
  } else if (lastComma !== -1) {
    str = str.replace(/,/g, (_, offset) => (offset === lastComma ? "." : ""));
  }

  const n = Number(str);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parses a .xlsx/.xls/.csv File into per-row validation results. Runs
 * entirely in the browser — the file never has to be uploaded just to be
 * previewed.
 */
export async function parseProductsFile(file: File): Promise<ImportRow[]> {
  const buffer = await file.arrayBuffer();
  return parseWorkbookBuffer(buffer);
}

/** Pure core, split out from parseProductsFile so it's testable without a
 * browser File object (e.g. from a plain ArrayBuffer/Buffer in Node). */
export function parseWorkbookBuffer(buffer: ArrayBuffer): ImportRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  // raw:false returns each cell's original textual form (e.g. "20,50")
  // rather than SheetJS's parsed value — its CSV number-sniffing treats a
  // decimal comma as a thousands separator ("20,50" -> 2050), which
  // parseNumber below undoes correctly but only when given the text.
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: false });
  if (rows.length === 0) return [];

  const headerRow = rows[0].map((h) => String(h ?? ""));
  const nameCol = findColumn(headerRow, NAME_ALIASES);
  const sellPriceCol = findColumn(headerRow, SELL_PRICE_ALIASES);
  const unitCostCol = findColumn(headerRow, UNIT_COST_ALIASES);

  // Fall back to positional columns (Nom, Prix de vente, Coût unitaire, in
  // that order) for whichever header wasn't recognized by name.
  const nameIdx = nameCol !== -1 ? nameCol : 0;
  const sellPriceIdx = sellPriceCol !== -1 ? sellPriceCol : 1;
  const unitCostIdx = unitCostCol !== -1 ? unitCostCol : 2;

  const results: ImportRow[] = [];

  rows.slice(1).forEach((row, i) => {
    const rowNumber = i + 2;
    const isBlank = row.every((cell) => String(cell ?? "").trim() === "");
    if (isBlank) return; // silently skip fully empty rows

    const name = String(row[nameIdx] ?? "").trim();
    const sellPrice = parseNumber(row[sellPriceIdx]);
    const unitCost = parseNumber(row[unitCostIdx]);

    const errors: string[] = [];
    if (!name) errors.push("Nom manquant");
    if (sellPrice === null) errors.push("Prix de vente manquant ou invalide");
    else if (sellPrice < 0) errors.push("Prix de vente négatif");
    if (unitCost === null) errors.push("Coût unitaire manquant ou invalide");
    else if (unitCost < 0) errors.push("Coût unitaire négatif");

    if (errors.length > 0) {
      results.push({ rowNumber, name, sellPrice, unitCost, status: "error", message: errors.join(" · ") });
      return;
    }

    if (sellPrice! < unitCost!) {
      results.push({
        rowNumber,
        name,
        sellPrice,
        unitCost,
        status: "warning",
        message: "Marge négative — coût supérieur au prix de vente",
      });
      return;
    }

    results.push({ rowNumber, name, sellPrice, unitCost, status: "valid" });
  });

  return results;
}
