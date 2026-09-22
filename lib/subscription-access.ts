import { redirect } from "next/navigation";
import type { Subscription } from "@prisma/client";
import { getCurrentUser } from "@/lib/current-user";
import { getOrCreateSubscription } from "@/lib/subscription";

/** TRIALING always grants full access — no regression on today's trial UX. */
export function canAccessPalier2(subscription: Pick<Subscription, "status" | "tier">): boolean {
  if (subscription.status === "TRIALING") return true;
  return subscription.status === "ACTIVE" && subscription.tier === "PALIER_2";
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
