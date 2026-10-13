import { ADMIN_GOAL } from "@/lib/admin-goal";
import { fmt } from "@/lib/gestion/format";

/** Progress toward ADMIN_GOAL from recorded subscription payments. */
export function GoalCard({ collected, adSpend, now }: { collected: number; adSpend: number; now: Date }) {
  const { label, target, deadline, averagePerClient } = ADMIN_GOAL;
  const pct = Math.min(100, Math.round((collected / target) * 100));
  const remaining = Math.max(0, target - collected);
  const daysLeft = Math.max(0, Math.ceil((new Date(`${deadline}T23:59:59+01:00`).getTime() - now.getTime()) / 86_400_000));
  const clientsNeeded = Math.ceil(remaining / averagePerClient);
  const reached = collected >= target;

  return (
    <div className="g-card">
      <h2>🎁 Objectif · {label}</h2>
      <div className="g-hint">
        Paiements Flux encaissés depuis le {new Date(`${ADMIN_GOAL.since}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}, jusqu&apos;au 27 décembre.
      </div>
      <div className="g-goal-stat">
        <span className="g-goal-stat__value num">{fmt(collected)}</span>
        <span className="g-goal-stat__target">
          sur <strong className="num">{fmt(target)}</strong>
        </span>
        <span className={`g-goal-stat__pct ${reached ? "reached" : ""}`}>{pct}%</span>
      </div>
      <div className="g-goal-bar">
        <div className={`g-goal-bar__fill ${reached ? "reached" : ""}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="g-goal-message" style={reached ? { color: "var(--g-success-text)" } : undefined}>
        {reached
          ? "Objectif atteint, bravo ! Le bracelet est payé par Flux. ✨"
          : `Il reste ${fmt(remaining)} à encaisser, soit environ ${clientsNeeded} paiement(s) de ${averagePerClient} DT.`}
      </div>
      <div className="g-goal-message--pace">
        {daysLeft > 0 ? `${daysLeft} jours avant le 27 décembre.` : "C'est le jour J 🎂"} Pub enregistrée sur la même période :{" "}
        {fmt(adSpend)}, soit un net de {fmt(collected - adSpend)}.
      </div>
    </div>
  );
}
