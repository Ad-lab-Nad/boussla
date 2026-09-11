import {
  AlertTriangle,
  Clock,
  Landmark,
  PackageMinus,
  Receipt,
  RotateCcw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { getAvailableMonthKeys, getDashboardData } from "@/lib/gestion/queries";
import {
  fmt,
  fmtNumber,
  formatDelta,
  monthLabel,
  todayStr,
  monthKeyFromDateStr,
} from "@/lib/gestion/format";
import { AutoSubmitSelect } from "@/components/gestion/AutoSubmitSelect";
import { KpiCard } from "@/components/gestion/KpiCard";
import { RevenueTrendChart } from "@/components/gestion/RevenueTrendChart";
import { TopProductsChart } from "@/components/gestion/TopProductsChart";

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

  const { totals, previousTotals, trend, stockAlerts } = await getDashboardData(user.id, month);

  return (
    <>
      <form method="get">
        <div className="g-month-pill">
          <span style={{ fontSize: "0.8rem", color: "var(--g-muted)" }}>Mois analysé</span>
          <AutoSubmitSelect
            name="month"
            defaultValue={month}
            options={monthOptions.map((k) => ({ value: k, label: monthLabel(k) }))}
          />
        </div>
      </form>

      <div className="g-kpi-grid">
        <KpiCard
          label="CA (livré)"
          value={fmt(totals.revenue)}
          icon={TrendingUp}
          tone="blue"
          delta={formatDelta(totals.revenue, previousTotals.revenue)}
          deltaGoodWhenUp
        />
        <KpiCard
          label="Coût réel"
          value={fmt(totals.cost)}
          icon={PackageMinus}
          tone="orange"
          delta={formatDelta(totals.cost, previousTotals.cost)}
          deltaGoodWhenUp={false}
        />
        <KpiCard
          label="Dépenses (pub, etc.)"
          value={fmt(totals.expensesTotal)}
          icon={Receipt}
          tone="violet"
          delta={formatDelta(totals.expensesTotal, previousTotals.expensesTotal)}
          deltaGoodWhenUp={false}
        />
        <KpiCard
          label="Bénéfice net réel"
          value={fmt(totals.netProfit)}
          icon={Wallet}
          tone={totals.netProfit >= 0 ? "good" : "critical"}
          delta={formatDelta(totals.netProfit, previousTotals.netProfit)}
          deltaGoodWhenUp
        />
        <KpiCard
          label="Trésorerie du mois (cash)"
          value={fmt(totals.cashFlow)}
          icon={Landmark}
          tone={totals.cashFlow >= 0 ? "aqua" : "critical"}
          delta={formatDelta(totals.cashFlow, previousTotals.cashFlow)}
          deltaGoodWhenUp
        />
        <KpiCard
          label="Montant impayé"
          value={fmt(totals.unpaidAmount)}
          icon={AlertTriangle}
          tone={totals.unpaidAmount > 0 ? "warning" : "good"}
        />
      </div>

      <div className="g-stat-strip">
        <div className="g-stat-chip">
          <span className="g-stat-chip__icon">
            <Clock />
          </span>
          <div>
            <div className="g-stat-chip__value">{totals.inProgressCount}</div>
            <div className="g-stat-chip__label">Commandes en cours</div>
          </div>
        </div>
        <div className="g-stat-chip">
          <span className="g-stat-chip__icon">
            <RotateCcw />
          </span>
          <div>
            <div className="g-stat-chip__value">{totals.returnedCount}</div>
            <div className="g-stat-chip__label">Commandes retournées</div>
          </div>
        </div>
      </div>

      <div className="g-charts-row">
        <div className="g-chart-card">
          <h2>Évolution du CA</h2>
          <div className="g-hint">CA (livré) et bénéfice net réel, 6 derniers mois.</div>
          <RevenueTrendChart trend={trend} />
        </div>

        <div className="g-chart-card">
          <h2>Produits les plus vendus</h2>
          <div className="g-hint">CA généré ce mois-ci, par produit.</div>
          {totals.topProducts.length === 0 ? (
            <div className="g-empty">Aucune commande livrée ce mois-ci.</div>
          ) : (
            <TopProductsChart products={totals.topProducts} />
          )}
        </div>
      </div>

      <div className="g-card">
        <h2>Détail des produits vendus ce mois</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th className="right">Quantité livrée</th>
                <th className="right">CA généré</th>
              </tr>
            </thead>
            <tbody>
              {totals.topProducts.map((r) => (
                <tr key={r.key}>
                  <td>{r.name}</td>
                  <td className="right num">{fmtNumber(r.quantity)}</td>
                  <td className="right num">{fmt(r.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totals.topProducts.length === 0 && (
          <div className="g-empty">Aucune commande livrée ce mois-ci.</div>
        )}
      </div>

      <div className="g-card">
        <h2>Alertes stock</h2>
        {stockAlerts.length === 0 ? (
          <div className="g-empty">Aucune alerte — tous les stocks sont au-dessus du seuil.</div>
        ) : (
          stockAlerts.map(({ item, remaining }) => (
            <div className="g-alert-row" key={item.id}>
              <span className="g-alert-row__icon">
                <AlertTriangle />
              </span>
              <span className="g-alert-row__name">{item.name}</span>
              <span className="num g-alert-row__value">
                {fmtNumber(remaining)} {item.unit} restant(es)
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
