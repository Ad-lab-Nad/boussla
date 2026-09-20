"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, X } from "lucide-react";
import { updateTemoignagesBlock } from "@/lib/homepage/actions";
import type { TemoignagesContent, Testimonial } from "@/lib/homepage/types";
import { ImageUploadField } from "@/components/homepage/ImageUploadField";

type Item = Testimonial & { key: string };

function newItem(): Item {
  return { key: Math.random().toString(36).slice(2), quote: "", name: "", photoUrl: null };
}

export function EditTemoignagesBlockModal({
  id,
  content,
}: {
  id: string;
  content: TemoignagesContent;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>(() =>
    content.items.map((t) => ({ ...t, key: Math.random().toString(36).slice(2) }))
  );

  function closeModal() {
    setOpen(false);
    setError(null);
  }

  function openModal() {
    setItems(content.items.map((t) => ({ ...t, key: Math.random().toString(36).slice(2) })));
    setOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    formData.set(
      "itemsJson",
      JSON.stringify(items.map(({ quote, name, photoUrl }) => ({ quote, name, photoUrl })))
    );
    setSubmitting(true);
    setError(null);
    try {
      await updateTemoignagesBlock(formData);
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
      <button type="button" className="g-del-btn" title="Modifier" onClick={openModal}>
        <Pencil size={15} />
      </button>

      {open && (
        <div className="g-modal-overlay" onClick={closeModal}>
          <div className="g-modal" onClick={(e) => e.stopPropagation()}>
            <div className="g-modal__header">
              <h2>Modifier le bloc Témoignages</h2>
              <button type="button" className="g-modal__close" onClick={closeModal} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            <form action={handleSubmit}>
              <div className="g-modal__body">
                <input type="hidden" name="id" value={id} />

                {items.map((item) => (
                  <div
                    key={item.key}
                    style={{
                      border: "1px solid var(--g-border)",
                      borderRadius: 10,
                      padding: 14,
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="g-del-btn"
                        title="Retirer ce témoignage"
                        onClick={() => setItems((prev) => prev.filter((i) => i.key !== item.key))}
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <div className="g-field">
                      <label>Citation</label>
                      <textarea
                        rows={3}
                        value={item.quote}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((i) => (i.key === item.key ? { ...i, quote: e.target.value } : i))
                          )
                        }
                      />
                    </div>
                    <div className="g-field">
                      <label>Nom</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((i) => (i.key === item.key ? { ...i, name: e.target.value } : i))
                          )
                        }
                      />
                    </div>
                    <ImageUploadField
                      label="Photo (optionnelle)"
                      value={item.photoUrl ?? ""}
                      onChange={(url) =>
                        setItems((prev) =>
                          prev.map((i) => (i.key === item.key ? { ...i, photoUrl: url || null } : i))
                        )
                      }
                    />
                  </div>
                ))}

                <button
                  type="button"
                  className="g-btn secondary small"
                  onClick={() => setItems((prev) => [...prev, newItem()])}
                >
                  <Plus size={13} /> Ajouter un témoignage
                </button>

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
