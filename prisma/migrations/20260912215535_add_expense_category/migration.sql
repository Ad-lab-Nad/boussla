-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('ADVERTISING', 'TRANSPORT', 'FIXED_COSTS', 'STOCK_PURCHASES', 'OTHER');

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "category" "ExpenseCategory" NOT NULL DEFAULT 'OTHER';

