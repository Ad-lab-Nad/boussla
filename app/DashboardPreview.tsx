import { TrendingUp, Wallet } from "lucide-react";
import { KpiCard } from "@/components/gestion/KpiCard";
import { RevenueTrendChart } from "@/components/gestion/RevenueTrendChart";
import { fmt, formatDelta } from "@/lib/gestion/format";

// Example numbers only — never a real account's data. Deliberately climbing,
// per the brief, to show the story at a glance: "ça peut monter comme ça".
const EXAMPLE_TREND = [
  { month: "2026-04", revenue: 850, netProfit: 480 },
  { month: "2026-05", revenue: 1100, netProfit: 620 },
  { month: "2026-06", revenue: 1300, netProfit: 740 },
  { month: "2026-07", revenue: 1750, netProfit: 1010 },
  { month: "2026-08", revenue: 2200, netProfit: 1290 },
  { month: "2026-09", revenue: 2850, netProfit: 1700 },
];

export function DashboardPreview() {
  const last = EXAMPLE_TREND[EXAMPLE_TREND.length - 1];
  const prev = EXAMPLE_TREND[EXAMPLE_TREND.length - 2];

  return (
    <div className="l-preview-frame">
      <div className="l-preview-chrome">
        <span className="l-preview-dot" style={{ background: "#e34948" }} />
        <span className="l-preview-dot" style={{ background: "#eda100" }} />
        <span className="l-preview-dot" style={{ background: "#1baf7a" }} />
        <span className="l-preview-label">Tableau de bord — aperçu</span>
      </div>
      <div className="l-preview-body gestion">
        <div className="g-kpi-grid l-preview-kpis">
          <KpiCard
            label="CA (livré)"
            value={fmt(last.revenue)}
            icon={TrendingUp}
            tone="blue"
            delta={formatDelta(last.revenue, prev.revenue)}
            deltaGoodWhenUp
          />
          <KpiCard
            label="Bénéfice net réel"
            value={fmt(last.netProfit)}
            icon={Wallet}
            tone="good"
            delta={formatDelta(last.netProfit, prev.netProfit)}
            deltaGoodWhenUp
          />
        </div>
        <div className="g-chart-card">
          <h2>Évolution du CA</h2>
          <div className="g-hint">CA (livré) et bénéfice net réel, 6 derniers mois. Exemple.</div>
          <RevenueTrendChart trend={EXAMPLE_TREND} />
        </div>
      </div>
    </div>
  );
}
