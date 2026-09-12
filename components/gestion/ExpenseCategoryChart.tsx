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
import { EXPENSE_CATEGORY_OPTIONS } from "@/lib/gestion/expense-categories";
import type { ExpenseCategoryPoint } from "@/lib/gestion/queries";

// Fixed categorical order (never reassigned per render) — five categories
// fits the palette's soft cap for a legend-backed multi-line chart.
const SERIES_TONES = ["blue", "orange", "aqua", "yellow", "magenta"] as const;

export function ExpenseCategoryChart({ rows }: { rows: ExpenseCategoryPoint[] }) {
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
        {EXPENSE_CATEGORY_OPTIONS.map((opt, i) => {
          const color = c[SERIES_TONES[i]];
          return (
            <Line
              key={opt.value}
              type="monotone"
              dataKey={opt.value}
              name={opt.label}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, fill: color, strokeWidth: 2, stroke: c.surface }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: c.surface }}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
