import { Check } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { getOrCreateSubscription, TIER_PRICING } from "@/lib/subscription";
import { chooseBillingPlan } from "@/lib/subscription-actions";
import { getServerT } from "@/lib/i18n/server";
import type { TFunction } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/config";

const DATE_LOCALE: Record<Locale, string> = { fr: "fr-FR", ar: "ar-TN", en: "en-US" };

function formatDate(d: Date, locale: Locale) {
  return d.toLocaleDateString(DATE_LOCALE[locale], { day: "numeric", month: "long", year: "numeric" });
}

function monthsOffered(monthly: number, annual: number) {
  return Math.round((monthly * 12 - annual) / monthly);
}

function tiers(t: TFunction) {
  return [
    {
      tier: "PALIER_1" as const,
      name: t("gestion.abonnement.palier1Name"),
      tagline: t("gestion.abonnement.palier1Tagline"),
      features: [
        t("gestion.abonnement.palier1Feature1"),
        t("gestion.abonnement.palier1Feature2"),
        t("gestion.abonnement.palier1Feature3"),
        t("gestion.abonnement.palier1Feature4"),
        t("gestion.abonnement.palier1Feature5"),
      ],
    },
    {
      tier: "PALIER_2" as const,
      name: t("gestion.abonnement.palier2Name"),
      tagline: t("gestion.abonnement.palier2Tagline"),
      features: [
        t("gestion.abonnement.palier2Feature1"),
        t("gestion.abonnement.palier2Feature2"),
        t("gestion.abonnement.palier2Feature3"),
        t("gestion.abonnement.palier2Feature4"),
        t("gestion.abonnement.palier2Feature5"),
        t("gestion.abonnement.palier2Feature6"),
      ],
    },
  ];
}

export default async function AbonnementPage() {
  const { t, locale } = await getServerT();
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
            {t("gestion.abonnement.trialBanner", {
              days: daysLeft ?? 0,
              dayWord: daysLeft === 1 ? t("gestion.abonnement.day") : t("gestion.abonnement.days"),
            })}
            {subscription.currentPeriodEnd && (
              <> ({t("gestion.abonnement.until", { date: formatDate(subscription.currentPeriodEnd, locale) })})</>
            )}
            . {t("gestion.abonnement.trialBannerSuffix")}
          </span>
        </div>
      )}

      {!isTrialing && subscription.status === "ACTIVE" && subscription.currentPeriodEnd && (
        <div className="g-trial-banner">
          <span>
            {subscription.tier === "PALIER_1" ? t("gestion.abonnement.palier1Name") : t("gestion.abonnement.palier2Name")} —{" "}
            {subscription.billingInterval === "ANNUAL" ? t("gestion.abonnement.annualPlan") : t("gestion.abonnement.monthlyPlan")}{" "}
            {t("gestion.abonnement.activeRenewal", { date: formatDate(subscription.currentPeriodEnd, locale) })}
          </span>
        </div>
      )}

      <div className="g-card">
        <h2>{t("gestion.abonnement.chooseTierTitle")}</h2>
        <div className="g-hint">{t("gestion.abonnement.chooseTierHint")}</div>

        <div className="g-plan-grid">
          {tiers(t).map(({ tier, name, tagline, features }) => {
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
                  {monthly} DT <span>{t("gestion.abonnement.perMonth")}</span>
                </div>
                <div className="g-plan-note">
                  {t("gestion.abonnement.orAnnual", { amount: annual, months: offered })}
                </div>

                {isCurrent ? (
                  <span className="g-plan-current">
                    <Check size={15} /> {t("gestion.abonnement.currentPlan", {
                      interval: subscription.billingInterval === "ANNUAL" ? t("gestion.abonnement.annual") : t("gestion.abonnement.monthly"),
                    })}
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
                        {t("gestion.abonnement.monthly")}
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
                        {t("gestion.abonnement.annual")}
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
