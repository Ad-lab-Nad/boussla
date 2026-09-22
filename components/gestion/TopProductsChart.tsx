"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useColorScheme } from "@/components/gestion/useColorScheme";
import { CHART_COLORS } from "@/lib/gestion/chart-colors";
import { fmt } from "@/lib/gestion/format";
import { useLocale } from "@/components/i18n/LocaleProvider";

type Row = { key: string; name: string; revenue: number };

export function TopProductsChart({ products }: { products: Row[] }) {
  const { t } = useLocale();
  const c = CHART_COLORS[useColorScheme()];
  // One hue, magnitude ranking — sequential, not categorical (products aren't
  // "identities" being compared here, their revenue is).
  const data = products.slice(0, 6);
  const height = Math.max(140, data.length * 42 + 30);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 44, bottom: 0, left: 4 }}
        barCategoryGap={10}
      >
        <CartesianGrid horizontal={false} stroke={c.grid} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fill: c.ink2, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [fmt(Number(value)), t("gestion.dashboard.revenueGeneratedColumn")]}
          contentStyle={{
            background: c.surface,
            border: `1px solid ${c.grid}`,
            borderRadius: 10,
            fontSize: 12,
          }}
        />
        <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {data.map((row) => (
            <Cell key={row.key} fill={c.blue} />
          ))}
          <LabelList
            dataKey="revenue"
            position="right"
            formatter={(v) => fmt(Number(v))}
            style={{ fill: c.ink2, fontSize: 11, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
