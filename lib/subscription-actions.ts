"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { getOrCreateSubscription, priceFor } from "@/lib/subscription";
import { hasActiveAccess } from "@/lib/subscription-access";

/**
 * Records the tier + cadence the user picked — a request, not a payment.
 * There's no payment gateway wired in yet (Stripe doesn't support TND; a
 * local gateway like Konnect/Paymee would need its own integration), so paid
 * access only turns on when the admin marks the payment received
 * (lib/admin-actions.ts markPaymentReceived). Status and access period are
 * therefore left untouched here: a trial stays a trial (which already grants
 * full access regardless of tier), an expired account stays expired.
 *
 * An ACTIVE (paying) subscription's tier is what gates access, so it can't
 * be overwritten here without handing out an unpaid upgrade — per the
 * no-prorata rule, a paying user's switch takes effect at their next
 * payment, which the admin records with the new tier. An ACTIVE period that
 * has already run out grants nothing, so a renewal pick is recorded normally.
 */
export async function chooseBillingPlan(formData: FormData) {
  const user = await getCurrentUser();
  const tier = formData.get("tier") === "PALIER_1" ? "PALIER_1" : "PALIER_2";
  const billingInterval = formData.get("billingInterval") === "ANNUAL" ? "ANNUAL" : "MONTHLY";

  const subscription = await getOrCreateSubscription(user.id);
  if (subscription.status === "ACTIVE" && hasActiveAccess(subscription)) return;

  await prisma.subscription.update({
    where: { userId: user.id },
    data: { tier, billingInterval, priceAmount: priceFor(tier, billingInterval) },
  });

  revalidatePath("/gestion/abonnement");
  revalidatePath("/gestion");
  revalidatePath("/admin");
}
