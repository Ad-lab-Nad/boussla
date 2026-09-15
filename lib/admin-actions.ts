"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { PRICE_ANNUAL, PRICE_MONTHLY, addMonths, addYears } from "@/lib/subscription";

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
  const billingInterval = formData.get("billingInterval") === "ANNUAL" ? "ANNUAL" : "MONTHLY";
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Utilisateur introuvable.");

  const existing = await prisma.subscription.findUnique({ where: { userId } });
  const now = new Date();
  const base = existing?.currentPeriodEnd && existing.currentPeriodEnd > now ? existing.currentPeriodEnd : now;
  const priceAmount = billingInterval === "ANNUAL" ? PRICE_ANNUAL : PRICE_MONTHLY;
  const currentPeriodEnd = billingInterval === "ANNUAL" ? addYears(base, 1) : addMonths(base, 1);

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      billingInterval,
      priceAmount,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd,
    },
    create: {
      userId,
      billingInterval,
      priceAmount,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd,
    },
  });

  revalidatePath("/admin");
}
