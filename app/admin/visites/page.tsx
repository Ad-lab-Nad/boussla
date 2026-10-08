import { Clock, Eye, MousePointerClick, Percent, UserPlus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { KpiCard } from "@/components/gestion/KpiCard";
import { AutoSubmitSelect } from "@/components/gestion/AutoSubmitSelect";

const PERIODS = [
  { value: "1", label: "Aujourd'hui" },
  { value: "7", label: "7 derniers jours" },
  { value: "30", label: "30 derniers jours" },
  { value: "90", label: "90 derniers jours" },
];

const DEVICE_LABELS: Record<string, string> = { mobile: "Téléphone", tablet: "Tablette", desktop: "Ordinateur" };

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

function fmtDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`;
}

function pct(part: number, total: number): string {
  return total === 0 ? "—" : `${((part / total) * 100).toFixed(1).replace(".", ",")} %`;
}

type Row = { key: string; visitors: Set<string>; visits: number; durationMs: number; cta: number };

function group<T extends { visitorId: string; durationMs: number; ctaClicks: number }>(
  items: T[],
  keyOf: (v: T) => string
) {
  const map = new Map<string, Row>();
  for (const v of items) {
    const key = keyOf(v);
    const row = map.get(key) ?? { key, visitors: new Set(), visits: 0, durationMs: 0, cta: 0 };
    row.visitors.add(v.visitorId);
    row.visits += 1;
    row.durationMs += v.durationMs;
    row.cta += v.ctaClicks;
    map.set(key, row);
  }
  return [...map.values()].sort((a, b) => b.visits - a.visits);
}

function dayKey(d: Date): string {
  // Tunis local day (UTC+1, no DST).
  return new Date(d.getTime() + 60 * 60 * 1000).toISOString().slice(0, 10);
}

export default async function VisitesPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  const period = PERIODS.some((o) => o.value === p) ? p! : "7";
  const since = periodStart(Number(period));

  const [visits, signups] = await Promise.all([
    prisma.pageVisit.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
  ]);

  const uniqueVisitors = new Set(visits.map((v) => v.visitorId)).size;
  const totalDuration = visits.reduce((s, v) => s + v.durationMs, 0);
  const visitorsWhoClicked = new Set(visits.filter((v) => v.ctaClicks > 0).map((v) => v.visitorId)).size;

  const bySource = group(visits, (v) => v.source);
  const byDevice = group(visits, (v) => v.device);
  const byCampaign = group(
    visits.filter((v) => v.utmCampaign),
    (v) => v.utmCampaign!
  );
  const byDay = group(visits, (v) => dayKey(v.createdAt)).sort((a, b) => b.key.localeCompare(a.key));
  const signupsByDay = new Map<string, number>();
  for (const s of signups) signupsByDay.set(dayKey(s.createdAt), (signupsByDay.get(dayKey(s.createdAt)) ?? 0) + 1);

  return (
    <>
      <form method="get">
        <div className="g-month-pill">
          <span style={{ fontSize: "0.8rem", color: "var(--g-muted)" }}>Période</span>
          <AutoSubmitSelect name="p" defaultValue={period} options={PERIODS} />
        </div>
      </form>

      <div className="g-kpi-grid">
        <KpiCard label="Visiteurs uniques" value={String(uniqueVisitors)} icon={Users} tone="blue" />
        <KpiCard label="Visites" value={String(visits.length)} icon={Eye} tone="violet" />
        <KpiCard
          label="Temps moyen sur la page"
          value={visits.length ? fmtDuration(totalDuration / visits.length) : "—"}
          icon={Clock}
          tone="aqua"
        />
      </div>

      <div className="g-kpi-grid">
        <KpiCard
          label="Ont cliqué « Essai gratuit »"
          value={`${visitorsWhoClicked} (${pct(visitorsWhoClicked, uniqueVisitors)})`}
          icon={MousePointerClick}
          tone="orange"
        />
        <KpiCard label="Inscriptions" value={String(signups.length)} icon={UserPlus} tone="good" />
        <KpiCard
          label="Taux de conversion"
          value={pct(signups.length, uniqueVisitors)}
          icon={Percent}
          tone="warning"
        />
      </div>

      <div className="g-card">
        <h2>D&apos;où viennent les visiteurs</h2>
        <div className="g-hint">
          « Pub Meta » = clics sur tes publicités Facebook/Instagram. Pour distinguer tes campagnes,
          ajoute à l&apos;adresse de la pub : <code>?utm_source=facebook&amp;utm_medium=paid&amp;utm_campaign=nom-de-la-campagne</code>
        </div>
        <SourceTable rows={bySource} empty="Aucune visite sur cette période." />
      </div>

      {byCampaign.length > 0 && (
        <div className="g-card">
          <h2>Par campagne</h2>
          <SourceTable rows={byCampaign} empty="" />
        </div>
      )}

      <div className="g-card">
        <h2>Par appareil</h2>
        <SourceTable rows={byDevice.map((r) => ({ ...r, key: DEVICE_LABELS[r.key] ?? r.key }))} empty="—" />
      </div>

      <div className="g-card">
        <h2>Jour par jour</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Jour</th>
                <th className="right">Visiteurs</th>
                <th className="right">Visites</th>
                <th className="right">Clics essai</th>
                <th className="right">Inscriptions</th>
              </tr>
            </thead>
            <tbody>
              {byDay.map((r) => (
                <tr key={r.key}>
                  <td className="num">
                    {new Date(`${r.key}T12:00:00Z`).toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                  <td className="right num">{r.visitors.size}</td>
                  <td className="right num">{r.visits}</td>
                  <td className="right num">{r.cta}</td>
                  <td className="right num">{signupsByDay.get(r.key) ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {byDay.length === 0 && <div className="g-empty">Aucune visite sur cette période.</div>}
      </div>

      <div className="g-hint" style={{ marginTop: 4 }}>
        Mesure anonyme de la page d&apos;accueil (pas de nom, d&apos;email ni d&apos;adresse IP). Les robots
        sont ignorés, et tes propres visites en « Aperçu » ne sont pas comptées. Le temps compté est celui où
        la page est réellement à l&apos;écran.
      </div>
    </>
  );
}

function SourceTable({ rows, empty }: { rows: Row[]; empty: string }) {
  return (
    <>
      <div className="g-table-wrap">
        <table className="g-table">
          <thead>
            <tr>
              <th>Source</th>
              <th className="right">Visiteurs</th>
              <th className="right">Visites</th>
              <th className="right">Temps moyen</th>
              <th className="right">Clics essai</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td>{r.key}</td>
                <td className="right num">{r.visitors.size}</td>
                <td className="right num">{r.visits}</td>
                <td className="right num">{fmtDuration(r.durationMs / r.visits)}</td>
                <td className="right num">{r.cta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && empty && <div className="g-empty">{empty}</div>}
    </>
  );
}
