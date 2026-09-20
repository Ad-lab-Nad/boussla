"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { updateOffresBlock } from "@/lib/homepage/actions";
import type { OffresContent } from "@/lib/homepage/types";

export function EditOffresBlockModal({ id, content }: { id: string; content: OffresContent }) {
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
      await updateOffresBlock(formData);
      setOpen(false);
      router.refresh();
    } catch {
      setError("Impossible d'enregistrer ce bloc. Réessaie.");
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
              <h2>Modifier le bloc Offres</h2>
              <button type="button" className="g-modal__close" onClick={closeModal} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            <form action={handleSubmit}>
              <div className="g-modal__body">
                <input type="hidden" name="id" value={id} />
                <div className="g-hint" style={{ marginTop: 0 }}>
                  Contenu affiché tel quel — ça n&apos;a aucun effet sur l&apos;abonnement réel
                  (mensuel/annuel), qui reste géré séparément.
                </div>
                {content.offers.map((offer, i) => (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: "0.85rem", margin: "0 0 10px" }}>Offre {i + 1}</h3>
                    <div className="g-field-grid">
                      <div className="g-field">
                        <label>Nom</label>
                        <input type="text" name={`offer${i}Name`} defaultValue={offer.name} required />
                      </div>
                      <div className="g-field">
                        <label>Prix affiché</label>
                        <input
                          type="text"
                          name={`offer${i}Price`}
                          placeholder="ex: 39 DT/mois"
                          defaultValue={offer.price}
                          required
                        />
                      </div>
                      <div className="g-field">
                        <label>Texte du bouton</label>
                        <input type="text" name={`offer${i}CtaLabel`} defaultValue={offer.ctaLabel} />
                      </div>
                    </div>
                    <div className="g-field" style={{ marginTop: 12 }}>
                      <label>Fonctionnalités (une par ligne)</label>
                      <textarea
                        name={`offer${i}Features`}
                        rows={4}
                        defaultValue={offer.features.join("\n")}
                      />
                    </div>
                  </div>
                ))}
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
