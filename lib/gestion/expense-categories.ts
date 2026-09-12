// Shared between the Dépenses form/list and the Analyse charts, so the
// labels and the fixed display order stay in one place.
export const EXPENSE_CATEGORY_OPTIONS = [
  { value: "ADVERTISING", label: "Pub" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "FIXED_COSTS", label: "Charges fixes" },
  { value: "STOCK_PURCHASES", label: "Stock/Achats" },
  { value: "OTHER", label: "Autre" },
] as const;

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  EXPENSE_CATEGORY_OPTIONS.map((o) => [o.value, o.label])
);
