-- AlterTable
ALTER TABLE "users" ADD COLUMN     "authUserId" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marketingConsentAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_authUserId_key" ON "users"("authUserId");

