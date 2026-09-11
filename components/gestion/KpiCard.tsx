import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { Delta } from "@/lib/gestion/format";

type Tone = "blue" | "aqua" | "orange" | "violet" | "good" | "warning" | "critical";

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = "blue",
  delta,
  deltaGoodWhenUp = true,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: Tone;
  delta?: Delta;
  /** Whether an "up" delta should read as good (revenue) or bad (costs). */
  deltaGoodWhenUp?: boolean;
}) {
  let deltaClass: "good" | "bad" | "neutral" = "neutral";
  if (delta && delta.direction !== "flat") {
    const isGood = deltaGoodWhenUp ? delta.direction === "up" : delta.direction === "down";
    deltaClass = isGood ? "good" : "bad";
  }

  return (
    <div className="g-kpi">
      <div className="g-kpi__top">
        <span className="g-kpi__label">{label}</span>
        <span className={`g-kpi__icon g-kpi__icon--${tone}`}>
          <Icon />
        </span>
      </div>
      <div className="g-kpi__value">{value}</div>
      {delta && (
        <div className={`g-kpi__delta ${deltaClass}`}>
          {delta.direction === "up" && <ArrowUpRight />}
          {delta.direction === "down" && <ArrowDownRight />}
          {delta.direction === "flat" && <Minus />}
          {delta.text}
        </div>
      )}
    </div>
  );
}
