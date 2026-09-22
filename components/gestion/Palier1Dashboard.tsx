import { Plus } from "lucide-react";
import { fmt, todayStr } from "@/lib/gestion/format";
import { getReceiptSignedUrl } from "@/lib/gestion/receipts";
import { getServerT } from "@/lib/i18n/server";
import type { Palier1HistoryEntry } from "@/lib/gestion/queries";
import { ExpenseQuickForm } from "@/components/gestion/ExpenseQuickForm";
import { Palier1History, type Palier1HistoryEntryView } from "@/components/gestion/Palier1History";

type Overview = {
  currentMonth: string;
  monthKeys: string[];
  netProfitThisMonth: number;
  revenueThisMonth: number;
  expensesThisMonth: number;
  historyByMonth: Record<string, Palier1HistoryEntry[]>;
};

async function resolveHistory(
  historyByMonth: Record<string, Palier1HistoryEntry[]>,
  businessId: string
): Promise<Record<string, Palier1HistoryEntryView[]>> {
  const entries: [string, Palier1HistoryEntryView[]][] = await Promise.all(
    Object.entries(historyByMonth).map(async ([month, monthEntries]) => {
      const resolved = await Promise.all(
        monthEntries.map(async (e) => ({
          type: e.type,
          id: e.id,
          dateIso: e.date.toISOString(),
          label: e.label,
          amount: e.amount,
          isPersonal: e.isPersonal,
          receiptUrl: e.receiptPath ? await getReceiptSignedUrl(e.receiptPath, businessId) : null,
        }))
      );
      return [month, resolved] as [string, Palier1HistoryEntryView[]];
    })
  );
  return Object.fromEntries(entries);
}

export async function Palier1Dashboard({
  overview,
  businessId,
  createQuickSaleAction,
}: {
  overview: Overview;
  businessId: string;
  createQuickSaleAction: (formData: FormData) => Promise<void>;
}) {
  const { t } = await getServerT();
  const historyByMonth = await resolveHistory(overview.historyByMonth, businessId);

  return (
    <>
      <div className="g-card g-hero-card">
        <div className="g-hero-card__label">{t("gestion.palier1.heroLabel")}</div>
        <div
          className="g-hero-card__number"
          style={{ color: overview.netProfitThisMonth >= 0 ? "var(--g-good)" : "var(--g-critical)" }}
        >
          {fmt(overview.netProfitThisMonth)}
        </div>
        <div className="g-hint">
          {t("gestion.palier1.heroBreakdown", {
            revenue: fmt(overview.revenueThisMonth),
            expenses: fmt(overview.expensesThisMonth),
          })}
        </div>
      </div>

      <div className="g-card">
        <h2>{t("gestion.palier1.newSaleTitle")}</h2>
        <form action={createQuickSaleAction} className="g-field-grid">
          <div className="g-field">
            <label>{t("gestion.palier1.dateLabel")}</label>
            <input type="date" name="date" defaultValue={todayStr()} required />
          </div>
          <div className="g-field">
            <label>{t("gestion.palier1.amountLabel")}</label>
            <input type="number" name="amount" min="0.01" step="0.01" required />
          </div>
          <button type="submit" className="g-btn">
            <Plus size={15} /> {t("gestion.palier1.registerSale")}
          </button>
        </form>
      </div>

      <div className="g-card">
        <h2>{t("gestion.palier1.newExpenseTitle")}</h2>
        <div className="g-hint">{t("gestion.palier1.newExpenseHint")}</div>
        <ExpenseQuickForm />
      </div>

      <Palier1History monthKeys={overview.monthKeys} historyByMonth={historyByMonth} />
    </>
  );
}
