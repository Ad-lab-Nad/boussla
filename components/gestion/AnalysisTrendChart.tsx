"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useColorScheme } from "@/components/gestion/useColorScheme";
import { CHART_COLORS } from "@/lib/gestion/chart-colors";
import { fmt, monthLabelShort } from "@/lib/gestion/format";
import type { AnalysisMonthRow } from "@/lib/gestion/queries";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function AnalysisTrendChart({ rows }: { rows: AnalysisMonthRow[] }) {
  const { t, locale } = useLocale();
  const c = CHART_COLORS[useColorScheme()];
  const data = rows.map((r) => ({ ...r, label: monthLabelShort(r.month, locale) }));
  // Long ranges ("depuis le début") get a crowded x-axis otherwise.
  const tickInterval = data.length > 18 ? Math.ceil(data.length / 12) - 1 : 0;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke={c.grid} />
        <XAxis
          dataKey="label"
          tick={{ fill: c.muted, fontSize: 11 }}
          axisLine={{ stroke: c.axis }}
          tickLine={false}
          interval={tickInterval}
        />
        <YAxis
          tick={{ fill: c.muted, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={44}
          tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
        />
        <Tooltip
          formatter={(value, name) => [fmt(Number(value)), String(name)]}
          contentStyle={{
            background: c.surface,
            border: `1px solid ${c.grid}`,
            borderRadius: 10,
            fontSize: 12,
          }}
          labelStyle={{ color: c.ink2, fontWeight: 600, marginBottom: 4 }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: c.ink2 }} iconType="line" iconSize={14} />
        <Line
          type="monotone"
          dataKey="revenue"
          name={t("gestion.charts.revenueLivree")}
          stroke={c.blue}
          strokeWidth={2}
          dot={{ r: 3, fill: c.blue, strokeWidth: 2, stroke: c.surface }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: c.surface }}
        />
        <Line
          type="monotone"
          dataKey="expensesTotal"
          name={t("gestion.nav.expenses")}
          stroke={c.violet}
          strokeWidth={2}
          dot={{ r: 3, fill: c.violet, strokeWidth: 2, stroke: c.surface }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: c.surface }}
        />
        <Line
          type="monotone"
          dataKey="netProfit"
          name={t("gestion.charts.realNetProfit")}
          stroke={c.aqua}
          strokeWidth={2}
          dot={{ r: 3, fill: c.aqua, strokeWidth: 2, stroke: c.surface }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: c.surface }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
