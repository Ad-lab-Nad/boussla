import { Receipt, TrendingUp, Wallet } from "lucide-react";
import { fmt } from "@/lib/gestion/format";
import { getServerT } from "@/lib/i18n/server";
import { KpiCard } from "@/components/gestion/KpiCard";

export async function Palier1Dashboard({
  overview,
}: {
  overview: {
    netProfitThisMonth: number;
    revenueThisMonth: number;
    expensesThisMonth: number;
  };
}) {
  const { t } = await getServerT();

  return (
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
  );
}
