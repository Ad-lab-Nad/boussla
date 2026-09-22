import { TrendingUp, Wallet } from "lucide-react";
import { KpiCard } from "@/components/gestion/KpiCard";
import { RevenueTrendChart } from "@/components/gestion/RevenueTrendChart";
import { fmt, formatDelta } from "@/lib/gestion/format";
import { createTranslator } from "@/lib/i18n/translate";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";

// This marketing preview is deliberately French-only (out of scope for the
// Gestion module's translation) — a fixed fr translator for its own text.
// RevenueTrendChart still needs a LocaleProvider ancestor to render at all
// (it calls useLocale() internally); that provider reads the same shared
// locale cookie as the rest of the app, so in the rare case a visitor
// switched to Arabic while in /gestion and then lands here, only the
// chart's month labels would follow — accepted as a minor, low-traffic edge
// case rather than adding a "force this locale" escape hatch for one spot.
const t = createTranslator("fr");

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
            delta={formatDelta(last.revenue, prev.revenue, t)}
            deltaGoodWhenUp
          />
          <KpiCard
            label="Bénéfice net réel"
            value={fmt(last.netProfit)}
            icon={Wallet}
            tone="good"
            delta={formatDelta(last.netProfit, prev.netProfit, t)}
            deltaGoodWhenUp
          />
        </div>
        <div className="g-chart-card">
          <h2>Évolution du CA</h2>
          <div className="g-hint">CA (livré) et bénéfice net réel, 6 derniers mois. Exemple.</div>
          <LocaleProvider>
            <RevenueTrendChart trend={EXAMPLE_TREND} />
          </LocaleProvider>
        </div>
      </div>
    </div>
  );
}
