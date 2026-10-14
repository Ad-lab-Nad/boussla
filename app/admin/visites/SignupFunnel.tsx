// "Inscription : où ça bloque" — the sign-up form step by step, from the
// anonymous events in lib/signup-events.ts.

const REASONS: Record<string, string> = {
  "identifier:valueMissing": "Téléphone/e-mail laissé vide",
  "password:valueMissing": "Mot de passe laissé vide",
  "password:tooShort": "Mot de passe trop court (moins de 8 caractères)",
  missing_fields: "Champ vide",
  password_short: "Mot de passe trop court (moins de 8 caractères)",
  password_mismatch: "Mots de passe différents",
  "account_exists:email": "Compte déjà existant (e-mail)",
  "account_exists:phone": "Compte déjà existant (téléphone)",
  "supabase:already_registered": "Compte déjà existant",
  "supabase:rate_limit": "Trop de tentatives",
  "supabase:invalid_email": "E-mail refusé",
  "invalid_identifier:email": "E-mail mal écrit",
};

function reasonLabel(detail: string): string {
  if (REASONS[detail]) return REASONS[detail];
  const digits = detail.match(/^invalid_identifier:digits_(\d+)$/);
  if (digits) return `Numéro refusé (${digits[1]} chiffres)`;
  if (detail.startsWith("supabase:")) return `Erreur technique : ${detail.slice(9) || "inconnue"}`;
  return detail;
}

type Event = { event: string; detail: string | null };

export function SignupFunnel({ arrivals, events }: { arrivals: number; events: Event[] }) {
  const count = (name: string) => events.filter((e) => e.event === name).length;
  const steps = [
    { label: "Arrivés sur l'inscription", value: arrivals },
    { label: "Ont commencé à remplir", value: count("started") },
    { label: "Ont appuyé sur « Créer mon compte »", value: count("submitted") },
    { label: "Comptes créés", value: count("success") },
  ];
  const blocks = new Map<string, number>();
  for (const e of events) {
    if (e.event !== "client_invalid" && e.event !== "error") continue;
    const label = reasonLabel(e.detail ?? "other");
    blocks.set(label, (blocks.get(label) ?? 0) + 1);
  }
  const sorted = [...blocks.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="g-card">
      <h2>Inscription : où ça bloque</h2>
      <div className="g-hint">
        Chaque étape du formulaire, sans rien de personnel. Mesuré depuis le 14 octobre 2026.
      </div>
      <div className="g-table-wrap">
        <table className="g-table">
          <tbody>
            {steps.map((s, i) => (
              <tr key={s.label}>
                <td>{s.label}</td>
                <td className="right num">{s.value}</td>
                <td className="right num" style={{ color: "var(--g-muted)" }}>
                  {i > 0 && steps[i - 1].value > 0 ? `${Math.round((s.value / steps[i - 1].value) * 100)} %` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 style={{ fontSize: "0.9rem", margin: "16px 0 8px" }}>Messages d&apos;erreur vus</h3>
      {sorted.length === 0 ? (
        <div className="g-empty">Aucune erreur sur cette période.</div>
      ) : (
        <div className="g-table-wrap">
          <table className="g-table">
            <tbody>
              {sorted.map(([label, n]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td className="right num">{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
