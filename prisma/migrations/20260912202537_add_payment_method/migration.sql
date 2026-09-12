-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CHECK', 'TRANSFER', 'OTHER');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "checkDueDate" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH';

