import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/admin-email";

export { ADMIN_EMAIL };

/**
 * Defense-in-depth for /admin, mirroring getCurrentUser's role for /gestion:
 * proxy.ts already redirects non-admins away at the routing level, this is
 * the check for Server Actions/Components reached directly.
 */
export async function requireAdmin() {
  if (process.env.NODE_ENV !== "production" && process.env.DEV_BYPASS_AUTH_EMAIL) {
    if (process.env.DEV_BYPASS_AUTH_EMAIL !== ADMIN_EMAIL) redirect("/gestion");
    return;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims || claims.email !== ADMIN_EMAIL) redirect("/login");
}

type SubscriptionSummary = {
  status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING";
  currentPeriodEnd: Date | null;
  billingInterval: "MONTHLY" | "ANNUAL" | null;
} | null;

export function describeSubscription(sub: SubscriptionSummary, now: Date) {
  if (!sub) return { label: "Aucun abonnement", badge: "status-warning" as const };

  const expired = sub.currentPeriodEnd ? sub.currentPeriodEnd <= now : false;

  if (sub.status === "TRIALING") {
    return expired
      ? { label: "Essai expiré", badge: "status-error" as const }
      : { label: "Essai actif", badge: "status-valid" as const };
  }
  if (sub.status === "ACTIVE") {
    const interval = sub.billingInterval === "ANNUAL" ? "annuel" : "mensuel";
    return expired
      ? { label: `Payant expiré (${interval})`, badge: "status-error" as const }
      : { label: `Payant actif (${interval})`, badge: "status-valid" as const };
  }
  if (sub.status === "PAST_DUE") return { label: "Paiement en retard", badge: "status-error" as const };
  return { label: "Annulé", badge: "status-warning" as const };
}

/** True when this user currently has paid, unexpired access. */
export function isActivePaying(sub: SubscriptionSummary, now: Date) {
  return sub?.status === "ACTIVE" && (!sub.currentPeriodEnd || sub.currentPeriodEnd > now);
}

/** True when this user is within an unexpired free trial. */
export function isActiveTrial(sub: SubscriptionSummary, now: Date) {
  return sub?.status === "TRIALING" && (!sub.currentPeriodEnd || sub.currentPeriodEnd > now);
}
