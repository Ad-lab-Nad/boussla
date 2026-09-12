"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { PRICE_ANNUAL, PRICE_MONTHLY, addMonths, addYears } from "@/lib/subscription";

/**
 * Records the plan the user picked (mensuel/annuel) and computes the access
 * end-date from it. No payment is actually collected here yet — there's no
 * payment gateway wired into Boussla (Stripe doesn't support TND; a local
 * gateway like Konnect/Paymee would need its own integration). This just
 * tracks the choice so billing can be settled outside the app for now.
 */
export async function chooseBillingPlan(formData: FormData) {
  const user = await getCurrentUser();
  const billingInterval = formData.get("billingInterval") === "ANNUAL" ? "ANNUAL" : "MONTHLY";

  const now = new Date();
  const priceAmount = billingInterval === "ANNUAL" ? PRICE_ANNUAL : PRICE_MONTHLY;
  const currentPeriodEnd =
    billingInterval === "ANNUAL" ? addYears(now, 1) : addMonths(now, 1);

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      billingInterval,
      priceAmount,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd,
    },
    create: {
      userId: user.id,
      billingInterval,
      priceAmount,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd,
    },
  });

  revalidatePath("/gestion/abonnement");
}
