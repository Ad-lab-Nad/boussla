-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE_TRIAL', 'STARTER', 'PRO', 'AGENCY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING');

-- CreateEnum
CREATE TYPE "AdPlatform" AS ENUM ('META', 'GOOGLE', 'TIKTOK', 'SNAPCHAT', 'OTHER');

-- CreateEnum
CREATE TYPE "CampaignObjective" AS ENUM ('SALES', 'LEADS', 'TRAFFIC', 'MESSAGES', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('DRAFT', 'ANALYZING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "MessageMatchStatus" AS ENUM ('MATCH', 'PARTIAL_MISMATCH', 'MISMATCH');

-- CreateEnum
CREATE TYPE "ScaleDecision" AS ENUM ('SCALE', 'OPTIMIZE', 'TEST', 'STOP', 'INSUFFICIENT_DATA');

-- CreateEnum
CREATE TYPE "ScalingType" AS ENUM ('VERTICAL', 'HORIZONTAL', 'NOT_APPLICABLE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "PlanTier" NOT NULL DEFAULT 'FREE_TRIAL',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "auditsQuotaPerMonth" INTEGER NOT NULL DEFAULT 5,
    "auditsUsedThisPeriod" INTEGER NOT NULL DEFAULT 0,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "AdPlatform" NOT NULL,
    "objective" "CampaignObjective" NOT NULL,
    "industry" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TND',
    "productName" TEXT NOT NULL,
    "sellingPrice" DOUBLE PRECISION NOT NULL,
    "productCost" DOUBLE PRECISION NOT NULL,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherCosts" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "AuditStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_kpis" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "spend" DOUBLE PRECISION NOT NULL,
    "impressions" INTEGER NOT NULL,
    "reach" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL,
    "landingPageViews" INTEGER NOT NULL,
    "addToCart" INTEGER NOT NULL,
    "checkouts" INTEGER NOT NULL,
    "purchases" INTEGER NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "frequency" DOUBLE PRECISION,
    "ctr" DOUBLE PRECISION,
    "cpc" DOUBLE PRECISION,
    "cpm" DOUBLE PRECISION,
    "lpViewRate" DOUBLE PRECISION,
    "addToCartRate" DOUBLE PRECISION,
    "checkoutRate" DOUBLE PRECISION,
    "conversionRate" DOUBLE PRECISION,
    "cpa" DOUBLE PRECISION,
    "roas" DOUBLE PRECISION,
    "margin" DOUBLE PRECISION,
    "breakEvenRoas" DOUBLE PRECISION,
    "estimatedProfit" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_kpis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creative_analyses" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "mainText" TEXT,
    "headline" TEXT,
    "cta" TEXT,
    "hookScore" INTEGER,
    "attentionScore" INTEGER,
    "clarityScore" INTEGER,
    "productVisibilityScore" INTEGER,
    "offerScore" INTEGER,
    "benefitScore" INTEGER,
    "ctaScore" INTEGER,
    "readabilityScore" INTEGER,
    "socialProofScore" INTEGER,
    "differentiationScore" INTEGER,
    "visualConsistencyScore" INTEGER,
    "persuasionScore" INTEGER,
    "creativeScore" INTEGER,
    "strengths" JSONB,
    "weaknesses" JSONB,
    "rawAiResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creative_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_page_analyses" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "url" TEXT,
    "screenshotUrl" TEXT,
    "valuePropositionScore" INTEGER,
    "offerScore" INTEGER,
    "priceClarityScore" INTEGER,
    "ctaScore" INTEGER,
    "productPresentationScore" INTEGER,
    "argumentScore" INTEGER,
    "reviewsScore" INTEGER,
    "socialProofScore" INTEGER,
    "guaranteesScore" INTEGER,
    "deliveryScore" INTEGER,
    "paymentOptionsScore" INTEGER,
    "trustScore" INTEGER,
    "mobileUxScore" INTEGER,
    "frictionScore" INTEGER,
    "purchaseClarityScore" INTEGER,
    "landingPageScore" INTEGER,
    "messageMatchStatus" "MessageMatchStatus",
    "messageMatchExplanation" TEXT,
    "rawAiResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landing_page_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "campaignScore" INTEGER NOT NULL,
    "creativeScore" INTEGER,
    "trafficScore" INTEGER,
    "landingPageScore" INTEGER,
    "funnelScore" INTEGER,
    "profitabilityScore" INTEGER,
    "stabilityScore" INTEGER,
    "mainDiagnosis" TEXT NOT NULL,
    "decision" "ScaleDecision" NOT NULL,
    "confidenceScore" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "scalingType" "ScalingType" DEFAULT 'NOT_APPLICABLE',
    "actionPlan" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_kpis_auditId_key" ON "campaign_kpis"("auditId");

-- CreateIndex
CREATE UNIQUE INDEX "creative_analyses_auditId_key" ON "creative_analyses"("auditId");

-- CreateIndex
CREATE UNIQUE INDEX "landing_page_analyses_auditId_key" ON "landing_page_analyses"("auditId");

-- CreateIndex
CREATE UNIQUE INDEX "diagnoses_auditId_key" ON "diagnoses"("auditId");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_kpis" ADD CONSTRAINT "campaign_kpis_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_analyses" ADD CONSTRAINT "creative_analyses_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_page_analyses" ADD CONSTRAINT "landing_page_analyses_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
