// Shared between the Dépenses form/list and the Analyse charts, so the
// labels and the fixed display order stay in one place. "Autre" is last on
// purpose — it's for genuinely exceptional cases, not a default catch-all.
export const EXPENSE_CATEGORY_OPTIONS = [
  { value: "ADVERTISING", label: "Pub" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "FIXED_COSTS", label: "Charges fixes" },
  { value: "STOCK_PURCHASES", label: "Stock/Achats" },
  { value: "SUPPLIES_EQUIPMENT", label: "Fournitures/Matériel" },
  { value: "RESEARCH_DEVELOPMENT", label: "Recherche & développement" },
  { value: "RENT", label: "Loyer/Local" },
  { value: "SALARIES_LABOR", label: "Salaires/Main d'œuvre" },
  { value: "PACKAGING", label: "Emballage/Conditionnement" },
  { value: "BANK_FEES", label: "Frais bancaires" },
  { value: "OTHER", label: "Autre" },
] as const;

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  EXPENSE_CATEGORY_OPTIONS.map((o) => [o.value, o.label])
);
