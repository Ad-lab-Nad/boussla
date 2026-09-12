import { prisma } from "@/lib/prisma";

export const PRICE_MONTHLY = 39;
export const PRICE_ANNUAL = 390;
export const TRIAL_DAYS = 14;

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

/**
 * Fetches the user's subscription, creating a fresh 14-day trial if one
 * doesn't exist yet — covers both a brand-new signup and an account created
 * before this feature existed (e.g. claimed from the old single-user
 * stopgap), so every account is self-healing rather than needing a backfill.
 */
export async function getOrCreateSubscription(userId: string) {
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing) return existing;

  const now = new Date();
  return prisma.subscription.create({
    data: {
      userId,
      plan: "FREE_TRIAL",
      status: "TRIALING",
      currentPeriodStart: now,
      currentPeriodEnd: addDays(now, TRIAL_DAYS),
    },
  });
}
