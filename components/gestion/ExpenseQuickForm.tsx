"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { EXPENSE_CATEGORY_LABELS, EXPENSE_CATEGORY_OPTIONS } from "@/lib/gestion/expense-categories";
import { fmt, todayStr } from "@/lib/gestion/format";
import { createExpense, suggestRecurringExpense } from "@/lib/gestion/actions";

type Suggestion = { category: string; amount: number; isPersonal: boolean } | null;

export function ExpenseQuickForm() {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [isPersonal, setIsPersonal] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion>(null);
  const [, startTransition] = useTransition();

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
        <label>Description</label>
        <input
          type="text"
          name="description"
          placeholder="ex: Ads Facebook"
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
            Dépense récurrente détectée : {EXPENSE_CATEGORY_LABELS[suggestion.category]},{" "}
            {fmt(suggestion.amount)} ({suggestion.isPersonal ? "perso" : "pro"}) — cliquer pour appliquer
          </button>
        )}
      </div>
      <div className="g-field">
        <label>Catégorie</label>
        <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="" disabled>
            Choisir une catégorie
          </option>
          {EXPENSE_CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="g-field">
        <label>Montant (DT)</label>
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
          Dépense personnelle
        </label>
      </div>
      <div className="g-field">
        <label>Photo du reçu (optionnel)</label>
        <input type="file" name="receipt" accept="image/*" />
      </div>
      <button type="submit" className="g-btn">
        <Plus size={15} /> Ajouter la dépense
      </button>
    </form>
  );
}
