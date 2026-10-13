import { MessageCircle } from "lucide-react";
import { fmt } from "@/lib/gestion/format";
import type { TFunction } from "@/lib/i18n/translate";

/** "Ta semaine": the last 7 days in three numbers — a reason to open the
 * app — and a WhatsApp share (to a partner, a family member…) that also
 * spreads the word. Hidden until there's a delivered sale this week. */
export function WeekSummaryCard({
  week,
  t,
}: {
  week: { sales: number; revenue: number; profit: number };
  t: TFunction;
}) {
  if (week.sales === 0) return null;
  const text = t("gestion.week.shareText", { sales: week.sales, revenue: fmt(week.revenue), profit: fmt(week.profit) });
  return (
    <div className="g-card g-week">
      <div className="g-week__head">
        <h2>{t("gestion.week.title")}</h2>
        <span className="g-hint" style={{ margin: 0 }}>{t("gestion.week.subtitle")}</span>
      </div>
      <div className="g-week__stats">
        <div>
          <span className="g-week__label">{t("gestion.week.sales")}</span>
          <strong className="num">{week.sales}</strong>
        </div>
        <div>
          <span className="g-week__label">{t("gestion.week.revenue")}</span>
          <strong className="num">{fmt(week.revenue)}</strong>
        </div>
        <div>
          <span className="g-week__label">{t("gestion.week.profit")}</span>
          <strong className={`num ${week.profit < 0 ? "g-week__neg" : "g-week__pos"}`}>{fmt(week.profit)}</strong>
        </div>
      </div>
      <a className="g-wa-btn" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">
        <MessageCircle size={14} aria-hidden="true" /> {t("gestion.week.share")}
      </a>
    </div>
  );
}
