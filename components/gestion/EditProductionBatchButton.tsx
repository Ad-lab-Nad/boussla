"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";

type Product = { id: string; name: string };
type Batch = { id: string; date: Date; productId: string; quantity: number };

export function EditProductionBatchButton({
  batch,
  products,
  updateProductionBatchAction,
}: {
  batch: Batch;
  products: Product[];
  updateProductionBatchAction: (formData: FormData) => Promise<void>;
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
      await updateProductionBatchAction(formData);
      setOpen(false);
      router.refresh();
    } catch {
      setError("Impossible d'enregistrer ce lot. Réessaie.");
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
              <h2>Modifier le lot</h2>
              <button type="button" className="g-modal__close" onClick={closeModal} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <form action={handleSubmit}>
              <div className="g-modal__body">
                <input type="hidden" name="id" value={batch.id} />
                <div className="g-field-grid">
                  <div className="g-field">
                    <label>Date</label>
                    <input
                      type="date"
                      name="date"
                      defaultValue={batch.date.toISOString().slice(0, 10)}
                      required
                    />
                  </div>
                  <div className="g-field">
                    <label>Produit</label>
                    <select name="productId" defaultValue={batch.productId} required>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="g-field">
                    <label>Quantité produite</label>
                    <input
                      type="number"
                      name="quantity"
                      min="0.001"
                      step="any"
                      defaultValue={batch.quantity}
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
