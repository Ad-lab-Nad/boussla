-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExpenseCategory" ADD VALUE 'SUPPLIES_EQUIPMENT';
ALTER TYPE "ExpenseCategory" ADD VALUE 'RESEARCH_DEVELOPMENT';
ALTER TYPE "ExpenseCategory" ADD VALUE 'RENT';
ALTER TYPE "ExpenseCategory" ADD VALUE 'SALARIES_LABOR';
ALTER TYPE "ExpenseCategory" ADD VALUE 'PACKAGING';
ALTER TYPE "ExpenseCategory" ADD VALUE 'BANK_FEES';

