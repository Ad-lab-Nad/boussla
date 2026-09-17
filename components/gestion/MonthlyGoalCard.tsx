"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { fmt, fmtNumber, monthLabel } from "@/lib/gestion/format";

export function MonthlyGoalCard({
  month,
  targetRevenue,
  revenueSoFar,
  remaining,
  progressPct,
  reached,
  isCurrentMonth,
  daysLeft,
  unitsPerDay,
  setMonthlyGoalAction,
}: {
  month: string;
  targetRevenue: number | null;
  revenueSoFar: number;
  remaining: number;
  progressPct: number;
  reached: boolean;
  isCurrentMonth: boolean;
  daysLeft: number;
  unitsPerDay: number | null;
  setMonthlyGoalAction: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    try {
      await setMonthlyGoalAction(formData);
      setEditing(false);
      router.refresh();
    } catch {
      setError("Impossible d'enregistrer cet objectif. Réessaie.");
    } finally {
      setSubmitting(false);
    }
  }

  // Guard on targetRevenue being null too, not just `editing` — right after
  // setting a first goal, the server hasn't re-rendered with the new value
  // yet (router.refresh() is async), so this keeps showing the form instead
  // of flashing a progress bar computed from a stale null target.
  if (editing || targetRevenue === null) {
    return (
      <div className="g-card">
        <h2>Objectif du mois</h2>
        <div className="g-hint">
          Fixe un objectif de chiffre d&apos;affaires pour {monthLabel(month)} — le reste se
          calcule tout seul.
        </div>
        <form action={handleSubmit} className="g-field-grid">
          <input type="hidden" name="month" value={month} />
          <div className="g-field">
            <label>Objectif de CA (DT)</label>
            <input
              type="number"
              name="targetRevenue"
              min="0.01"
              step="0.01"
              defaultValue={targetRevenue ?? undefined}
              required
            />
          </div>
          <button type="submit" className="g-btn" disabled={submitting}>
            {submitting ? "Enregistrement..." : "Définir l'objectif"}
          </button>
          {targetRevenue !== null && (
            <button type="button" className="g-btn secondary" onClick={() => setEditing(false)}>
              Annuler
            </button>
          )}
        </form>
        {error && (
          <div className="g-auth-error" style={{ marginTop: 12, marginBottom: 0 }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  const unitsPerDayRounded = unitsPerDay !== null ? Math.ceil(unitsPerDay) : null;

  return (
    <div className="g-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <h2 style={{ margin: 0 }}>Objectif du mois</h2>
        <button
          type="button"
          className="g-del-btn"
          title="Modifier l'objectif"
          onClick={() => setEditing(true)}
        >
          <Pencil size={15} />
        </button>
      </div>

      <div className="g-goal-bar">
        <div
          className={`g-goal-bar__fill ${reached ? "reached" : ""}`}
          style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
        />
      </div>
      <div className="g-goal-bar__caption">
        <strong className="num">{fmt(revenueSoFar)}</strong> sur{" "}
        <strong className="num">{fmt(targetRevenue)}</strong> ({Math.round(progressPct)}%)
      </div>

      {reached ? (
        <div
          className="g-hint"
          style={{ marginTop: 12, marginBottom: 0, color: "var(--g-success-text)" }}
        >
          🎉 Objectif atteint
          {revenueSoFar > targetRevenue && ` — dépassé de ${fmt(revenueSoFar - targetRevenue)}`} !
        </div>
      ) : (
        <div className="g-hint" style={{ marginTop: 12, marginBottom: 0 }}>
          Il te reste <strong className="num">{fmt(remaining)}</strong> à vendre pour atteindre
          l&apos;objectif.
        </div>
      )}

      {isCurrentMonth && !reached && (
        <div className="g-hint" style={{ marginBottom: 0 }}>
          {daysLeft} jour{daysLeft > 1 ? "s" : ""} restant{daysLeft > 1 ? "s" : ""} ce mois-ci
          {unitsPerDayRounded !== null
            ? ` — environ ${fmtNumber(unitsPerDayRounded)} unité${unitsPerDayRounded > 1 ? "s" : ""}/jour pour y arriver, au prix moyen de ton catalogue.`
            : " — ajoute des produits à ton catalogue pour une estimation par jour."}
        </div>
      )}

      {!isCurrentMonth && !reached && (
        <div className="g-hint" style={{ marginBottom: 0 }}>
          Passe sur le mois en cours pour voir le rythme quotidien à tenir.
        </div>
      )}
    </div>
  );
}
