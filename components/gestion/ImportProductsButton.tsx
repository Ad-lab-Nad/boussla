"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Upload, X, XCircle } from "lucide-react";
import { parseProductsFile, type ImportRow } from "@/lib/gestion/import-products";
import { bulkCreateProducts } from "@/lib/gestion/actions";
import { fmt } from "@/lib/gestion/format";

export function ImportProductsButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  function closeModal() {
    setOpen(false);
    setFileName("");
    setRows(null);
    setParseError(null);
    setResultMessage(null);
  }

  async function handleFile(file: File) {
    setFileName(file.name);
    setParseError(null);
    setResultMessage(null);
    setRows(null);
    try {
      const parsed = await parseProductsFile(file);
      if (parsed.length === 0) {
        setParseError("Aucune ligne de données détectée dans ce fichier.");
        return;
      }
      setRows(parsed);
    } catch {
      setParseError(
        "Impossible de lire ce fichier. Vérifie qu'il s'agit bien d'un fichier Excel (.xlsx) ou CSV."
      );
    }
  }

  const validRows = rows?.filter((r) => r.status !== "error") ?? [];
  const errorCount = rows ? rows.length - validRows.length : 0;

  async function handleConfirm() {
    if (!rows) return;
    setSubmitting(true);
    setParseError(null);
    try {
      const { count } = await bulkCreateProducts(
        validRows.map((r) => ({ name: r.name, sellPrice: r.sellPrice!, unitCost: r.unitCost! }))
      );
      setRows(null);
      setResultMessage(
        `${count} produit${count > 1 ? "s" : ""} importé${count > 1 ? "s" : ""} avec succès.`
      );
      router.refresh();
    } catch {
      setParseError("L'import a échoué côté serveur. Réessaie.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button type="button" className="g-btn secondary" onClick={() => setOpen(true)}>
        <Upload size={15} /> Importer depuis Excel
      </button>

      {open && (
        <div className="g-modal-overlay" onClick={closeModal}>
          <div className="g-modal" onClick={(e) => e.stopPropagation()}>
            <div className="g-modal__header">
              <h2>Importer des produits</h2>
              <button type="button" className="g-modal__close" onClick={closeModal} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <div className="g-modal__body">
              {!rows && !resultMessage && (
                <>
                  <div className="g-hint">
                    Fichier Excel (.xlsx) ou CSV avec les colonnes <strong>Nom</strong>,{" "}
                    <strong>Prix de vente</strong> et <strong>Coût unitaire</strong>. Si les
                    en-têtes ne correspondent à aucun de ces noms, les 3 premières colonnes sont
                    utilisées dans cet ordre.
                  </div>
                  <label className="g-file-input">
                    {fileName || "Choisir un fichier .xlsx ou .csv"}
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                    />
                  </label>
                </>
              )}

              {parseError && <div className="g-auth-error" style={{ marginTop: 12 }}>{parseError}</div>}
              {resultMessage && <div className="g-auth-success">{resultMessage}</div>}

              {rows && (
                <>
                  <div className="g-import-summary">
                    <span>{fileName}</span>
                    <span>
                      <strong>{validRows.length}</strong> ligne{validRows.length > 1 ? "s" : ""}{" "}
                      valide{validRows.length > 1 ? "s" : ""}
                      {errorCount > 0 && (
                        <>
                          {" · "}
                          <strong>{errorCount}</strong> en erreur
                        </>
                      )}
                    </span>
                  </div>
                  <div className="g-table-wrap" style={{ maxHeight: 320, overflowY: "auto" }}>
                    <table className="g-table">
                      <thead>
                        <tr>
                          <th>Ligne</th>
                          <th>Nom</th>
                          <th className="right">Prix vente</th>
                          <th className="right">Coût unitaire</th>
                          <th>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.rowNumber}>
                            <td className="num">{r.rowNumber}</td>
                            <td>{r.name || <em style={{ color: "var(--g-muted)" }}>—</em>}</td>
                            <td className="right num">
                              {r.sellPrice !== null ? fmt(r.sellPrice) : "—"}
                            </td>
                            <td className="right num">
                              {r.unitCost !== null ? fmt(r.unitCost) : "—"}
                            </td>
                            <td>
                              <ImportStatusBadge row={r} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div className="g-modal__footer">
              <button type="button" className="g-btn secondary" onClick={closeModal}>
                {resultMessage ? "Fermer" : "Annuler"}
              </button>
              {rows && !resultMessage && (
                <button
                  type="button"
                  className="g-btn"
                  disabled={validRows.length === 0 || submitting}
                  onClick={handleConfirm}
                >
                  {submitting
                    ? "Import..."
                    : `Importer ${validRows.length} produit${validRows.length > 1 ? "s" : ""}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ImportStatusBadge({ row }: { row: ImportRow }) {
  if (row.status === "valid") {
    return (
      <span className="g-badge status-valid">
        <CheckCircle2 size={12} />
        Valide
      </span>
    );
  }
  if (row.status === "warning") {
    return (
      <span className="g-badge status-warning" title={row.message}>
        <AlertTriangle size={12} />
        {row.message}
      </span>
    );
  }
  return (
    <span className="g-badge status-error" title={row.message}>
      <XCircle size={12} />
      {row.message}
    </span>
  );
}
