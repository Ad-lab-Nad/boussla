import type { BillingInterval, SubscriptionTier } from "@prisma/client";

// PIBA's two Phase-1 tiers (Palier 3 is Phase 2, not modeled yet). Palier 1
// gets the annual price at the same ~2-months-free ratio Palier 2 already
// used (39×12 − 2×39 = 390 → 19×12 − 2×19 = 190).
// Pure data, no server imports — safe to use from Client Components (e.g.
// the signup form's tier picker). lib/subscription.ts re-exports these.
export const TIER_PRICING: Record<SubscriptionTier, { monthly: number; annual: number }> = {
  PALIER_1: { monthly: 19, annual: 190 },
  PALIER_2: { monthly: 39, annual: 390 },
};

export function priceFor(tier: SubscriptionTier, interval: BillingInterval): number {
  return interval === "ANNUAL" ? TIER_PRICING[tier].annual : TIER_PRICING[tier].monthly;
}
