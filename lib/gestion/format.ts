// Shared formatting helpers for the Gestion module. Mirrors the behavior of
// the original localStorage prototype (gestion-complete1109.html) exactly.

/** "1234.5" -> "1 234.50 DT" */
export function fmt(n: number | null | undefined): string {
  return (
    (n ?? 0).toLocaleString("fr-TN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " DT"
  );
}

export function fmtNumber(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString("fr-TN");
}

/** Today as "YYYY-MM-DD", suitable for a <input type="date"> default value. */
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** "YYYY-MM-DD" -> "YYYY-MM" */
export function monthKeyFromDateStr(d: string): string {
  return d.slice(0, 7);
}

/** Days left in `now`'s calendar month, counting today itself. */
export function daysRemainingInMonth(now: Date = new Date()): number {
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate() + 1;
}

/** A stored DateTime (always parsed at UTC midnight) -> "YYYY-MM" */
export function monthKeyFromDate(d: Date): string {
  return d.toISOString().slice(0, 7);
}

/** Parse a <input type="date"> value ("YYYY-MM-DD") into a UTC-midnight Date. */
export function parseDateInput(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

/** "YYYY-MM" -> "septembre 2026" */
export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

/** "YYYY-MM" -> "sept. 2026" (compact, for chart axes) */
export function monthLabelShort(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("fr-FR", {
    month: "short",
    year: "2-digit",
  });
}

export type Delta = { direction: "up" | "down" | "flat"; text: string };

/** Percentage change label for a KPI vs. its previous-period value. */
export function formatDelta(current: number, previous: number): Delta {
  if (previous === 0) {
    if (current === 0) return { direction: "flat", text: "stable vs mois dernier" };
    return {
      direction: current > 0 ? "up" : "down",
      text: `${current > 0 ? "+" : ""}${fmt(current)} vs mois dernier`,
    };
  }
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  if (Math.abs(pct) < 0.5) return { direction: "flat", text: "stable vs mois dernier" };
  return {
    direction: pct > 0 ? "up" : "down",
    text: `${pct > 0 ? "+" : ""}${pct.toFixed(0)}% vs mois dernier`,
  };
}

/** "YYYY-MM" shifted by `delta` months (negative goes back). */
export function shiftMonthKey(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Month options for the dashboard selector: every month with existing
 * activity, plus the current month and the 6 following ones (so you can
 * project ahead), sorted chronologically.
 */
export function buildMonthOptions(existingKeys: string[]): string[] {
  const keys = new Set(existingKeys);
  const today = new Date();
  for (let i = 0; i <= 6; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    keys.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return [...keys].sort();
}
