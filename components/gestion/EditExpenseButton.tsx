"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { EXPENSE_CATEGORY_OPTIONS } from "@/lib/gestion/expense-categories";

type Expense = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  category: string;
};

export function EditExpenseButton({
  expense,
  updateExpenseAction,
}: {
  expense: Expense;
  updateExpenseAction: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function closeModal() {
    setOpen(false);
    setError(null);
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    try {
      await updateExpenseAction(formData);
      setOpen(false);
      router.refresh();
    } catch {
      setError("Impossible d'enregistrer cette dépense. Réessaie.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button type="button" className="g-del-btn" title="Modifier" onClick={() => setOpen(true)}>
        <Pencil size={15} />
      </button>

      {open && (
        <div className="g-modal-overlay" onClick={closeModal}>
          <div className="g-modal" onClick={(e) => e.stopPropagation()}>
            <div className="g-modal__header">
              <h2>Modifier la dépense</h2>
              <button type="button" className="g-modal__close" onClick={closeModal} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <form action={handleSubmit}>
              <div className="g-modal__body">
                <input type="hidden" name="id" value={expense.id} />
                <div className="g-field-grid">
                  <div className="g-field">
                    <label>Date</label>
                    <input
                      type="date"
                      name="date"
                      defaultValue={expense.date.toISOString().slice(0, 10)}
                      required
                    />
                  </div>
                  <div className="g-field">
                    <label>Description</label>
                    <input type="text" name="description" defaultValue={expense.description} required />
                  </div>
                  <div className="g-field">
                    <label>Catégorie</label>
                    <select name="category" defaultValue={expense.category} required>
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
                      defaultValue={expense.amount}
                      required
                    />
                  </div>
                </div>
                {error && (
                  <div className="g-auth-error" style={{ marginTop: 12 }}>
                    {error}
                  </div>
                )}
              </div>
              <div className="g-modal__footer">
                <button type="button" className="g-btn secondary" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="g-btn" disabled={submitting}>
                  {submitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
