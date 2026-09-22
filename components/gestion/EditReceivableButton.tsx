"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { TFunction } from "@/lib/i18n/translate";

type Receivable = {
  id: string;
  amount: number;
  amountPaid: number;
  dueDate: Date;
  status: string;
  note: string | null;
};

function statusOptions(t: TFunction) {
  return [
    { value: "PENDING", label: t("gestion.receivableStatus.pending") },
    { value: "PARTIAL", label: t("gestion.receivableStatus.partial") },
    { value: "PAID", label: t("gestion.receivableStatus.paid") },
  ];
}

export function EditReceivableButton({
  receivable,
  updateReceivableAction,
}: {
  receivable: Receivable;
  updateReceivableAction: (formData: FormData) => Promise<void>;
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
      await updateReceivableAction(formData);
      setOpen(false);
      router.refresh();
    } catch {
      setError(t("gestion.clients.saveReceivableError"));
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
              <h2>{t("gestion.clients.editReceivableTitle")}</h2>
              <button type="button" className="g-modal__close" onClick={closeModal} aria-label={t("gestion.editCommon.close")}>
                <X size={18} />
              </button>
            </div>
            <form action={handleSubmit}>
              <div className="g-modal__body">
                <input type="hidden" name="id" value={receivable.id} />
                <div className="g-field-grid">
                  <div className="g-field">
                    <label>{t("gestion.editCommon.amountLabel")}</label>
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
                    <label>{t("gestion.clients.amountPaidLabel")}</label>
                    <input
                      type="number"
                      name="amountPaid"
                      min="0"
                      step="0.01"
                      defaultValue={receivable.amountPaid}
                    />
                  </div>
                  <div className="g-field">
                    <label>{t("gestion.clients.dueDateLabel")}</label>
                    <input
                      type="date"
                      name="dueDate"
                      defaultValue={receivable.dueDate.toISOString().slice(0, 10)}
                      required
                    />
                  </div>
                  <div className="g-field">
                    <label>{t("gestion.clients.statusLabel")}</label>
                    <select name="status" defaultValue={receivable.status}>
                      {statusOptions(t).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="g-field" style={{ marginTop: 12 }}>
                  <label>{t("gestion.clients.noteLabel")}</label>
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
