import { redirect } from "next/navigation";
import type { Subscription } from "@prisma/client";
import { getCurrentUser } from "@/lib/current-user";
import { getOrCreateSubscription } from "@/lib/subscription";

type AccessFields = Pick<Subscription, "status" | "tier" | "currentPeriodEnd">;

/**
 * Whether the account can use the app at all: an unexpired trial or an
 * unexpired paid period. Once either runs out, only the Abonnement page stays
 * reachable (see GestionChrome) until the admin records a payment — data is
 * kept, just not shown. Palier 1 is paid too, so an expired account must not
 * quietly fall back to it for free.
 */
export function hasActiveAccess(subscription: AccessFields, now: Date = new Date()): boolean {
  if (subscription.status !== "TRIALING" && subscription.status !== "ACTIVE") return false;
  return !subscription.currentPeriodEnd || subscription.currentPeriodEnd > now;
}

/** An unexpired trial always grants full access — no regression on today's trial UX. */
export function canAccessPalier2(subscription: AccessFields): boolean {
  if (!hasActiveAccess(subscription)) return false;
  return subscription.status === "TRIALING" || subscription.tier === "PALIER_2";
}

/** Call as the first line of a Palier-2-only Server Component page. */
export async function requirePalier2Page() {
  const user = await getCurrentUser();
  const subscription = await getOrCreateSubscription(user.id);
  if (!canAccessPalier2(subscription)) redirect("/gestion");
}

/** Call as the first line of a Palier-2-only Server Action. */
export async function assertPalier2Access() {
  const user = await getCurrentUser();
  const subscription = await getOrCreateSubscription(user.id);
  if (!canAccessPalier2(subscription)) {
    throw new Error("Cette fonctionnalité est réservée au Palier 2. Passez à l'offre supérieure dans Abonnement.");
  }
}
