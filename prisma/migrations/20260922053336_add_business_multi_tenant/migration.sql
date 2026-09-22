-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_memberships" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_memberships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "business_memberships_businessId_userId_key" ON "business_memberships"("businessId", "userId");
CREATE INDEX "business_memberships_userId_idx" ON "business_memberships"("userId");

ALTER TABLE "business_memberships" ADD CONSTRAINT "business_memberships_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_memberships" ADD CONSTRAINT "business_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: exactly one Business + one OWNER BusinessMembership per existing
-- User. The CTE is forced MATERIALIZED so gen_random_uuid() is evaluated
-- once per user and both inserts below see the identical business id --
-- without this, Postgres could inline/re-evaluate the CTE and the two
-- inserts would disagree on which business belongs to which user.
WITH per_user AS MATERIALIZED (
  SELECT
    id AS user_id,
    gen_random_uuid() AS business_id,
    COALESCE(NULLIF(split_part(email, '@', 1), ''), 'Mon entreprise') AS business_name
  FROM "users"
),
ins_biz AS (
  INSERT INTO "businesses" ("id", "name", "createdAt", "updatedAt")
  SELECT business_id::text, business_name, now(), now() FROM per_user
  RETURNING id
)
INSERT INTO "business_memberships" ("id", "businessId", "userId", "role", "createdAt")
SELECT gen_random_uuid()::text, per_user.business_id::text, per_user.user_id, 'OWNER', now()
FROM per_user;

-- Product: userId -> businessId
ALTER TABLE "products" ADD COLUMN "businessId" TEXT;
UPDATE "products" p SET "businessId" = bm."businessId"
FROM "business_memberships" bm WHERE bm."userId" = p."userId";
ALTER TABLE "products" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "products" DROP CONSTRAINT "products_userId_fkey";
ALTER TABLE "products" DROP COLUMN "userId";
ALTER TABLE "products" ADD CONSTRAINT "products_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "products_businessId_idx" ON "products"("businessId");

-- StockItem: userId -> businessId
ALTER TABLE "stock_items" ADD COLUMN "businessId" TEXT;
UPDATE "stock_items" s SET "businessId" = bm."businessId"
FROM "business_memberships" bm WHERE bm."userId" = s."userId";
ALTER TABLE "stock_items" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "stock_items" DROP CONSTRAINT "stock_items_userId_fkey";
ALTER TABLE "stock_items" DROP COLUMN "userId";
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "stock_items_businessId_idx" ON "stock_items"("businessId");

-- Order: userId -> businessId
ALTER TABLE "orders" ADD COLUMN "businessId" TEXT;
UPDATE "orders" o SET "businessId" = bm."businessId"
FROM "business_memberships" bm WHERE bm."userId" = o."userId";
ALTER TABLE "orders" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "orders" DROP CONSTRAINT "orders_userId_fkey";
ALTER TABLE "orders" DROP COLUMN "userId";
ALTER TABLE "orders" ADD CONSTRAINT "orders_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "orders_businessId_idx" ON "orders"("businessId");

-- Client: userId -> businessId (had its own index/FK already)
ALTER TABLE "clients" ADD COLUMN "businessId" TEXT;
UPDATE "clients" c SET "businessId" = bm."businessId"
FROM "business_memberships" bm WHERE bm."userId" = c."userId";
ALTER TABLE "clients" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "clients" DROP CONSTRAINT "clients_userId_fkey";
DROP INDEX "clients_userId_idx";
ALTER TABLE "clients" DROP COLUMN "userId";
ALTER TABLE "clients" ADD CONSTRAINT "clients_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "clients_businessId_idx" ON "clients"("businessId");

-- Expense: userId -> businessId
ALTER TABLE "expenses" ADD COLUMN "businessId" TEXT;
UPDATE "expenses" e SET "businessId" = bm."businessId"
FROM "business_memberships" bm WHERE bm."userId" = e."userId";
ALTER TABLE "expenses" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_userId_fkey";
ALTER TABLE "expenses" DROP COLUMN "userId";
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "expenses_businessId_idx" ON "expenses"("businessId");

-- MonthlyGoal: userId -> businessId, unique constraint moves with it
ALTER TABLE "monthly_goals" ADD COLUMN "businessId" TEXT;
UPDATE "monthly_goals" mg SET "businessId" = bm."businessId"
FROM "business_memberships" bm WHERE bm."userId" = mg."userId";
ALTER TABLE "monthly_goals" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "monthly_goals" DROP CONSTRAINT "monthly_goals_userId_fkey";
DROP INDEX "monthly_goals_userId_month_key";
ALTER TABLE "monthly_goals" DROP COLUMN "userId";
ALTER TABLE "monthly_goals" ADD CONSTRAINT "monthly_goals_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "monthly_goals_businessId_month_key" ON "monthly_goals"("businessId", "month");

-- New tables default to RLS off — keep them consistent with every other
-- table (Prisma connects as "postgres", which has BYPASSRLS, so this has no
-- effect on the app itself; it only closes the public PostgREST API).
ALTER TABLE "businesses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "business_memberships" ENABLE ROW LEVEL SECURITY;
