import { Check } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { getOrCreateSubscription, PRICE_ANNUAL, PRICE_MONTHLY } from "@/lib/subscription";
import { chooseBillingPlan } from "@/lib/subscription-actions";

const MONTHLY_EQUIVALENT_ANNUAL = Math.round((PRICE_ANNUAL / 12) * 100) / 100;
const MONTHS_OFFERED = Math.round((PRICE_MONTHLY * 12 - PRICE_ANNUAL) / PRICE_MONTHLY);

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

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
            . Choisis un plan quand tu veux, aucune carte n&apos;est requise pendant l&apos;essai.
          </span>
        </div>
      )}

      {!isTrialing && subscription.status === "ACTIVE" && subscription.currentPeriodEnd && (
        <div className="g-trial-banner">
          <span>
            Plan {subscription.billingInterval === "ANNUAL" ? "annuel" : "mensuel"} actif —
            renouvellement le {formatDate(subscription.currentPeriodEnd)}.
          </span>
        </div>
      )}

      <div className="g-card">
        <h2>Choisis ton plan</h2>
        <div className="g-hint">
          Même produit, deux façons de payer. Change à tout moment.
        </div>

        <div className="g-plan-grid">
          <div className="g-plan-card">
            <h3>Mensuel</h3>
            <div className="g-plan-price">
              {PRICE_MONTHLY} DT <span>/ mois</span>
            </div>
            <div className="g-plan-note">Facturé chaque mois.</div>
            {subscription.status === "ACTIVE" && subscription.billingInterval === "MONTHLY" ? (
              <span className="g-plan-current">
                <Check size={15} /> Plan actuel
              </span>
            ) : (
              <form action={chooseBillingPlan}>
                <input type="hidden" name="billingInterval" value="MONTHLY" />
                <button type="submit" className="g-btn secondary" style={{ width: "100%" }}>
                  Choisir le mensuel
                </button>
              </form>
            )}
          </div>

          <div className="g-plan-card g-plan-card--featured">
            <span className="g-plan-badge">{MONTHS_OFFERED} mois offerts</span>
            <h3>Annuel</h3>
            <div className="g-plan-price">
              {PRICE_ANNUAL} DT <span>/ an</span>
            </div>
            <div className="g-plan-note">
              Soit {MONTHLY_EQUIVALENT_ANNUAL.toString().replace(".", ",")} DT/mois, payé en une
              fois.
            </div>
            {subscription.status === "ACTIVE" && subscription.billingInterval === "ANNUAL" ? (
              <span className="g-plan-current">
                <Check size={15} /> Plan actuel
              </span>
            ) : (
              <form action={chooseBillingPlan}>
                <input type="hidden" name="billingInterval" value="ANNUAL" />
                <button type="submit" className="g-btn" style={{ width: "100%" }}>
                  Choisir l&apos;annuel
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
