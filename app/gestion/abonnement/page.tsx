import { Check } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { getOrCreateSubscription, TIER_PRICING } from "@/lib/subscription";
import { chooseBillingPlan } from "@/lib/subscription-actions";

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function monthsOffered(monthly: number, annual: number) {
  return Math.round((monthly * 12 - annual) / monthly);
}

const TIERS = [
  {
    tier: "PALIER_1" as const,
    name: "Palier 1",
    tagline: "Est-ce que je gagne vraiment de l'argent ?",
    features: [
      "Saisie rapide d'une vente",
      "Dépenses avec bascule pro/perso",
      "Photo de reçu et suggestion de dépense récurrente",
      "Le chiffre du mois : ce que vous gagnez vraiment",
      "Historique sur 3 mois",
    ],
  },
  {
    tier: "PALIER_2" as const,
    name: "Palier 2",
    tagline: "Où va mon argent, qui me doit encore, mon stock tient-il ?",
    features: [
      "Tout le Palier 1",
      "Tableau de bord complet et analyse sur l'année",
      "Suivi des impayés et des clients",
      "Gestion de stock avec alertes",
      "Suivi produits et production",
      "Commandes",
    ],
  },
];

export default async function AbonnementPage() {
  const user = await getCurrentUser();
  const subscription = await getOrCreateSubscription(user.id);

  const now = new Date();
  const isTrialing = subscription.status === "TRIALING";
  const daysLeft =
    isTrialing && subscription.currentPeriodEnd
      ? Math.max(
          0,
          Math.ceil((subscription.currentPeriodEnd.getTime() - now.getTime()) / 86_400_000)
        )
      : null;

  return (
    <>
      {isTrialing && (
        <div className="g-trial-banner">
          <span>
            🎁 Essai gratuit — <strong>{daysLeft}</strong> jour{daysLeft !== 1 ? "s" : ""} restant
            {daysLeft !== 1 ? "s" : ""}
            {subscription.currentPeriodEnd && (
              <> (jusqu&apos;au {formatDate(subscription.currentPeriodEnd)})</>
            )}
            . Accès complet pendant l&apos;essai — choisis un palier quand tu veux, aucune carte
            n&apos;est requise.
          </span>
        </div>
      )}

      {!isTrialing && subscription.status === "ACTIVE" && subscription.currentPeriodEnd && (
        <div className="g-trial-banner">
          <span>
            {subscription.tier === "PALIER_1" ? "Palier 1" : "Palier 2"} —{" "}
            {subscription.billingInterval === "ANNUAL" ? "plan annuel" : "plan mensuel"} actif —
            renouvellement le {formatDate(subscription.currentPeriodEnd)}.
          </span>
        </div>
      )}

      <div className="g-card">
        <h2>Choisis ton palier</h2>
        <div className="g-hint">Change de palier ou de cadence de paiement à tout moment.</div>

        <div className="g-plan-grid">
          {TIERS.map(({ tier, name, tagline, features }) => {
            const { monthly, annual } = TIER_PRICING[tier];
            const offered = monthsOffered(monthly, annual);
            const isCurrent =
              subscription.status === "ACTIVE" && subscription.tier === tier;

            return (
              <div
                key={tier}
                className={`g-plan-card ${tier === "PALIER_2" ? "g-plan-card--featured" : ""}`}
              >
                <h3>{name}</h3>
                <div className="g-plan-note" style={{ marginBottom: 10 }}>
                  {tagline}
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: "0.85rem" }}>
                      <Check size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="g-plan-price">
                  {monthly} DT <span>/ mois</span>
                </div>
                <div className="g-plan-note">
                  ou {annual} DT/an ({offered} mois offerts)
                </div>

                {isCurrent ? (
                  <span className="g-plan-current">
                    <Check size={15} /> Plan actuel (
                    {subscription.billingInterval === "ANNUAL" ? "annuel" : "mensuel"})
                  </span>
                ) : (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <form action={chooseBillingPlan} style={{ flex: 1 }}>
                      <input type="hidden" name="tier" value={tier} />
                      <input type="hidden" name="billingInterval" value="MONTHLY" />
                      <button
                        type="submit"
                        className={tier === "PALIER_2" ? "g-btn" : "g-btn secondary"}
                        style={{ width: "100%" }}
                      >
                        Mensuel
                      </button>
                    </form>
                    <form action={chooseBillingPlan} style={{ flex: 1 }}>
                      <input type="hidden" name="tier" value={tier} />
                      <input type="hidden" name="billingInterval" value="ANNUAL" />
                      <button
                        type="submit"
                        className={tier === "PALIER_2" ? "g-btn" : "g-btn secondary"}
                        style={{ width: "100%" }}
                      >
                        Annuel
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
