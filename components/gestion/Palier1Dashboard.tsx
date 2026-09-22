import { Receipt, TrendingUp, Wallet } from "lucide-react";
import { fmt } from "@/lib/gestion/format";
import { describeReceivable } from "@/lib/gestion/calculations";
import { getReceivables } from "@/lib/gestion/queries";
import { getServerT } from "@/lib/i18n/server";
import { TIER_PRICING } from "@/lib/subscription";
import { KpiCard } from "@/components/gestion/KpiCard";
import { UpsellPreviewCard } from "@/components/gestion/UpsellPreviewCard";
import { RevenueTrendChart } from "@/components/gestion/RevenueTrendChart";

export async function Palier1Dashboard({
  businessId,
  overview,
}: {
  businessId: string;
  overview: {
    netProfitThisMonth: number;
    revenueThisMonth: number;
    expensesThisMonth: number;
    trend: { month: string; revenue: number; netProfit: number }[];
  };
}) {
  const { t } = await getServerT();
  const now = new Date();
  const receivables = (await getReceivables(businessId)).slice(0, 3);
  const unlockLabel = t("gestion.palier1.upsell.unlockCta", { price: TIER_PRICING.PALIER_2.monthly });

  return (
    <>
      <div className="g-kpi-grid">
        <KpiCard
          label={t("gestion.dashboard.revenue")}
          value={fmt(overview.revenueThisMonth)}
          icon={TrendingUp}
          tone="blue"
        />
        <KpiCard
          label={t("gestion.dashboard.expenses")}
          value={fmt(overview.expensesThisMonth)}
          icon={Receipt}
          tone="violet"
        />
        <KpiCard
          label={t("gestion.dashboard.netProfit")}
          value={fmt(overview.netProfitThisMonth)}
          icon={Wallet}
          tone={overview.netProfitThisMonth >= 0 ? "good" : "critical"}
        />
      </div>

      <UpsellPreviewCard
        title={t("gestion.palier1.upsell.historyTitle")}
        hint={t("gestion.palier1.upsell.historyHint")}
        locked
        unlockLabel={unlockLabel}
      >
        <RevenueTrendChart trend={overview.trend} />
      </UpsellPreviewCard>

      <UpsellPreviewCard
        title={t("gestion.palier1.upsell.receivablesTitle")}
        hint={t("gestion.palier1.upsell.receivablesHint")}
        locked
        unlockLabel={unlockLabel}
      >
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>{t("gestion.clients.clientLabel")}</th>
                <th className="right">{t("gestion.clients.remainingDueColumn")}</th>
                <th>{t("gestion.clients.statusLabel")}</th>
              </tr>
            </thead>
            <tbody>
              {receivables.map((r) => {
                const { label, badge, remaining } = describeReceivable(r, now, t);
                return (
                  <tr key={r.id}>
                    <td>{r.client.name}</td>
                    <td className="right num">{fmt(remaining)}</td>
                    <td>
                      <span className={`g-badge ${badge}`}>{label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {receivables.length === 0 && <div className="g-empty">{t("gestion.clients.emptyReceivables")}</div>}
      </UpsellPreviewCard>
    </>
  );
}
