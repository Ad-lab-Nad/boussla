import { getCurrentUser } from "@/lib/current-user";
import { getAvailableMonthKeys, getDashboardData } from "@/lib/gestion/queries";
import { fmt, fmtNumber, monthLabel, todayStr, monthKeyFromDateStr } from "@/lib/gestion/format";
import { AutoSubmitSelect } from "@/components/gestion/AutoSubmitSelect";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: requestedMonth } = await searchParams;

  const user = await getCurrentUser();
  const monthOptions = await getAvailableMonthKeys(user.id);
  const currentMonth = monthKeyFromDateStr(todayStr());
  const month =
    requestedMonth && monthOptions.includes(requestedMonth) ? requestedMonth : currentMonth;

  const { totals, stockAlerts } = await getDashboardData(user.id, month);

  return (
    <>
      <form method="get">
        <div className="month-pill">
          <span style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>Mois analysé</span>
          <AutoSubmitSelect
            name="month"
            defaultValue={month}
            options={monthOptions.map((k) => ({ value: k, label: monthLabel(k) }))}
          />
        </div>
      </form>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="label">CA (livré)</div>
          <div className="value">{fmt(totals.revenue)}</div>
        </div>
        <div className="kpi">
          <div className="label">Coût réel</div>
          <div className="value">{fmt(totals.cost)}</div>
        </div>
        <div className="kpi">
          <div className="label">Dépenses (pub, etc.)</div>
          <div className="value">{fmt(totals.expensesTotal)}</div>
        </div>
        <div className={`kpi profit ${totals.netProfit < 0 ? "negative" : ""}`}>
          <div className="label">Bénéfice net réel</div>
          <div className="value">{fmt(totals.netProfit)}</div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="label">Commandes en cours</div>
          <div className="value">{totals.inProgressCount}</div>
        </div>
        <div className="kpi">
          <div className="label">Commandes retournées</div>
          <div className="value">{totals.returnedCount}</div>
        </div>
        <div className="kpi">
          <div className="label">Trésorerie du mois (cash)</div>
          <div className="value">{fmt(totals.cashFlow)}</div>
        </div>
        <div className={`kpi ${totals.unpaidAmount > 0 ? "warn" : ""}`}>
          <div className="label">Montant impayé</div>
          <div className="value">{fmt(totals.unpaidAmount)}</div>
        </div>
      </div>

      <div className="card">
        <h2>Produits les plus vendus ce mois</h2>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th className="right">Quantité livrée</th>
              <th className="right">CA généré</th>
            </tr>
          </thead>
          <tbody>
            {totals.topProducts.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty">
                  Aucune commande livrée ce mois-ci.
                </td>
              </tr>
            ) : (
              totals.topProducts.map((r) => (
                <tr key={r.key}>
                  <td>{r.name}</td>
                  <td className="right num">{fmtNumber(r.quantity)}</td>
                  <td className="right num">{fmt(r.revenue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Alertes stock</h2>
        {stockAlerts.length === 0 ? (
          <div className="empty">Aucune alerte — tous les stocks sont au-dessus du seuil.</div>
        ) : (
          stockAlerts.map(({ item, remaining }) => (
            <div className="alert-row" key={item.id}>
              <span>⚠️ {item.name}</span>
              <span className="num" style={{ color: "var(--red)", fontWeight: 700 }}>
                {fmtNumber(remaining)} {item.unit} restant(es)
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
