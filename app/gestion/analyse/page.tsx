import { getCurrentUser } from "@/lib/current-user";
import { getAnalysisData, type AnalysisPeriod } from "@/lib/gestion/queries";
import { fmt, monthLabel } from "@/lib/gestion/format";
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
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: rawPeriod } = await searchParams;
  const period: AnalysisPeriod = ["3", "6", "12", "all"].includes(rawPeriod ?? "")
    ? (rawPeriod as AnalysisPeriod)
    : "6";

  const user = await getCurrentUser();
  const { monthlyTotals, categoryByMonth } = await getAnalysisData(user.id, period);

  return (
    <>
      <form method="get">
        <div className="g-month-pill">
          <span style={{ fontSize: "0.8rem", color: "var(--g-muted)" }}>Période</span>
          <AutoSubmitSelect name="period" defaultValue={period} options={PERIOD_OPTIONS} />
        </div>
      </form>

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
          Pour repérer, par exemple, si le budget pub augmente mois après mois.
        </div>
        <ExpenseCategoryChart rows={categoryByMonth} />
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
    </>
  );
}
