"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useColorScheme } from "@/components/gestion/useColorScheme";
import { CHART_COLORS } from "@/lib/gestion/chart-colors";
import { monthLabelShort } from "@/lib/gestion/format";
import type { OrderCountPoint } from "@/lib/gestion/queries";
import { useLocale } from "@/components/i18n/LocaleProvider";

/** Single-series order-count line — `granularity` picks month ("YYYY-MM")
 * or day ("YYYY-MM-DD") keys for the x-axis labels. */
export function OrderCountChart({
  points,
  granularity,
}: {
  points: OrderCountPoint[];
  granularity: "month" | "day";
}) {
  const { t, locale } = useLocale();
  const c = CHART_COLORS[useColorScheme()];
  const data = points.map((p) => ({
    ...p,
    label: granularity === "month" ? monthLabelShort(p.key, locale) : String(Number(p.key.slice(8, 10))),
  }));
  // A full month of daily ticks gets crowded on a phone.
  const tickInterval = granularity === "day" && data.length > 16 ? 1 : 0;

  return (
    <ResponsiveContainer width="100%" height={240}>
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
          width={32}
          allowDecimals={false}
        />
        <Tooltip
          formatter={(value) => [String(value), t("gestion.analyse.ordersSeries")]}
          contentStyle={{
            background: c.surface,
            border: `1px solid ${c.grid}`,
            borderRadius: 10,
            fontSize: 12,
          }}
          labelStyle={{ color: c.ink2, fontWeight: 600, marginBottom: 4 }}
        />
        <Line
          type="monotone"
          dataKey="count"
          name={t("gestion.analyse.ordersSeries")}
          stroke={c.orange}
          strokeWidth={2}
          dot={{ r: 3, fill: c.orange, strokeWidth: 2, stroke: c.surface }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: c.surface }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
