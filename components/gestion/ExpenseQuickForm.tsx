"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { expenseCategoryLabels, expenseCategoryOptions } from "@/lib/gestion/expense-categories";
import { fmt, todayStr } from "@/lib/gestion/format";
import { createExpense, suggestRecurringExpense } from "@/lib/gestion/actions";
import { useLocale } from "@/components/i18n/LocaleProvider";

type Suggestion = { category: string; amount: number; isPersonal: boolean } | null;

export function ExpenseQuickForm() {
  const { t } = useLocale();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [isPersonal, setIsPersonal] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion>(null);
  const [, startTransition] = useTransition();

  const categoryOptions = expenseCategoryOptions(t);
  const categoryLabels = expenseCategoryLabels(t);

  function handleDescriptionBlur() {
    const value = description.trim();
    if (!value) {
      setSuggestion(null);
      return;
    }
    startTransition(async () => {
      const result = await suggestRecurringExpense(value);
      setSuggestion(result);
    });
  }

  function applySuggestion() {
    if (!suggestion) return;
    setCategory(suggestion.category);
    setAmount(String(suggestion.amount));
    setIsPersonal(suggestion.isPersonal);
    setSuggestion(null);
  }

  return (
    <form action={createExpense} className="g-field-grid" onSubmit={() => setSuggestion(null)}>
      <input type="hidden" name="date" value={todayStr()} />
      <div className="g-field">
        <label>{t("gestion.editCommon.descriptionLabel")}</label>
        <input
          type="text"
          name="description"
          placeholder={t("gestion.depenses.descriptionPlaceholder")}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
        />
        {suggestion && (
          <button
            type="button"
            onClick={applySuggestion}
            className="g-hint"
            style={{ cursor: "pointer", textAlign: "left", background: "none", border: "none", padding: 0 }}
          >
            {t("gestion.palier1.recurringSuggestion", {
              category: categoryLabels[suggestion.category],
              amount: fmt(suggestion.amount),
              kind: suggestion.isPersonal ? t("gestion.palier1.personal") : t("gestion.palier1.professional"),
            })}
          </button>
        )}
      </div>
      <div className="g-field">
        <label>{t("gestion.editCommon.categoryLabel")}</label>
        <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="" disabled>
            {t("gestion.depenses.categoryPlaceholder")}
          </option>
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="g-field">
        <label>{t("gestion.editCommon.amountLabel")}</label>
        <input
          type="number"
          name="amount"
          min="0.01"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="g-field">
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            name="isPersonal"
            checked={isPersonal}
            onChange={(e) => setIsPersonal(e.target.checked)}
          />
          {t("gestion.palier1.personalExpenseCheckbox")}
        </label>
      </div>
      <div className="g-field">
        <label>{t("gestion.palier1.receiptPhotoLabel")}</label>
        <input type="file" name="receipt" accept="image/*" />
      </div>
      <button type="submit" className="g-btn">
        <Plus size={15} /> {t("gestion.depenses.addButton")}
      </button>
    </form>
  );
}
