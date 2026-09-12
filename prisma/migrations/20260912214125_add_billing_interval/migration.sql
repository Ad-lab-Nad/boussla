-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'ANNUAL');

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "billingInterval" "BillingInterval",
ADD COLUMN     "priceAmount" DOUBLE PRECISION;

