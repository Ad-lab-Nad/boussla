import { Clock, Eye, LogIn, MousePointerClick, Percent, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignupFunnel } from "./SignupFunnel";
import { KpiCard } from "@/components/gestion/KpiCard";
import { AutoSubmitSelect } from "@/components/gestion/AutoSubmitSelect";
import { DEVICE_LABELS, PERIODS, dayKey, fmtDuration, isTestVisit, pct, periodRange, realClicks, tunisToday } from "@/lib/analytics/report";

type Row = {
  key: string;
  visitors: Set<string>;
  visits: number;
  durationMs: number;
  // Visitors who clicked a sign-up button (people, not clicks — one
  // hesitant visitor tapping three times is still one).
  clickers: Set<string>;
  reachedSignup: number;
};

function group<T extends { visitorId: string; durationMs: number; ctaClicks: number }>(
  items: T[],
  keyOf: (v: T) => string,
  signupVisitors: Set<string>
) {
  const map = new Map<string, Row>();
  for (const v of items) {
    const key = keyOf(v);
    const row = map.get(key) ?? { key, visitors: new Set(), visits: 0, durationMs: 0, clickers: new Set(), reachedSignup: 0 };
    row.visitors.add(v.visitorId);
    row.visits += 1;
    row.durationMs += v.durationMs;
    if (realClicks(v) > 0) row.clickers.add(v.visitorId);
    map.set(key, row);
  }
  for (const row of map.values()) {
    row.reachedSignup = [...row.visitors].filter((id) => signupVisitors.has(id)).length;
  }
  return [...map.values()].sort((a, b) => b.visits - a.visits);
}

/** A sign-up arrival right after a landing visit that was never on screen
 * and never clicked is a link checker (Meta's ad review follows every
 * link) — not a person. Arrivals with no landing visit before them stay. */
function isBotArrival(
  arrival: { visitorId: string; createdAt: Date },
  landingVisits: { visitorId: string; createdAt: Date; durationMs: number; ctaClicks: number }[]
): boolean {
  const before = landingVisits.find((v) => v.visitorId === arrival.visitorId && v.createdAt <= arrival.createdAt);
  return !!before && before.durationMs === 0 && before.ctaClicks === 0;
}

export default async function VisitesPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; du?: string; au?: string }>;
}) {
  const { p, du, au } = await searchParams;
  const period = PERIODS.some((o) => o.value === p) ? p! : "7";
  const { since, until, isCustom } = periodRange(period, du, au);
  const range = { gte: since, lt: until };

  const [allVisits, signups, signupEvents] = await Promise.all([
    prisma.pageVisit.findMany({
      where: { createdAt: range },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({ where: { createdAt: range }, select: { createdAt: true } }),
    prisma.signupEvent.findMany({ where: { createdAt: range }, select: { event: true, detail: true } }),
  ]);

  // Our test visitors are dropped entirely (their sign-up arrivals carry no
  // UTM, so they're matched by visitor id).
  const testVisitors = new Set(allVisits.filter(isTestVisit).map((v) => v.visitorId));
  const realVisits = allVisits.filter((v) => !testVisitors.has(v.visitorId));

  // Landing-page views vs. arrivals on the sign-up form (recorded by the
  // signup page itself — see components/TrackSignupArrival.tsx). allVisits
  // is newest-first, so isBotArrival finds the latest landing visit before.
  // Flux Ad Lab (/adlab) is a separate service: kept out of Flux's numbers.
  const adlabVisits = realVisits.filter((v) => v.path.startsWith("/adlab"));
  const visits = realVisits.filter((v) => v.path !== "/signup" && !v.path.startsWith("/adlab"));
  const rawArrivals = realVisits.filter((v) => v.path === "/signup");
  const signupArrivals = rawArrivals.filter((a) => !isBotArrival(a, visits));
  const hiddenBotArrivals = rawArrivals.length - signupArrivals.length;
  const signupVisitors = new Set(signupArrivals.map((v) => v.visitorId));

  const uniqueVisitors = new Set(visits.map((v) => v.visitorId)).size;
  const totalDuration = visits.reduce((s, v) => s + v.durationMs, 0);
  const visitorsWhoClicked = new Set(visits.filter((v) => realClicks(v) > 0).map((v) => v.visitorId)).size;

  const bySource = group(visits, (v) => v.source, signupVisitors);
  const byDevice = group(visits, (v) => v.device, signupVisitors);
  const byCampaign = group(
    visits.filter((v) => v.utmCampaign),
    (v) => v.utmCampaign!,
    signupVisitors
  );
  const byDay = group(visits, (v) => dayKey(v.createdAt), signupVisitors).sort((a, b) =>
    b.key.localeCompare(a.key)
  );
  const arrivalsByDay = new Map<string, Set<string>>();
  for (const a of signupArrivals) {
    const k = dayKey(a.createdAt);
    (arrivalsByDay.get(k) ?? arrivalsByDay.set(k, new Set()).get(k)!).add(a.visitorId);
  }
  const signupsByDay = new Map<string, number>();
  for (const s of signups) signupsByDay.set(dayKey(s.createdAt), (signupsByDay.get(dayKey(s.createdAt)) ?? 0) + 1);

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
        <KpiCard
          label="Arrivés sur l'inscription"
          value={`${signupVisitors.size} (${pct(signupVisitors.size, uniqueVisitors)})`}
          icon={LogIn}
          tone="blue"
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

      <SignupFunnel arrivals={signupVisitors.size} events={signupEvents} />

      <div className="g-card">
        <h2>Flux Ad Lab (/adlab)</h2>
        <div className="g-hint">
          Visites de la page du service pub, comptées à part. Le détail (clics WhatsApp, sources, jour par jour) est
          dans l&apos;onglet <Link href="/admin/adlab">Ad Lab</Link>.
        </div>
        <div className="g-kpi-grid" style={{ marginBottom: 0 }}>
          <KpiCard label="Visiteurs" value={String(new Set(adlabVisits.map((v) => v.visitorId)).size)} icon={Users} tone="blue" />
          <KpiCard label="Visites" value={String(adlabVisits.length)} icon={Eye} tone="violet" />
          <KpiCard
            label="Temps moyen"
            value={adlabVisits.length ? fmtDuration(adlabVisits.reduce((s, v) => s + v.durationMs, 0) / adlabVisits.length) : "—"}
            icon={Clock}
            tone="aqua"
          />
        </div>
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
                <th className="right">Ont cliqué essai</th>
                <th className="right">Arrivés inscription</th>
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
                  <td className="right num">{r.clickers.size}</td>
                  <td className="right num">{arrivalsByDay.get(r.key)?.size ?? 0}</td>
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
        la page est réellement à l&apos;écran. « Ont cliqué essai » compte les personnes (pas les clics) qui ont
        cliqué sur un bouton d&apos;essai après avoir vraiment vu la page (les robots vérificateurs de liens cliquent sans l&apos;afficher). « Arrivés
        inscription » = visiteurs qui ont réellement ouvert la page d&apos;inscription.
        {(testVisitors.size > 0 || hiddenBotArrivals > 0) && (
          <>
            {" "}
            Masqués sur cette période : {testVisitors.size} visiteur(s) de test et {hiddenBotArrivals} arrivée(s)
            de robot sur l&apos;inscription (page jamais affichée juste avant).
          </>
        )}
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
              <th className="right">Ont cliqué essai</th>
              <th className="right">Arrivés inscription</th>
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
                <td className="right num">{r.reachedSignup}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && empty && <div className="g-empty">{empty}</div>}
    </>
  );
}
