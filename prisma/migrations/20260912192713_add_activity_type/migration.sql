-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('PRODUCTS', 'SERVICES');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activityType" "ActivityType" NOT NULL DEFAULT 'PRODUCTS';

