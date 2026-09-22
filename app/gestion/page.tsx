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
import { getCurrentBusiness } from "@/lib/current-business";
import { getOrCreateSubscription } from "@/lib/subscription";
import { canAccessPalier2 } from "@/lib/subscription-access";
import { getServerT } from "@/lib/i18n/server";
import {
  getAverageSellPrice,
  getAvailableMonthKeys,
  getDashboardData,
  getMonthlyGoal,
  getPalier1Overview,
} from "@/lib/gestion/queries";
import { setMonthlyGoal } from "@/lib/gestion/actions";
import { Palier1Dashboard } from "@/components/gestion/Palier1Dashboard";
import { computeGoalProgress, estimateUnitsPerDay } from "@/lib/gestion/calculations";
import {
  fmt,
  fmtNumber,
  formatDelta,
  monthLabel,
  todayStr,
  monthKeyFromDateStr,
  daysRemainingInMonth,
} from "@/lib/gestion/format";
import { fmtQty } from "@/lib/gestion/product-units";
import { AutoSubmitSelect } from "@/components/gestion/AutoSubmitSelect";
import { KpiCard } from "@/components/gestion/KpiCard";
import { MonthlyGoalCard } from "@/components/gestion/MonthlyGoalCard";
import { RevenueTrendChart } from "@/components/gestion/RevenueTrendChart";
import { TopProductsChart } from "@/components/gestion/TopProductsChart";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: requestedMonth } = await searchParams;

  const { t, locale } = await getServerT();
  const user = await getCurrentUser();
  const business = await getCurrentBusiness();
  const subscription = await getOrCreateSubscription(user.id);

  if (!canAccessPalier2(subscription)) {
    const overview = await getPalier1Overview(business.id);
    return <Palier1Dashboard overview={overview} />;
  }

  const monthOptions = await getAvailableMonthKeys(business.id);
  const currentMonth = monthKeyFromDateStr(todayStr());
  const month =
    requestedMonth && monthOptions.includes(requestedMonth) ? requestedMonth : currentMonth;

  const [{ totals, previousTotals, trend, stockAlerts }, monthlyGoal, avgSellPrice] =
    await Promise.all([
      getDashboardData(business.id, month),
      getMonthlyGoal(business.id, month),
      getAverageSellPrice(business.id),
    ]);

  const isCurrentMonth = month === currentMonth;
  const daysLeft = isCurrentMonth ? daysRemainingInMonth() : 0;
  const goalProgress = monthlyGoal ? computeGoalProgress(monthlyGoal.targetRevenue, totals.revenue) : null;
  const unitsPerDay =
    goalProgress && isCurrentMonth
      ? estimateUnitsPerDay(goalProgress.remaining, daysLeft, avgSellPrice)
      : null;

  return (
    <>
      <form method="get">
        <div className="g-month-pill">
          <span style={{ fontSize: "0.8rem", color: "var(--g-muted)" }}>{t("gestion.dashboard.monthAnalyzed")}</span>
          <AutoSubmitSelect
            name="month"
            defaultValue={month}
            options={monthOptions.map((k) => ({ value: k, label: monthLabel(k, locale) }))}
          />
        </div>
      </form>

      <MonthlyGoalCard
        month={month}
        targetRevenue={monthlyGoal?.targetRevenue ?? null}
        revenueSoFar={totals.revenue}
        remaining={goalProgress?.remaining ?? 0}
        progressPct={goalProgress?.progressPct ?? 0}
        reached={goalProgress?.reached ?? false}
        isCurrentMonth={isCurrentMonth}
        daysLeft={daysLeft}
        unitsPerDay={unitsPerDay}
        setMonthlyGoalAction={setMonthlyGoal}
      />

      <div className="g-kpi-grid">
        <KpiCard
          label={t("gestion.dashboard.revenue")}
          value={fmt(totals.revenue)}
          icon={TrendingUp}
          tone="blue"
          delta={formatDelta(totals.revenue, previousTotals.revenue, t)}
          deltaGoodWhenUp
        />
        <KpiCard
          label={t("gestion.dashboard.realCost")}
          value={fmt(totals.cost)}
          icon={PackageMinus}
          tone="orange"
          delta={formatDelta(totals.cost, previousTotals.cost, t)}
          deltaGoodWhenUp={false}
        />
        <KpiCard
          label={t("gestion.dashboard.expenses")}
          value={fmt(totals.expensesTotal)}
          icon={Receipt}
          tone="violet"
          delta={formatDelta(totals.expensesTotal, previousTotals.expensesTotal, t)}
          deltaGoodWhenUp={false}
        />
        <KpiCard
          label={t("gestion.dashboard.netProfit")}
          value={fmt(totals.netProfit)}
          icon={Wallet}
          tone={totals.netProfit >= 0 ? "good" : "critical"}
          delta={formatDelta(totals.netProfit, previousTotals.netProfit, t)}
          deltaGoodWhenUp
        />
        <KpiCard
          label={t("gestion.dashboard.cashFlow")}
          value={fmt(totals.cashFlow)}
          icon={Landmark}
          tone={totals.cashFlow >= 0 ? "aqua" : "critical"}
          delta={formatDelta(totals.cashFlow, previousTotals.cashFlow, t)}
          deltaGoodWhenUp
        />
        <KpiCard
          label={t("gestion.dashboard.unpaidAmount")}
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
            <div className="g-stat-chip__label">{t("gestion.dashboard.ordersInProgress")}</div>
          </div>
        </div>
        <div className="g-stat-chip">
          <span className="g-stat-chip__icon">
            <RotateCcw />
          </span>
          <div>
            <div className="g-stat-chip__value">{totals.returnedCount}</div>
            <div className="g-stat-chip__label">{t("gestion.dashboard.ordersReturned")}</div>
          </div>
        </div>
      </div>

      <div className="g-charts-row">
        <div className="g-chart-card">
          <h2>{t("gestion.dashboard.revenueEvolution")}</h2>
          <div className="g-hint">{t("gestion.dashboard.revenueEvolutionHint")}</div>
          <RevenueTrendChart trend={trend} />
        </div>

        <div className="g-chart-card">
          <h2>{t("gestion.dashboard.topProducts")}</h2>
          <div className="g-hint">{t("gestion.dashboard.topProductsHint")}</div>
          {totals.topProducts.length === 0 ? (
            <div className="g-empty">{t("gestion.dashboard.noDeliveredOrders")}</div>
          ) : (
            <TopProductsChart products={totals.topProducts} />
          )}
        </div>
      </div>

      <div className="g-card">
        <h2>{t("gestion.dashboard.productsDetailTitle")}</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>{t("gestion.dashboard.productColumn")}</th>
                <th className="right">{t("gestion.dashboard.quantityDeliveredColumn")}</th>
                <th className="right">{t("gestion.dashboard.revenueGeneratedColumn")}</th>
              </tr>
            </thead>
            <tbody>
              {totals.topProducts.map((r) => (
                <tr key={r.key}>
                  <td>{r.name}</td>
                  <td className="right num">{fmtQty(r.quantity, r.sellUnit)}</td>
                  <td className="right num">{fmt(r.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totals.topProducts.length === 0 && (
          <div className="g-empty">{t("gestion.dashboard.noDeliveredOrders")}</div>
        )}
      </div>

      <div className="g-card">
        <h2>{t("gestion.dashboard.stockAlertsTitle")}</h2>
        {stockAlerts.length === 0 ? (
          <div className="g-empty">{t("gestion.dashboard.noStockAlerts")}</div>
        ) : (
          stockAlerts.map(({ item, remaining }) => (
            <div className="g-alert-row" key={item.id}>
              <span className="g-alert-row__icon">
                <AlertTriangle />
              </span>
              <span className="g-alert-row__name">{item.name}</span>
              <span className="num g-alert-row__value">
                {t("gestion.dashboard.remainingUnits", { quantity: fmtNumber(remaining), unit: item.unit })}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
