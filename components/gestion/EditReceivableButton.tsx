"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";

type Receivable = {
  id: string;
  amount: number;
  amountPaid: number;
  dueDate: Date;
  status: string;
  note: string | null;
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "En attente" },
  { value: "PARTIAL", label: "Partielle" },
  { value: "PAID", label: "Payée" },
];

export function EditReceivableButton({
  receivable,
  updateReceivableAction,
}: {
  receivable: Receivable;
  updateReceivableAction: (formData: FormData) => Promise<void>;
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
      await updateReceivableAction(formData);
      setOpen(false);
      router.refresh();
    } catch {
      setError("Impossible d'enregistrer cette créance. Réessaie.");
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
              <h2>Modifier la créance</h2>
              <button type="button" className="g-modal__close" onClick={closeModal} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            <form action={handleSubmit}>
              <div className="g-modal__body">
                <input type="hidden" name="id" value={receivable.id} />
                <div className="g-field-grid">
                  <div className="g-field">
                    <label>Montant (DT)</label>
                    <input
                      type="number"
                      name="amount"
                      min="0.01"
                      step="0.01"
                      defaultValue={receivable.amount}
                      required
                    />
                  </div>
                  <div className="g-field">
                    <label>Déjà payé (DT)</label>
                    <input
                      type="number"
                      name="amountPaid"
                      min="0"
                      step="0.01"
                      defaultValue={receivable.amountPaid}
                    />
                  </div>
                  <div className="g-field">
                    <label>Échéance</label>
                    <input
                      type="date"
                      name="dueDate"
                      defaultValue={receivable.dueDate.toISOString().slice(0, 10)}
                      required
                    />
                  </div>
                  <div className="g-field">
                    <label>Statut</label>
                    <select name="status" defaultValue={receivable.status}>
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="g-field" style={{ marginTop: 12 }}>
                  <label>Note</label>
                  <input type="text" name="note" defaultValue={receivable.note ?? ""} />
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
