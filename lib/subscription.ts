import { cache } from "react";
import { prisma } from "@/lib/prisma";

export { TIER_PRICING, priceFor } from "@/lib/pricing";

// Free trial length for every new account (calendar month, not a fixed
// number of days — "un mois gratuit" is what the marketing copy promises).
export const TRIAL_MONTHS = 1;

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
 * Cached per request: both nav gating (app/gestion/layout.tsx) and page-level
 * access guards (lib/subscription-access.ts) call this in the same render.
 */
export const getOrCreateSubscription = cache(async function getOrCreateSubscription(userId: string) {
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing) return existing;

  const now = new Date();
  return prisma.subscription.create({
    data: {
      userId,
      tier: "PALIER_2",
      status: "TRIALING",
      currentPeriodStart: now,
      currentPeriodEnd: addMonths(now, TRIAL_MONTHS),
    },
  });
});
