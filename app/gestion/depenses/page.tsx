import { Paperclip } from "lucide-react";
import { getCurrentBusiness } from "@/lib/current-business";
import { getExpenses } from "@/lib/gestion/queries";
import { deleteExpense, updateExpense } from "@/lib/gestion/actions";
import { fmt } from "@/lib/gestion/format";
import { expenseCategoryLabels } from "@/lib/gestion/expense-categories";
import { getReceiptSignedUrl } from "@/lib/gestion/receipts";
import { getServerT } from "@/lib/i18n/server";
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";
import { EditExpenseButton } from "@/components/gestion/EditExpenseButton";
import { ExpenseQuickForm } from "@/components/gestion/ExpenseQuickForm";

export default async function DepensesPage() {
  const { t } = await getServerT();
  const business = await getCurrentBusiness();
  const expenses = await getExpenses(business.id);
  const categoryLabels = expenseCategoryLabels(t);
  const receiptUrls = await Promise.all(
    expenses.map((d) => (d.receiptPath ? getReceiptSignedUrl(d.receiptPath, business.id) : Promise.resolve(null)))
  );

  return (
    <>
      <div className="g-card">
        <h2>{t("gestion.depenses.newExpenseTitle")}</h2>
        <div className="g-hint">{t("gestion.depenses.hint")}</div>
        <ExpenseQuickForm />
      </div>

      <div className="g-card">
        <h2>{t("gestion.depenses.allExpensesTitle")}</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>{t("gestion.editCommon.dateLabel")}</th>
                <th>{t("gestion.editCommon.descriptionLabel")}</th>
                <th>{t("gestion.editCommon.categoryLabel")}</th>
                <th className="right">{t("gestion.editCommon.amountLabel")}</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((d, i) => (
                <tr key={d.id}>
                  <td className="num">{d.date.toISOString().slice(0, 10)}</td>
                  <td>
                    {d.description}{" "}
                    <span className="g-hint" style={{ marginLeft: 4 }}>
                      ({d.isPersonal ? t("gestion.palier1.personal") : t("gestion.palier1.professional")})
                    </span>
                    {d.spreadMonths && d.spreadMonths > 1 && (
                      <div style={{ fontSize: "0.72rem", color: "var(--g-muted)" }}>
                        {t("gestion.depenses.spreadOver", {
                          months: d.spreadMonths,
                          perMonth: fmt(d.amount / d.spreadMonths),
                        })}
                      </div>
                    )}
                  </td>
                  <td>{categoryLabels[d.category]}</td>
                  <td className="right num">{fmt(d.amount)}</td>
                  <td>
                    {receiptUrls[i] && (
                      <a href={receiptUrls[i]!} target="_blank" rel="noopener noreferrer" title={t("gestion.palier1.viewReceipt")}>
                        <Paperclip size={15} />
                      </a>
                    )}
                  </td>
                  <td style={{ display: "flex", gap: 2 }}>
                    <EditExpenseButton expense={d} updateExpenseAction={updateExpense} />
                    <form action={deleteExpense}>
                      <input type="hidden" name="id" value={d.id} />
                      <ConfirmSubmitButton confirmMessage={t("gestion.confirm.deleteExpense")} title={t("common.delete")} />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {expenses.length === 0 && <div className="g-empty">{t("gestion.depenses.emptyState")}</div>}
      </div>

      <div className="g-card">
        <h2>{t("gestion.depenses.receiptsGalleryTitle")}</h2>
        <div className="g-hint">{t("gestion.depenses.receiptsGalleryHint")}</div>
        <div className="g-receipt-grid">
          {expenses.map((d, i) =>
            receiptUrls[i] ? (
              <a
                key={d.id}
                href={receiptUrls[i]!}
                target="_blank"
                rel="noopener noreferrer"
                className="g-receipt-thumb"
                title={t("gestion.palier1.viewReceipt")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- a signed, time-limited Supabase Storage URL, not an optimizable static asset */}
                <img src={receiptUrls[i]!} alt={d.description} />
                <div className="g-receipt-thumb__caption">
                  <span>{d.date.toISOString().slice(0, 10)}</span>
                  <span>{fmt(d.amount)}</span>
                </div>
              </a>
            ) : null
          )}
        </div>
        {receiptUrls.every((url) => !url) && <div className="g-empty">{t("gestion.depenses.noReceipts")}</div>}
      </div>
    </>
  );
}
