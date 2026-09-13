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
import type { ExpenseCategoryPoint } from "@/lib/gestion/queries";

// Fixed categorical order for whichever categories actually rank in this
// period (never reassigned per render) — up to 5 fits the palette's soft
// cap for a legend-backed multi-line chart. "Autre" (always last in
// `categories`, see getAnalysisData) gets a muted tone instead of a 6th
// categorical hue — it's a catch-all bucket, not a series of its own.
const SERIES_TONES = ["blue", "orange", "aqua", "yellow", "magenta"] as const;

export function ExpenseCategoryChart({
  rows,
  categories,
}: {
  rows: ExpenseCategoryPoint[];
  categories: { value: string; label: string }[];
}) {
  const c = CHART_COLORS[useColorScheme()];
  const data = rows.map((r) => ({ ...r, label: monthLabelShort(r.month) }));
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
        {categories.map((opt, i) => {
          const isOther = opt.value === "OTHER";
          const color = isOther ? c.muted : c[SERIES_TONES[i]];
          return (
            <Line
              key={opt.value}
              type="monotone"
              dataKey={opt.value}
              name={opt.label}
              stroke={color}
              strokeWidth={2}
              strokeDasharray={isOther ? "4 3" : undefined}
              dot={{ r: 3, fill: color, strokeWidth: 2, stroke: c.surface }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: c.surface }}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
