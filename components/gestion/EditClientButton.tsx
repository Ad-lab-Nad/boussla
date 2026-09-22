"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";

type Client = { id: string; name: string; phone: string | null; email: string | null };

export function EditClientButton({
  client,
  updateClientAction,
}: {
  client: Client;
  updateClientAction: (formData: FormData) => Promise<void>;
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
      await updateClientAction(formData);
      setOpen(false);
      router.refresh();
    } catch {
      setError(t("gestion.clients.saveError"));
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
              <h2>{t("gestion.clients.editTitle")}</h2>
              <button type="button" className="g-modal__close" onClick={closeModal} aria-label={t("gestion.editCommon.close")}>
                <X size={18} />
              </button>
            </div>
            <form action={handleSubmit}>
              <div className="g-modal__body">
                <input type="hidden" name="id" value={client.id} />
                <div className="g-field-grid">
                  <div className="g-field">
                    <label>{t("gestion.clients.nameLabel")}</label>
                    <input type="text" name="name" defaultValue={client.name} required />
                  </div>
                  <div className="g-field">
                    <label>{t("gestion.clients.phoneLabel")}</label>
                    <input type="text" name="phone" defaultValue={client.phone ?? ""} />
                  </div>
                  <div className="g-field">
                    <label>{t("gestion.clients.emailLabel")}</label>
                    <input type="email" name="email" defaultValue={client.email ?? ""} />
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
