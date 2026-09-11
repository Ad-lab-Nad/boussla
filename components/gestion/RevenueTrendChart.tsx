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

type Point = { month: string; revenue: number; netProfit: number };

export function RevenueTrendChart({ trend }: { trend: Point[] }) {
  const c = CHART_COLORS[useColorScheme()];
  const data = trend.map((p) => ({ ...p, label: monthLabelShort(p.month) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke={c.grid} strokeDasharray="0" />
        <XAxis
          dataKey="label"
          tick={{ fill: c.muted, fontSize: 11 }}
          axisLine={{ stroke: c.axis }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: c.muted, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
          }
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
        <Legend
          wrapperStyle={{ fontSize: 12, color: c.ink2 }}
          iconType="line"
          iconSize={14}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          name="CA (livré)"
          stroke={c.blue}
          strokeWidth={2}
          dot={{ r: 4, fill: c.blue, strokeWidth: 2, stroke: c.surface }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: c.surface }}
        />
        <Line
          type="monotone"
          dataKey="netProfit"
          name="Bénéfice net"
          stroke={c.orange}
          strokeWidth={2}
          dot={{ r: 4, fill: c.orange, strokeWidth: 2, stroke: c.surface }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: c.surface }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
