import { INDUSTRIES, normalizeIndustry } from "@/lib/industries";
import type { UserActivity } from "@/lib/admin-activity";

const INDUSTRY_LABELS: Record<string, string> = {
  FOOD: "Alimentation",
  CRAFTS: "Artisanat & cadeaux",
  TEXTILE: "Couture & textile",
  FASHION: "Mode & accessoires",
  BEAUTY: "Beauté & parfums",
  SERVICES: "Services",
  OTHER: "Autre",
};
const LOCALE_LABELS: Record<string, string> = { ar: "🇹🇳 Arabe", fr: "🇫🇷 Français", en: "🇬🇧 Anglais" };

type U = { id: string; industry: string | null; locale: string | null };

/** Who uses Flux: field (the dashboard's one-tap question) and the
 * language the app was last opened in — from what users told us or
 * chose, never from their data. */
export function AudienceCard({ users, activity }: { users: U[]; activity: Map<string, UserActivity> }) {
  const isActive = (u: U) => (activity.get(u.id)?.status ?? "never") !== "never";

  const byIndustry = INDUSTRIES.map((i) => {
    const group = users.filter((u) => normalizeIndustry(u.industry) === i.key);
    return { label: `${i.emoji} ${INDUSTRY_LABELS[i.key]}`, total: group.length, active: group.filter(isActive).length };
  }).filter((r) => r.total > 0);
  const unanswered = users.filter((u) => !normalizeIndustry(u.industry));
  byIndustry.sort((a, b) => b.total - a.total);
  byIndustry.push({ label: "— Pas encore répondu", total: unanswered.length, active: unanswered.filter(isActive).length });

  const locales = new Map<string, number>();
  for (const u of users) {
    const key = u.locale && LOCALE_LABELS[u.locale] ? LOCALE_LABELS[u.locale] : "— Pas encore noté";
    locales.set(key, (locales.get(key) ?? 0) + 1);
  }
  const byLocale = [...locales.entries()].sort((a, b) => (a[0].startsWith("—") ? 1 : b[0].startsWith("—") ? -1 : b[1] - a[1]));

  return (
    <div className="g-card">
      <h2>Qui utilise Flux</h2>
      <div className="g-hint">
        Domaine : la réponse à « Tu travailles dans quel domaine ? » sur le tableau de bord. Langue : celle de la
        dernière ouverture de l&apos;app (noté depuis le 14 octobre 2026).
      </div>
      <div className="g-audience">
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Domaine</th>
                <th className="right">Inscrits</th>
                <th className="right">Actifs</th>
              </tr>
            </thead>
            <tbody>
              {byIndustry.map((r) => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td className="right num">{r.total}</td>
                  <td className="right num">{r.active}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Langue de l&apos;app</th>
                <th className="right">Inscrits</th>
              </tr>
            </thead>
            <tbody>
              {byLocale.map(([label, n]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td className="right num">{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
