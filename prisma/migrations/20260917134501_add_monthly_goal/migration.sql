-- CreateTable
CREATE TABLE "monthly_goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "targetRevenue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_goals_userId_month_key" ON "monthly_goals"("userId", "month");

-- AddForeignKey
ALTER TABLE "monthly_goals" ADD CONSTRAINT "monthly_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- New tables default to RLS off — keep this one consistent with the fix in
-- 20260915175708_enable_row_level_security (Prisma connects as "postgres",
-- which has BYPASSRLS, so this has no effect on the app itself).
ALTER TABLE "monthly_goals" ENABLE ROW LEVEL SECURITY;
