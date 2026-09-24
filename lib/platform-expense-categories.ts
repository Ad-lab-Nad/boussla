// The back office's own expense categories. Reuses a few of the existing
// ExpenseCategory values (so no schema change), relabeled for what the
// platform actually spends on. French only — the back office isn't translated.
export const PLATFORM_EXPENSE_CATEGORIES = [
  { value: "ADVERTISING", label: "Publicité / campagnes" },
  { value: "RESEARCH_DEVELOPMENT", label: "Outils IA & logiciels" },
  { value: "FIXED_COSTS", label: "Hébergement & nom de domaine" },
  { value: "BANK_FEES", label: "Frais de paiement / bancaires" },
  { value: "OTHER", label: "Divers" },
] as const;

export const PLATFORM_EXPENSE_CATEGORY_VALUES: string[] = PLATFORM_EXPENSE_CATEGORIES.map((c) => c.value);

export const PLATFORM_EXPENSE_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  PLATFORM_EXPENSE_CATEGORIES.map((c) => [c.value, c.label])
);
