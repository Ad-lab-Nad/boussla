"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Upload, X, XCircle } from "lucide-react";
import { parseProductsFile, type ImportRow } from "@/lib/gestion/import-products";
import { bulkCreateProducts } from "@/lib/gestion/actions";
import { fmt } from "@/lib/gestion/format";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { TFunction } from "@/lib/i18n/translate";

export function ImportProductsButton() {
  const { t } = useLocale();
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
      const parsed = await parseProductsFile(file, t);
      if (parsed.length === 0) {
        setParseError(t("gestion.import.errorNoRows"));
        return;
      }
      setRows(parsed);
    } catch {
      setParseError(t("gestion.import.errorUnreadableFile"));
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
      setResultMessage(t("gestion.import.successMessage", { count }));
      router.refresh();
    } catch {
      setParseError(t("gestion.import.errorServerImport"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button type="button" className="g-btn secondary" onClick={() => setOpen(true)}>
        <Upload size={15} /> {t("gestion.import.buttonLabel")}
      </button>

      {open && (
        <div className="g-modal-overlay" onClick={closeModal}>
          <div className="g-modal" onClick={(e) => e.stopPropagation()}>
            <div className="g-modal__header">
              <h2>{t("gestion.import.modalTitle")}</h2>
              <button type="button" className="g-modal__close" onClick={closeModal} aria-label={t("gestion.editCommon.close")}>
                <X size={18} />
              </button>
            </div>

            <div className="g-modal__body">
              {!rows && !resultMessage && (
                <>
                  <div className="g-hint">{t("gestion.import.hint")}</div>
                  <label className="g-file-input">
                    {fileName || t("gestion.import.filePlaceholder")}
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
                      {t("gestion.import.validRowsSummary", { count: validRows.length })}
                      {errorCount > 0 && (
                        <>
                          {" · "}
                          {t("gestion.import.errorRowsSummary", { count: errorCount })}
                        </>
                      )}
                    </span>
                  </div>
                  <div className="g-table-wrap" style={{ maxHeight: 320, overflowY: "auto" }}>
                    <table className="g-table">
                      <thead>
                        <tr>
                          <th>{t("gestion.import.rowColumn")}</th>
                          <th>{t("gestion.clients.nameLabel")}</th>
                          <th className="right">{t("gestion.produits.sellPriceColumn")}</th>
                          <th className="right">{t("gestion.editCommon.unitCostLabel")}</th>
                          <th>{t("gestion.clients.statusLabel")}</th>
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
                              <ImportStatusBadge row={r} t={t} />
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
                {resultMessage ? t("gestion.editCommon.close") : t("gestion.editCommon.cancel")}
              </button>
              {rows && !resultMessage && (
                <button
                  type="button"
                  className="g-btn"
                  disabled={validRows.length === 0 || submitting}
                  onClick={handleConfirm}
                >
                  {submitting
                    ? t("gestion.import.importingButton")
                    : t("gestion.import.importButton", { count: validRows.length })}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ImportStatusBadge({ row, t }: { row: ImportRow; t: TFunction }) {
  if (row.status === "valid") {
    return (
      <span className="g-badge status-valid">
        <CheckCircle2 size={12} />
        {t("gestion.import.statusValid")}
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
