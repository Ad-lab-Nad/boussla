"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { addMonths, addYears, priceFor } from "@/lib/subscription";

/**
 * Records the tier + cadence the user picked and computes the access
 * end-date from it. No payment is actually collected here yet — there's no
 * payment gateway wired into Boussla (Stripe doesn't support TND; a local
 * gateway like Konnect/Paymee would need its own integration). This just
 * tracks the choice so billing can be settled outside the app for now.
 */
export async function chooseBillingPlan(formData: FormData) {
  const user = await getCurrentUser();
  const tier = formData.get("tier") === "PALIER_1" ? "PALIER_1" : "PALIER_2";
  const billingInterval = formData.get("billingInterval") === "ANNUAL" ? "ANNUAL" : "MONTHLY";

  const now = new Date();
  const priceAmount = priceFor(tier, billingInterval);
  const currentPeriodEnd =
    billingInterval === "ANNUAL" ? addYears(now, 1) : addMonths(now, 1);

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      tier,
      billingInterval,
      priceAmount,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd,
    },
    create: {
      userId: user.id,
      tier,
      billingInterval,
      priceAmount,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd,
    },
  });

  revalidatePath("/gestion/abonnement");
  revalidatePath("/gestion");
}
