"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { getPlatformBusinessId } from "@/lib/platform-business";
import { addMonths, addYears, priceFor } from "@/lib/subscription";
import { parseDateInput, todayStr } from "@/lib/gestion/format";
import { PLATFORM_EXPENSE_CATEGORY_VALUES } from "@/lib/platform-expense-categories";
import type { BillingInterval, ExpenseCategory, SubscriptionTier } from "@prisma/client";

/**
 * A received subscription payment, stored as a paid + delivered Order of the
 * platform Business (see lib/platform-business.ts) so the back office's
 * revenue/net profit come out of the same totalsForMonth math as /gestion.
 * clientName holds the payer's email — that's how the back office tells
 * which users have already paid.
 */
function paymentOrderData(params: {
  businessId: string;
  email: string;
  tier: SubscriptionTier;
  billingInterval: BillingInterval;
  amount: number;
  date: Date;
}) {
  const { businessId, email, tier, billingInterval, amount, date } = params;
  const tierLabel = tier === "PALIER_1" ? "Palier 1" : "Palier 2";
  const intervalLabel = billingInterval === "ANNUAL" ? "annuel" : "mensuel";
  return {
    businessId,
    date,
    clientName: email,
    status: "DELIVERED" as const,
    paymentStatus: "PAID" as const,
    paymentDate: date,
    paymentMethod: "OTHER" as const,
    lines: {
      create: {
        productNameSnapshot: `${tierLabel} — ${intervalLabel}`,
        quantity: 1,
        sellPriceSnapshot: amount,
        unitCostSnapshot: 0,
        sellUnitSnapshot: "PIECE" as const,
      },
    },
  };
}

/** A stored DateTime normalized to UTC midnight of its own day, matching how
 * every Gestion date is stored (so monthKeyFromDate buckets it correctly). */
function dayOf(d: Date): Date {
  return parseDateInput(d.toISOString().slice(0, 10));
}

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
  const tier: SubscriptionTier = formData.get("tier") === "PALIER_1" ? "PALIER_1" : "PALIER_2";
  const billingInterval: BillingInterval =
    formData.get("billingInterval") === "ANNUAL" ? "ANNUAL" : "MONTHLY";
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Utilisateur introuvable.");

  const businessId = await getPlatformBusinessId();
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  const now = new Date();
  const base = existing?.currentPeriodEnd && existing.currentPeriodEnd > now ? existing.currentPeriodEnd : now;
  const priceAmount = priceFor(tier, billingInterval);
  const currentPeriodEnd = billingInterval === "ANNUAL" ? addYears(base, 1) : addMonths(base, 1);

  const subscriptionData = {
    tier,
    billingInterval,
    priceAmount,
    status: "ACTIVE" as const,
    currentPeriodStart: now,
    currentPeriodEnd,
  };

  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { userId },
      update: subscriptionData,
      create: { userId, ...subscriptionData },
    }),
    prisma.order.create({
      data: paymentOrderData({
        businessId,
        email: user.email,
        tier,
        billingInterval,
        amount: priceAmount,
        date: parseDateInput(todayStr()),
      }),
    }),
  ]);

  revalidatePath("/admin");
}

/**
 * Before payments were recorded, "Marquer payé" (and a user picking a plan on
 * /gestion/abonnement) only flipped the subscription to ACTIVE, leaving no
 * trace of whether money actually came in. This confirms that one did,
 * recording it at the plan's price and start date — without touching the
 * subscription itself, since that access was already granted.
 */
export async function confirmPastPayment(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { subscription: true } });
  const sub = user?.subscription;
  if (!user || !sub || sub.status !== "ACTIVE") throw new Error("Aucun abonnement payant à confirmer.");

  const businessId = await getPlatformBusinessId();
  const billingInterval = sub.billingInterval ?? "MONTHLY";
  await prisma.order.create({
    data: paymentOrderData({
      businessId,
      email: user.email,
      tier: sub.tier,
      billingInterval,
      amount: sub.priceAmount ?? priceFor(sub.tier, billingInterval),
      date: dayOf(sub.currentPeriodStart ?? sub.updatedAt),
    }),
  });

  revalidatePath("/admin");
}

/** Undo for a payment recorded by mistake — removes only the latest one.
 * Leaves the subscription's access alone; that's a separate decision. */
export async function cancelLastPayment(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Utilisateur introuvable.");

  const businessId = await getPlatformBusinessId();
  const last = await prisma.order.findFirst({
    where: { businessId, clientName: user.email },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  if (last) await prisma.order.delete({ where: { id: last.id } });

  revalidatePath("/admin");
}

// ---------- DÉPENSES DE LA PLATEFORME ----------

export async function createPlatformExpense(formData: FormData) {
  await requireAdmin();

  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount")) || 0;
  const categoryRaw = String(formData.get("category") ?? "");
  const category = PLATFORM_EXPENSE_CATEGORY_VALUES.includes(categoryRaw) ? categoryRaw : "OTHER";
  const dateRaw = String(formData.get("date") ?? "").trim() || todayStr();
  if (!description || amount <= 0) throw new Error("Remplissez la description et le montant.");

  const businessId = await getPlatformBusinessId();
  await prisma.expense.create({
    data: {
      businessId,
      date: parseDateInput(dateRaw),
      description,
      amount,
      category: category as ExpenseCategory,
    },
  });

  revalidatePath("/admin");
}

export async function deletePlatformExpense(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const businessId = await getPlatformBusinessId();
  await prisma.expense.deleteMany({ where: { id, businessId } });

  revalidatePath("/admin");
}
