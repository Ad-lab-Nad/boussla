import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { BillingInterval, SubscriptionTier } from "@prisma/client";

// PIBA's two Phase-1 tiers (Palier 3 is Phase 2, not modeled yet). Palier 1
// gets the annual price at the same ~2-months-free ratio Palier 2 already
// used (39×12 − 2×39 = 390 → 19×12 − 2×19 = 190).
export const TIER_PRICING: Record<SubscriptionTier, { monthly: number; annual: number }> = {
  PALIER_1: { monthly: 19, annual: 190 },
  PALIER_2: { monthly: 39, annual: 390 },
};

export function priceFor(tier: SubscriptionTier, interval: BillingInterval): number {
  return interval === "ANNUAL" ? TIER_PRICING[tier].annual : TIER_PRICING[tier].monthly;
}

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
      currentPeriodEnd: addDays(now, TRIAL_DAYS),
    },
  });
});
