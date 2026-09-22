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
import { AutoSubmitSelect } from "@/components/gestion/AutoSubmitSelect";
import { AnalysisTrendChart } from "@/components/gestion/AnalysisTrendChart";
import { ExpenseCategoryChart } from "@/components/gestion/ExpenseCategoryChart";

const PERIOD_OPTIONS = [
  { value: "3", label: "3 derniers mois" },
  { value: "6", label: "6 derniers mois" },
  { value: "12", label: "12 derniers mois" },
  { value: "all", label: "Depuis le début" },
];

export default async function AnalysePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; month?: string }>;
}) {
  await requirePalier2Page();
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
    getAnalysisData(business.id, period),
    isServices ? Promise.resolve([]) : getProductMovement(business.id, selectedMonth),
  ]);

  return (
    <form method="get">
      <div className="g-month-pill">
        <span style={{ fontSize: "0.8rem", color: "var(--g-muted)" }}>Période</span>
        <AutoSubmitSelect name="period" defaultValue={period} options={PERIOD_OPTIONS} />
      </div>

      <div className="g-chart-card">
        <h2>Évolution CA / Dépenses / Bénéfice net</h2>
        <div className="g-hint">
          CA (livré), dépenses et bénéfice net réel, mois par mois.
        </div>
        <AnalysisTrendChart rows={monthlyTotals} />
      </div>

      <div className="g-chart-card">
        <h2>Dépenses par catégorie</h2>
        <div className="g-hint">
          Pour repérer, par exemple, si le budget pub augmente mois après mois. Les 5 catégories
          les plus dépensières sur la période s&apos;affichent individuellement ; le reste est
          regroupé dans « Autre ».
        </div>
        <ExpenseCategoryChart rows={categoryByMonth} categories={chartCategories} />
      </div>

      <div className="g-card">
        <h2>Récapitulatif mensuel</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Mois</th>
                <th className="right">CA livré</th>
                <th className="right">Coût réel</th>
                <th className="right">Dépenses</th>
                <th className="right">Bénéfice net réel</th>
              </tr>
            </thead>
            <tbody>
              {[...monthlyTotals].reverse().map((row) => (
                <tr key={row.month}>
                  <td style={{ textTransform: "capitalize" }}>{monthLabel(row.month)}</td>
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
            <h2 style={{ margin: 0 }}>Mouvement des produits</h2>
            <div className="g-month-pill" style={{ margin: 0 }}>
              <span style={{ fontSize: "0.8rem", color: "var(--g-muted)" }}>Mois</span>
              <AutoSubmitSelect
                name="month"
                defaultValue={selectedMonth}
                options={monthOptions.map((k) => ({ value: k, label: monthLabel(k) }))}
              />
            </div>
          </div>
          <div className="g-hint">
            Ce qui a vraiment bougé ce mois-ci, produit par produit — vendu, produit, et ce qu&apos;il
            en restait à la fin du mois.
          </div>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th className="right">Quantité vendue</th>
                  <th className="right">Quantité produite</th>
                  <th className="right">Stock disponible (fin de mois)</th>
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
            <div className="g-empty">Aucun produit enregistré.</div>
          )}
        </div>
      )}
    </form>
  );
}
