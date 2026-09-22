"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";

type StockPurchase = { id: string; date: Date; quantity: number; unitCost: number };

export function EditStockPurchaseButton({
  purchase,
  updateStockPurchaseAction,
}: {
  purchase: StockPurchase;
  updateStockPurchaseAction: (formData: FormData) => Promise<void>;
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
      await updateStockPurchaseAction(formData);
      setOpen(false);
      router.refresh();
    } catch {
      setError(t("gestion.stock.savePurchaseError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button type="button" className="g-del-btn" title={t("gestion.editCommon.edit")} onClick={() => setOpen(true)}>
        <Pencil size={15} />
      </button>

      {open && (
        <div className="g-modal-overlay" onClick={closeModal}>
          <div className="g-modal" onClick={(e) => e.stopPropagation()}>
            <div className="g-modal__header">
              <h2>{t("gestion.stock.editPurchaseTitle")}</h2>
              <button type="button" className="g-modal__close" onClick={closeModal} aria-label={t("gestion.editCommon.close")}>
                <X size={18} />
              </button>
            </div>

            <form action={handleSubmit}>
              <div className="g-modal__body">
                <input type="hidden" name="id" value={purchase.id} />
                <div className="g-field-grid">
                  <div className="g-field">
                    <label>{t("gestion.editCommon.dateLabel")}</label>
                    <input
                      type="date"
                      name="date"
                      defaultValue={purchase.date.toISOString().slice(0, 10)}
                      required
                    />
                  </div>
                  <div className="g-field">
                    <label>{t("gestion.stock.quantityPurchasedLabel")}</label>
                    <input
                      type="number"
                      name="quantity"
                      min="0"
                      step="0.01"
                      defaultValue={purchase.quantity}
                      required
                    />
                  </div>
                  <div className="g-field">
                    <label>{t("gestion.stock.unitCostLabel")}</label>
                    <input
                      type="number"
                      name="unitCost"
                      min="0"
                      step="0.01"
                      defaultValue={purchase.unitCost}
                      required
                    />
                  </div>
                </div>
                <div className="g-hint" style={{ marginTop: 12, marginBottom: 0 }}>
                  {t("gestion.stock.editPurchaseHint")}
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
