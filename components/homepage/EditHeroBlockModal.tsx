"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { updateHeroBlock } from "@/lib/homepage/actions";
import type { HeroContent } from "@/lib/homepage/types";
import { ImageUploadField } from "@/components/homepage/ImageUploadField";

export function EditHeroBlockModal({ id, content }: { id: string; content: HeroContent }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(content.imageUrl ?? "");

  function closeModal() {
    setOpen(false);
    setError(null);
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    try {
      await updateHeroBlock(formData);
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
              <h2>Modifier le bloc Hero</h2>
              <button type="button" className="g-modal__close" onClick={closeModal} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            <form action={handleSubmit}>
              <div className="g-modal__body">
                <input type="hidden" name="id" value={id} />
                <div className="g-field">
                  <label>Titre principal</label>
                  <input type="text" name="title" defaultValue={content.title} required />
                </div>
                <div className="g-field">
                  <label>Sous-titre</label>
                  <textarea name="subtitle" rows={3} defaultValue={content.subtitle} />
                </div>
                <div className="g-field">
                  <label>Phrase de solution (en gras)</label>
                  <textarea name="solutionText" rows={2} defaultValue={content.solutionText} />
                </div>
                <div className="g-field">
                  <label>Texte du bouton</label>
                  <input type="text" name="ctaLabel" defaultValue={content.ctaLabel} required />
                </div>
                <input type="hidden" name="imageUrl" value={imageUrl} />
                <ImageUploadField
                  label="Image (remplace l'illustration par défaut)"
                  value={imageUrl}
                  onChange={setImageUrl}
                />
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
