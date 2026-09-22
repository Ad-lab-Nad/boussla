"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { addMonths, addYears, priceFor } from "@/lib/subscription";

/**
 * Manual stand-in for a payment gateway: there's no automated billing for
 * Tunisian accounts yet, so a payment received outside the app (cash, check,
 * bank transfer) gets recorded here. Extends from whatever time is left on
 * the current period rather than always resetting from today, so renewing
 * early never costs the user days they already paid for.
 */
export async function markPaymentReceived(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const tier = formData.get("tier") === "PALIER_1" ? "PALIER_1" : "PALIER_2";
  const billingInterval = formData.get("billingInterval") === "ANNUAL" ? "ANNUAL" : "MONTHLY";
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Utilisateur introuvable.");

  const existing = await prisma.subscription.findUnique({ where: { userId } });
  const now = new Date();
  const base = existing?.currentPeriodEnd && existing.currentPeriodEnd > now ? existing.currentPeriodEnd : now;
  const priceAmount = priceFor(tier, billingInterval);
  const currentPeriodEnd = billingInterval === "ANNUAL" ? addYears(base, 1) : addMonths(base, 1);

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      tier,
      billingInterval,
      priceAmount,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd,
    },
    create: {
      userId,
      tier,
      billingInterval,
      priceAmount,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd,
    },
  });

  revalidatePath("/admin");
}
