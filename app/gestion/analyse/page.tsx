import { getCurrentUser } from "@/lib/current-user";
import { getCurrentBusiness } from "@/lib/current-business";
import { requirePalier2Page } from "@/lib/subscription-access";
import {
  getAnalysisData,
  getAvailableMonthKeys,
  getProductMovement,
  type AnalysisPeriod,
} from "@/lib/gestion/queries";
import { fmt, monthLabel, monthKeyFromDateStr, todayStr } from "@/lib/gestion/format";
import { fmtQty } from "@/lib/gestion/product-units";
import { getServerT } from "@/lib/i18n/server";
import type { TFunction } from "@/lib/i18n/translate";
import { AutoSubmitSelect } from "@/components/gestion/AutoSubmitSelect";
import { AnalysisTrendChart } from "@/components/gestion/AnalysisTrendChart";
import { ExpenseCategoryChart } from "@/components/gestion/ExpenseCategoryChart";

function periodOptions(t: TFunction) {
  return [
    { value: "3", label: t("gestion.analyse.period3") },
    { value: "6", label: t("gestion.analyse.period6") },
    { value: "12", label: t("gestion.analyse.period12") },
    { value: "all", label: t("gestion.analyse.periodAll") },
  ];
}

export default async function AnalysePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; month?: string }>;
}) {
  await requirePalier2Page();
  const { t, locale } = await getServerT();
  const { period: rawPeriod, month: rawMonth } = await searchParams;
  const period: AnalysisPeriod = ["3", "6", "12", "all"].includes(rawPeriod ?? "")
    ? (rawPeriod as AnalysisPeriod)
    : "6";

  const user = await getCurrentUser();
  const business = await getCurrentBusiness();
  const isServices = user.activityType === "SERVICES";

  const monthOptions = await getAvailableMonthKeys(business.id);
  const currentMonth = monthKeyFromDateStr(todayStr());
  const selectedMonth =
    rawMonth && monthOptions.includes(rawMonth) ? rawMonth : currentMonth;

  const [{ monthlyTotals, categoryByMonth, chartCategories }, productMovement] = await Promise.all([
    getAnalysisData(business.id, period, t),
    isServices ? Promise.resolve([]) : getProductMovement(business.id, selectedMonth),
  ]);

  return (
    <form method="get">
      <div className="g-month-pill">
        <span style={{ fontSize: "0.8rem", color: "var(--g-muted)" }}>{t("gestion.analyse.periodLabel")}</span>
        <AutoSubmitSelect name="period" defaultValue={period} options={periodOptions(t)} />
      </div>

      <div className="g-chart-card">
        <h2>{t("gestion.analyse.trendTitle")}</h2>
        <div className="g-hint">{t("gestion.analyse.trendHint")}</div>
        <AnalysisTrendChart rows={monthlyTotals} />
      </div>

      <div className="g-chart-card">
        <h2>{t("gestion.analyse.categoryTitle")}</h2>
        <div className="g-hint">{t("gestion.analyse.categoryHint")}</div>
        <ExpenseCategoryChart rows={categoryByMonth} categories={chartCategories} />
      </div>

      <div className="g-card">
        <h2>{t("gestion.analyse.summaryTitle")}</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>{t("gestion.analyse.monthColumn")}</th>
                <th className="right">{t("gestion.analyse.revenueColumn")}</th>
                <th className="right">{t("gestion.dashboard.realCost")}</th>
                <th className="right">{t("gestion.editCommon.amountLabel")}</th>
                <th className="right">{t("gestion.dashboard.netProfit")}</th>
              </tr>
            </thead>
            <tbody>
              {[...monthlyTotals].reverse().map((row) => (
                <tr key={row.month}>
                  <td style={{ textTransform: "capitalize" }}>{monthLabel(row.month, locale)}</td>
                  <td className="right num">{fmt(row.revenue)}</td>
                  <td className="right num">{fmt(row.cost)}</td>
                  <td className="right num">{fmt(row.expensesTotal)}</td>
                  <td
                    className="right num"
                    style={
                      row.netProfit < 0 ? { color: "var(--g-critical)", fontWeight: 700 } : undefined
                    }
                  >
                    {fmt(row.netProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!isServices && (
        <div className="g-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <h2 style={{ margin: 0 }}>{t("gestion.analyse.movementTitle")}</h2>
            <div className="g-month-pill" style={{ margin: 0 }}>
              <span style={{ fontSize: "0.8rem", color: "var(--g-muted)" }}>{t("gestion.analyse.monthColumn")}</span>
              <AutoSubmitSelect
                name="month"
                defaultValue={selectedMonth}
                options={monthOptions.map((k) => ({ value: k, label: monthLabel(k, locale) }))}
              />
            </div>
          </div>
          <div className="g-hint">{t("gestion.analyse.movementHint")}</div>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>{t("gestion.produits.productColumn")}</th>
                  <th className="right">{t("gestion.analyse.soldQuantityColumn")}</th>
                  <th className="right">{t("gestion.analyse.producedQuantityColumn")}</th>
                  <th className="right">{t("gestion.analyse.availableEndOfMonthColumn")}</th>
                </tr>
              </thead>
              <tbody>
                {productMovement.map((row) => (
                  <tr key={row.product.id}>
                    <td>{row.product.name}</td>
                    <td className="right num">{fmtQty(row.soldThisMonth, row.product.sellUnit)}</td>
                    <td className="right num">{fmtQty(row.producedThisMonth, row.product.sellUnit)}</td>
                    <td
                      className="right num"
                      style={
                        row.availableAtMonthEnd <= 0
                          ? { color: "var(--g-critical)", fontWeight: 700 }
                          : undefined
                      }
                    >
                      {fmtQty(row.availableAtMonthEnd, row.product.sellUnit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {productMovement.length === 0 && (
            <div className="g-empty">{t("gestion.analyse.emptyProducts")}</div>
          )}
        </div>
      )}
    </form>
  );
}
