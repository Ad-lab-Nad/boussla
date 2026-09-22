"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";
import { fmt, monthLabel } from "@/lib/gestion/format";
import { useLocale } from "@/components/i18n/LocaleProvider";

export type Palier1HistoryEntryView = {
  type: "sale" | "expense";
  id: string;
  dateIso: string;
  label: string;
  amount: number;
  isPersonal?: boolean;
  receiptUrl?: string | null;
};

export function Palier1History({
  monthKeys,
  historyByMonth,
}: {
  monthKeys: string[];
  historyByMonth: Record<string, Palier1HistoryEntryView[]>;
}) {
  const { t, locale } = useLocale();
  const [activeMonth, setActiveMonth] = useState(monthKeys[0]);
  const entries = historyByMonth[activeMonth] ?? [];

  return (
    <div className="g-card">
      <h2>{t("gestion.palier1.historyTitle")}</h2>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {monthKeys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveMonth(key)}
            className={`g-btn small ${key === activeMonth ? "" : "secondary"}`}
          >
            {monthLabel(key, locale)}
          </button>
        ))}
      </div>

      <div className="g-table-wrap">
        <table className="g-table">
          <thead>
            <tr>
              <th>{t("gestion.palier1.dateColumn")}</th>
              <th>{t("gestion.palier1.descriptionColumn")}</th>
              <th className="right">{t("gestion.palier1.amountColumn")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={`${e.type}-${e.id}`}>
                <td className="num">{e.dateIso.slice(0, 10)}</td>
                <td>
                  {e.label}
                  {e.type === "expense" && (
                    <span
                      className="g-hint"
                      style={{ marginLeft: 6 }}
                    >
                      ({e.isPersonal ? t("gestion.palier1.personal") : t("gestion.palier1.professional")})
                    </span>
                  )}
                </td>
                <td
                  className="right num"
                  style={{ color: e.type === "sale" ? "var(--g-good)" : "var(--g-critical)" }}
                >
                  {e.type === "sale" ? "+" : "-"}
                  {fmt(e.amount)}
                </td>
                <td>
                  {e.receiptUrl && (
                    <a href={e.receiptUrl} target="_blank" rel="noopener noreferrer" title={t("gestion.palier1.viewReceipt")}>
                      <Paperclip size={15} />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {entries.length === 0 && <div className="g-empty">{t("gestion.palier1.emptyMonth")}</div>}
    </div>
  );
}
