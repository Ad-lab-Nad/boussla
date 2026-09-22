"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { fmt, fmtNumber, monthLabel } from "@/lib/gestion/format";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { plural } from "@/lib/i18n/translate";

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
  const { t, locale } = useLocale();
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
      setError(t("gestion.dashboard.goal.saveError"));
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
        <h2>{t("gestion.dashboard.goal.title")}</h2>
        <div className="g-hint">{t("gestion.dashboard.goal.hint", { month: monthLabel(month, locale) })}</div>
        <form action={handleSubmit}>
          <input type="hidden" name="month" value={month} />
          <div className="g-field" style={{ maxWidth: 220 }}>
            <label>{t("gestion.dashboard.goal.targetRevenueLabel")}</label>
            <input
              type="number"
              name="targetRevenue"
              min="0.01"
              step="0.01"
              defaultValue={targetRevenue ?? undefined}
              required
            />
          </div>
          <div className="g-goal-form__actions">
            <button type="submit" className="g-btn" disabled={submitting}>
              {submitting ? t("gestion.editCommon.saving") : t("gestion.dashboard.goal.setGoalButton")}
            </button>
            {targetRevenue !== null && (
              <button type="button" className="g-btn secondary" onClick={() => setEditing(false)}>
                {t("gestion.editCommon.cancel")}
              </button>
            )}
          </div>
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
        <h2 style={{ margin: 0 }}>{t("gestion.dashboard.goal.title")}</h2>
        <button
          type="button"
          className="g-del-btn"
          title={t("gestion.dashboard.goal.editGoalTitle")}
          onClick={() => setEditing(true)}
        >
          <Pencil size={15} />
        </button>
      </div>

      <div className="g-goal-stat">
        <span className="g-goal-stat__value num">{fmt(revenueSoFar)}</span>
        <span className="g-goal-stat__target">
          {t("gestion.dashboard.goal.ofLabel")} <strong className="num">{fmt(targetRevenue)}</strong>
        </span>
        <span className={`g-goal-stat__pct ${reached ? "reached" : ""}`}>
          {Math.round(progressPct)}%
        </span>
      </div>

      <div className="g-goal-bar">
        <div
          className={`g-goal-bar__fill ${reached ? "reached" : ""}`}
          style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
        />
      </div>

      {reached ? (
        <div className="g-goal-message" style={{ color: "var(--g-success-text)" }}>
          {t("gestion.dashboard.goal.reached")}
          {revenueSoFar > targetRevenue &&
            ` ${t("gestion.dashboard.goal.exceededBy", { amount: fmt(revenueSoFar - targetRevenue) })}`}{" "}
          !
        </div>
      ) : (
        <div className="g-goal-message">{t("gestion.dashboard.goal.remainingMessage", { amount: fmt(remaining) })}</div>
      )}

      {isCurrentMonth && !reached && (
        <div className="g-goal-message--pace">
          {plural(daysLeft, {
            one: t("gestion.dashboard.goal.daysLeftOne", { days: daysLeft }),
            other: t("gestion.dashboard.goal.daysLeftOther", { days: daysLeft }),
          })}
          {unitsPerDayRounded !== null
            ? plural(unitsPerDayRounded, {
                one: t("gestion.dashboard.goal.paceUnitsOne", { units: fmtNumber(unitsPerDayRounded) }),
                other: t("gestion.dashboard.goal.paceUnitsOther", { units: fmtNumber(unitsPerDayRounded) }),
              })
            : t("gestion.dashboard.goal.paceNoData")}
        </div>
      )}

      {!isCurrentMonth && !reached && (
        <div className="g-goal-message--pace">{t("gestion.dashboard.goal.switchToCurrentMonth")}</div>
      )}
    </div>
  );
}
