import { Plus } from "lucide-react";
import { getCurrentBusiness } from "@/lib/current-business";
import { getExpenses } from "@/lib/gestion/queries";
import { createExpense, deleteExpense, updateExpense } from "@/lib/gestion/actions";
import { fmt, todayStr } from "@/lib/gestion/format";
import { expenseCategoryLabels, expenseCategoryOptions } from "@/lib/gestion/expense-categories";
import { getServerT } from "@/lib/i18n/server";
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";
import { EditExpenseButton } from "@/components/gestion/EditExpenseButton";
import { SpreadExpenseFields } from "@/components/gestion/SpreadExpenseFields";

export default async function DepensesPage() {
  const { t } = await getServerT();
  const business = await getCurrentBusiness();
  const expenses = await getExpenses(business.id);
  const categoryOptions = expenseCategoryOptions(t);
  const categoryLabels = expenseCategoryLabels(t);

  return (
    <>
      <div className="g-card">
        <h2>{t("gestion.depenses.newExpenseTitle")}</h2>
        <div className="g-hint">{t("gestion.depenses.hint")}</div>
        <form action={createExpense} className="g-field-grid">
          <div className="g-field">
            <label>{t("gestion.editCommon.dateLabel")}</label>
            <input type="date" name="date" defaultValue={todayStr()} required />
          </div>
          <div className="g-field">
            <label>{t("gestion.editCommon.descriptionLabel")}</label>
            <input type="text" name="description" placeholder={t("gestion.depenses.descriptionPlaceholder")} required />
          </div>
          <div className="g-field">
            <label>{t("gestion.editCommon.categoryLabel")}</label>
            <select name="category" defaultValue="" required>
              <option value="" disabled>
                {t("gestion.depenses.categoryPlaceholder")}
              </option>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="g-field">
            <label>{t("gestion.editCommon.amountLabel")}</label>
            <input type="number" name="amount" min="0.01" step="0.01" required />
          </div>
          <SpreadExpenseFields />
          <button type="submit" className="g-btn">
            <Plus size={15} /> {t("common.add")}
          </button>
        </form>
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
              </tr>
            </thead>
            <tbody>
              {expenses.map((d) => (
                <tr key={d.id}>
                  <td className="num">{d.date.toISOString().slice(0, 10)}</td>
                  <td>
                    {d.description}
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
    </>
  );
}
