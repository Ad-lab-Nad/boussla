"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";

type StockUsage = { id: string; date: Date; quantity: number };

export function EditStockUsageButton({
  usage,
  updateStockUsageAction,
}: {
  usage: StockUsage;
  updateStockUsageAction: (formData: FormData) => Promise<void>;
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
      await updateStockUsageAction(formData);
      setOpen(false);
      router.refresh();
    } catch {
      setError("Impossible d'enregistrer cette utilisation. Réessaie.");
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
              <h2>Modifier l&apos;utilisation</h2>
              <button type="button" className="g-modal__close" onClick={closeModal} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <form action={handleSubmit}>
              <div className="g-modal__body">
                <input type="hidden" name="id" value={usage.id} />
                <div className="g-field-grid">
                  <div className="g-field">
                    <label>Date</label>
                    <input
                      type="date"
                      name="date"
                      defaultValue={usage.date.toISOString().slice(0, 10)}
                      required
                    />
                  </div>
                  <div className="g-field">
                    <label>Quantité utilisée</label>
                    <input
                      type="number"
                      name="quantity"
                      min="0"
                      step="0.01"
                      defaultValue={usage.quantity}
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
