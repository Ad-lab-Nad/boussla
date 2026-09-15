"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { SELL_UNIT_OPTIONS } from "@/lib/gestion/product-units";

type Product = { id: string; name: string; sellPrice: number; unitCost: number; sellUnit: string };

export function EditProductButton({
  product,
  updateProductAction,
  isServices = false,
}: {
  product: Product;
  updateProductAction: (formData: FormData) => Promise<void>;
  isServices?: boolean;
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
      await updateProductAction(formData);
      setOpen(false);
      router.refresh();
    } catch {
      setError(
        isServices
          ? "Impossible d'enregistrer cette prestation. Réessaie."
          : "Impossible d'enregistrer ce produit. Réessaie."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="g-del-btn"
        title="Modifier"
        onClick={() => setOpen(true)}
      >
        <Pencil size={15} />
      </button>

      {open && (
        <div className="g-modal-overlay" onClick={closeModal}>
          <div className="g-modal" onClick={(e) => e.stopPropagation()}>
            <div className="g-modal__header">
              <h2>{isServices ? "Modifier la prestation" : "Modifier le produit"}</h2>
              <button
                type="button"
                className="g-modal__close"
                onClick={closeModal}
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            <form action={handleSubmit}>
              <div className="g-modal__body">
                <input type="hidden" name="id" value={product.id} />
                <div className="g-field-grid">
                  <div className="g-field">
                    <label>Nom</label>
                    <input type="text" name="name" defaultValue={product.name} required />
                  </div>
                  <div className="g-field">
                    <label>Prix de vente (DT)</label>
                    <input
                      type="number"
                      name="sellPrice"
                      min="0"
                      step="0.01"
                      defaultValue={product.sellPrice}
                      required
                    />
                  </div>
                  <div className="g-field">
                    <label>Coût unitaire (DT)</label>
                    <input
                      type="number"
                      name="unitCost"
                      min="0"
                      step="0.01"
                      defaultValue={product.unitCost}
                      required
                    />
                  </div>
                  {!isServices && (
                    <div className="g-field">
                      <label>Unité de vente</label>
                      <select name="sellUnit" defaultValue={product.sellUnit}>
                        {SELL_UNIT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="g-hint" style={{ marginTop: 12, marginBottom: 0 }}>
                  Les commandes déjà enregistrées gardent leur prix et coût d&apos;origine —
                  seules les prochaines commandes utiliseront ces nouvelles valeurs.
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
