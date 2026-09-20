"use client";

import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { uploadHomepageImage } from "@/lib/homepage/actions";

/** Controlled image picker — the caller owns the URL (in a hidden form
 * field, in a list item, wherever) and passes it back via `onChange`. */
export function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const { url } = await uploadHomepageImage(fd);
      onChange(url);
    } catch {
      setError("Échec de l'envoi de l'image. Réessaie.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="g-field">
      <label>{label}</label>
      {value && (
        <div style={{ marginBottom: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- preview of an
              already-uploaded Supabase Storage URL, not a static asset. */}
          <img src={value} alt="" style={{ maxWidth: 160, borderRadius: 8, display: "block" }} />
        </div>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label className="g-btn secondary small" style={{ cursor: "pointer" }}>
          <ImagePlus size={14} /> {uploading ? "Envoi..." : value ? "Remplacer" : "Choisir une image"}
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
        {value && (
          <button
            type="button"
            className="g-del-btn"
            title="Supprimer l'image"
            onClick={() => onChange("")}
          >
            <X size={15} />
          </button>
        )}
      </div>
      {error && (
        <div className="g-auth-error" style={{ marginTop: 8 }}>
          {error}
        </div>
      )}
    </div>
  );
}
