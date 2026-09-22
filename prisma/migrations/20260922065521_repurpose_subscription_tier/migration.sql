-- The "plan" column (PlanTier: FREE_TRIAL/STARTER/PRO/AGENCY) predates
-- Boussla and is dead weight: it has exactly one live write site (its own
-- default at Subscription creation) and is never read anywhere in the app.
-- Repurposed here as the real Palier 1/2 tier field. Every existing row
-- (active or trialing) backfills to PALIER_2 — zero disruption, since
-- TRIALING already grants full access regardless of stored tier, and every
-- currently-paying account is on today's single 39DT plan (= Palier 2).

CREATE TYPE "SubscriptionTier" AS ENUM ('PALIER_1', 'PALIER_2');

ALTER TABLE "subscriptions" ADD COLUMN "tier" "SubscriptionTier";

UPDATE "subscriptions" SET "tier" = 'PALIER_2';

ALTER TABLE "subscriptions" ALTER COLUMN "tier" SET NOT NULL;
ALTER TABLE "subscriptions" ALTER COLUMN "tier" SET DEFAULT 'PALIER_2';

ALTER TABLE "subscriptions" DROP COLUMN "plan";

DROP TYPE "PlanTier";
