"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { sellUnitOptions } from "@/lib/gestion/product-units";
import { useLocale } from "@/components/i18n/LocaleProvider";

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
  const { t } = useLocale();
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
      setError(isServices ? t("gestion.produits.saveServiceError") : t("gestion.produits.saveProductError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="g-del-btn"
        title={t("gestion.editCommon.edit")}
        onClick={() => setOpen(true)}
      >
        <Pencil size={15} />
      </button>

      {open && (
        <div className="g-modal-overlay" onClick={closeModal}>
          <div className="g-modal" onClick={(e) => e.stopPropagation()}>
            <div className="g-modal__header">
              <h2>{isServices ? t("gestion.produits.editServiceTitle") : t("gestion.produits.editProductTitle")}</h2>
              <button
                type="button"
                className="g-modal__close"
                onClick={closeModal}
                aria-label={t("gestion.editCommon.close")}
              >
                <X size={18} />
              </button>
            </div>

            <form action={handleSubmit}>
              <div className="g-modal__body">
                <input type="hidden" name="id" value={product.id} />
                <div className="g-field-grid">
                  <div className="g-field">
                    <label>{t("gestion.clients.nameLabel")}</label>
                    <input type="text" name="name" defaultValue={product.name} required />
                  </div>
                  <div className="g-field">
                    <label>{t("gestion.produits.sellPriceLabel")}</label>
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
                    <label>{t("gestion.editCommon.unitCostLabel")}</label>
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
                      <label>{t("gestion.produits.sellUnitLabel")}</label>
                      <select name="sellUnit" defaultValue={product.sellUnit}>
                        {sellUnitOptions(t).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="g-hint" style={{ marginTop: 12, marginBottom: 0 }}>
                  {t("gestion.produits.editSnapshotHint")}
                </div>
                {error && (
                  <div className="g-auth-error" style={{ marginTop: 12 }}>
                    {error}
                  </div>
                )}
              </div>
              <div className="g-modal__footer">
                <button type="button" className="g-btn secondary" onClick={closeModal}>
                  {t("gestion.editCommon.cancel")}
                </button>
                <button type="submit" className="g-btn" disabled={submitting}>
                  {submitting ? t("gestion.editCommon.saving") : t("gestion.editCommon.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
