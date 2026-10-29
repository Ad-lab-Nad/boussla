import { Clock, Eye, MessageCircle, MousePointerClick, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { KpiCard } from "@/components/gestion/KpiCard";
import { AutoSubmitSelect } from "@/components/gestion/AutoSubmitSelect";
import {
  DEVICE_LABELS,
  PERIODS,
  dayKey,
  fmtDuration,
  isTestVisit,
  pct,
  periodRange,
  realClicks,
  tunisToday,
} from "@/lib/analytics/report";

// Audience report of a WhatsApp landing (/admin/adlab, /admin/formation):
// who comes, from where, and who taps a WhatsApp button (the beacon in
// lib/landing.ts records it as cta "wa:<button>").

type Visit = {
  visitorId: string;
  durationMs: number;
  ctaClicks: number;
  lastCta: string | null;
};

type Row = { key: string; visitors: Set<string>; visits: number; durationMs: number; clickers: Set<string>; clicks: number };

/** WhatsApp clicks of a visit (these landings only ever record those). */
function waClicks(v: Visit): number {
  return v.lastCta?.startsWith("wa:") ? realClicks(v) : 0;
}

function group<T extends Visit>(items: T[], keyOf: (v: T) => string): Row[] {
  const map = new Map<string, Row>();
  for (const v of items) {
    const key = keyOf(v);
    const row = map.get(key) ?? { key, visitors: new Set(), visits: 0, durationMs: 0, clickers: new Set(), clicks: 0 };
    row.visitors.add(v.visitorId);
    row.visits += 1;
    row.durationMs += v.durationMs;
    const n = waClicks(v);
    if (n > 0) row.clickers.add(v.visitorId);
    row.clicks += n;
    map.set(key, row);
  }
  return [...map.values()].sort((a, b) => b.visits - a.visits);
}

export type StatsSearchParams = Promise<{ p?: string; du?: string; au?: string }>;

export async function WaLandingStats({
  path,
  buttonLabels,
  pixelEvent,
  searchParams,
}: {
  /** The landing's path, e.g. "/adlab". */
  path: string;
  /** data-cta id of each WhatsApp button → its name in the report. */
  buttonLabels: Record<string, string>;
  /** Meta Pixel event the same clicks are sent as (lib/meta-pixel.ts). */
  pixelEvent: string;
  searchParams: StatsSearchParams;
}) {
  const { p, du, au } = await searchParams;
  const period = PERIODS.some((o) => o.value === p) ? p! : "7";
  const { since, until, isCustom } = periodRange(period, du, au);

  const all = await prisma.pageVisit.findMany({
    where: { createdAt: { gte: since, lt: until }, path: { startsWith: path } },
    orderBy: { createdAt: "desc" },
  });
  const testVisitors = new Set(all.filter(isTestVisit).map((v) => v.visitorId));
  const visits = all.filter((v) => !testVisitors.has(v.visitorId));

  const visitors = new Set(visits.map((v) => v.visitorId)).size;
  const totalDuration = visits.reduce((s, v) => s + v.durationMs, 0);
  const clickers = new Set(visits.filter((v) => waClicks(v) > 0).map((v) => v.visitorId)).size;
  const clicks = visits.reduce((s, v) => s + waClicks(v), 0);

  const bySource = group(visits, (v) => v.source);
  const byCampaign = group(visits.filter((v) => v.utmCampaign), (v) => v.utmCampaign!);
  const byDevice = group(visits, (v) => DEVICE_LABELS[v.device] ?? v.device);
  const byDay = group(visits, (v) => dayKey(v.createdAt)).sort((a, b) => b.key.localeCompare(a.key));

  // The button is the visit's last WhatsApp click (one per visit is the norm).
  const byButton = new Map<string, Set<string>>();
  for (const v of visits) {
    if (waClicks(v) === 0) continue;
    const id = v.lastCta!.slice(3);
    (byButton.get(id) ?? byButton.set(id, new Set()).get(id)!).add(v.visitorId);
  }
  const buttons = [...byButton.entries()].sort((a, b) => b[1].size - a[1].size);

  return (
    <>
      <div className="g-period">
        <form method="get">
          <div className="g-month-pill">
            <span style={{ fontSize: "0.8rem", color: "var(--g-muted)" }}>Période</span>
            <AutoSubmitSelect name="p" defaultValue={isCustom ? "" : period} options={isCustom ? [{ value: "", label: "Dates choisies" }, ...PERIODS] : PERIODS} />
          </div>
        </form>
        <form method="get" className="g-period__range">
          <label htmlFor="du">Du</label>
          <input id="du" type="date" name="du" required max={tunisToday()} defaultValue={isCustom ? du : ""} />
          <label htmlFor="au">au</label>
          <input id="au" type="date" name="au" max={tunisToday()} defaultValue={isCustom ? (au ?? tunisToday()) : tunisToday()} />
          <button type="submit" className="g-btn small">Afficher</button>
        </form>
      </div>

      <div className="g-kpi-grid">
        <KpiCard label="Visiteurs uniques" value={String(visitors)} icon={Users} tone="blue" />
        <KpiCard label="Visites" value={String(visits.length)} icon={Eye} tone="violet" />
        <KpiCard label="Temps moyen sur la page" value={visits.length ? fmtDuration(totalDuration / visits.length) : "—"} icon={Clock} tone="aqua" />
      </div>
      <div className="g-kpi-grid">
        <KpiCard label="Ont cliqué WhatsApp" value={`${clickers} (${pct(clickers, visitors)})`} icon={MessageCircle} tone="good" />
        <KpiCard label="Clics WhatsApp (total)" value={String(clicks)} icon={MousePointerClick} tone="orange" />
      </div>

      <div className="g-card">
        <h2>Quels boutons WhatsApp</h2>
        <div className="g-hint">Le bouton sur lequel chaque personne a cliqué pour t&apos;écrire.</div>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Bouton</th>
                <th className="right">Personnes</th>
              </tr>
            </thead>
            <tbody>
              {buttons.map(([id, people]) => (
                <tr key={id}>
                  <td>{buttonLabels[id] ?? id}</td>
                  <td className="right num">{people.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {buttons.length === 0 && <div className="g-empty">Aucun clic WhatsApp sur cette période.</div>}
      </div>

      <div className="g-card">
        <h2>D&apos;où viennent les visiteurs</h2>
        <div className="g-hint">« Pub Meta » = clics sur tes publicités Facebook/Instagram.</div>
        <StatsTable rows={bySource} label="Source" empty="Aucune visite sur cette période." />
      </div>

      {byCampaign.length > 0 && (
        <div className="g-card">
          <h2>Par campagne</h2>
          <StatsTable rows={byCampaign} label="Campagne" empty="" />
        </div>
      )}

      <div className="g-card">
        <h2>Par appareil</h2>
        <StatsTable rows={byDevice} label="Appareil" empty="—" />
      </div>

      <div className="g-card">
        <h2>Jour par jour</h2>
        <StatsTable
          rows={byDay.map((r) => ({
            ...r,
            key: new Date(`${r.key}T12:00:00Z`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }),
          }))}
          label="Jour"
          empty="Aucune visite sur cette période."
        />
      </div>

      <div className="g-hint" style={{ marginTop: 4 }}>
        Mesure anonyme de fluxtunisie.com{path} (pas de nom ni d&apos;adresse IP). Les robots sont ignorés, et un
        clic ne compte que si la page a vraiment été affichée. Les clics WhatsApp sont mesurés depuis le 18 octobre
        2026 ; avant, seules les visites l&apos;étaient. Le Pixel Meta compte les mêmes clics (événement « {pixelEvent} »)
        dans le Gestionnaire de publicités.
        {testVisitors.size > 0 && <> Masqués : {testVisitors.size} visiteur(s) de test.</>}
      </div>
    </>
  );
}

function StatsTable({ rows, label, empty }: { rows: Row[]; label: string; empty: string }) {
  return (
    <>
      <div className="g-table-wrap">
        <table className="g-table">
          <thead>
            <tr>
              <th>{label}</th>
              <th className="right">Visiteurs</th>
              <th className="right">Visites</th>
              <th className="right">Temps moyen</th>
              <th className="right">Ont cliqué WhatsApp</th>
              <th className="right">Taux</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td>{r.key}</td>
                <td className="right num">{r.visitors.size}</td>
                <td className="right num">{r.visits}</td>
                <td className="right num">{fmtDuration(r.durationMs / r.visits)}</td>
                <td className="right num">{r.clickers.size}</td>
                <td className="right num">{pct(r.clickers.size, r.visitors.size)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && empty && <div className="g-empty">{empty}</div>}
    </>
  );
}
