// Shared by the back-office visit reports (/admin/visites, /admin/adlab):
// period picking in Tunis time, formatting, and the visits to leave out.

export const PERIODS = [
  { value: "1", label: "Aujourd'hui" },
  { value: "7", label: "7 derniers jours" },
  { value: "30", label: "30 derniers jours" },
  { value: "90", label: "90 derniers jours" },
];

export const DEVICE_LABELS: Record<string, string> = { mobile: "Téléphone", tablet: "Tablette", desktop: "Ordinateur" };

const DAY_MS = 24 * 60 * 60 * 1000;
const TUNIS_OFFSET_MS = 60 * 60 * 1000; // UTC+1, no DST

/** Tunis midnight starting the given "YYYY-MM-DD" day; null if malformed. */
function tunisDayStart(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : new Date(d.getTime() - TUNIS_OFFSET_MS);
}

/** Today in Tunis as "YYYY-MM-DD". */
export function tunisToday(): string {
  return new Date(Date.now() + TUNIS_OFFSET_MS).toISOString().slice(0, 10);
}

/** A chosen range ("du … au …", both days included) wins over the presets. */
export function periodRange(period: string, du?: string, au?: string): { since: Date; until: Date; isCustom: boolean } {
  const start = tunisDayStart(du);
  const endDay = tunisDayStart(au) ?? tunisDayStart(tunisToday())!;
  if (start && start <= endDay) return { since: start, until: new Date(endDay.getTime() + DAY_MS), isCustom: true };
  return { since: periodStart(Number(period)), until: new Date(Date.now() + DAY_MS), isCustom: false };
}

/** "Aujourd'hui" = since local midnight (Tunis, UTC+1); otherwise the last N×24h. */
function periodStart(days: number): Date {
  if (days === 1) {
    const now = new Date();
    const tunis = new Date(now.getTime() + 60 * 60 * 1000);
    tunis.setUTCHours(0, 0, 0, 0);
    return new Date(tunis.getTime() - 60 * 60 * 1000);
  }
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export function fmtDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`;
}

export function pct(part: number, total: number): string {
  return total === 0 ? "—" : `${((part / total) * 100).toFixed(1).replace(".", ",")} %`;
}

/** CTA clicks that count: a visit with zero visible time was never on
 * screen (link checkers, crawlers clicking every button), so its clicks
 * are ignored — including ones recorded before the API started dropping
 * them. */
export function realClicks(v: { durationMs: number; ctaClicks: number }): number {
  return v.durationMs > 0 ? v.ctaClicks : 0;
}

/** Our own verification runs (utm_source / utm_campaign "test…"). */
export function isTestVisit(v: { source: string; utmSource: string | null; utmCampaign: string | null }): boolean {
  return v.source === "test" || v.utmSource === "test" || (v.utmCampaign ?? "").startsWith("test");
}

export function dayKey(d: Date): string {
  // Tunis local day (UTC+1, no DST).
  return new Date(d.getTime() + 60 * 60 * 1000).toISOString().slice(0, 10);
}
