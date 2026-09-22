import type { TFunction } from "@/lib/i18n/translate";

// Shared between the Dépenses form/list and the Analyse charts, so the
// labels and the fixed display order stay in one place. "Autre" is last on
// purpose — it's for genuinely exceptional cases, not a default catch-all.
const EXPENSE_CATEGORY_KEYS = [
  { value: "ADVERTISING", labelKey: "gestion.expenseCategories.advertising" },
  { value: "TRANSPORT", labelKey: "gestion.expenseCategories.transport" },
  { value: "FIXED_COSTS", labelKey: "gestion.expenseCategories.fixedCosts" },
  { value: "STOCK_PURCHASES", labelKey: "gestion.expenseCategories.stockPurchases" },
  { value: "SUPPLIES_EQUIPMENT", labelKey: "gestion.expenseCategories.suppliesEquipment" },
  { value: "RESEARCH_DEVELOPMENT", labelKey: "gestion.expenseCategories.researchDevelopment" },
  { value: "RENT", labelKey: "gestion.expenseCategories.rent" },
  { value: "SALARIES_LABOR", labelKey: "gestion.expenseCategories.salariesLabor" },
  { value: "PACKAGING", labelKey: "gestion.expenseCategories.packaging" },
  { value: "BANK_FEES", labelKey: "gestion.expenseCategories.bankFees" },
  { value: "OTHER", labelKey: "gestion.expenseCategories.other" },
] as const;

/** Values only — for validation, where no translation is needed. */
export const EXPENSE_CATEGORY_VALUES: string[] = EXPENSE_CATEGORY_KEYS.map((o) => o.value);

/** `{value, label}` pairs in the fixed display order, resolved for the given locale. */
export function expenseCategoryOptions(t: TFunction): { value: string; label: string }[] {
  return EXPENSE_CATEGORY_KEYS.map((o) => ({ value: o.value, label: t(o.labelKey) }));
}

/** value -> label lookup, resolved for the given locale. */
export function expenseCategoryLabels(t: TFunction): Record<string, string> {
  return Object.fromEntries(EXPENSE_CATEGORY_KEYS.map((o) => [o.value, t(o.labelKey)]));
}
