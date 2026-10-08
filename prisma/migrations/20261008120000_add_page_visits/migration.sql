-- Anonymous landing-page audience (see model PageVisit). Additive only.
CREATE TABLE "page_visits" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "referrerHost" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "device" TEXT NOT NULL,
    "country" TEXT,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "ctaClicks" INTEGER NOT NULL DEFAULT 0,
    "lastCta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_visits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "page_visits_createdAt_idx" ON "page_visits"("createdAt");
CREATE INDEX "page_visits_visitorId_idx" ON "page_visits"("visitorId");

-- Same default-deny as every other table (see the enable_row_level_security
-- migration): Supabase's public REST API can't read or write it; Prisma's
-- postgres role bypasses RLS.
ALTER TABLE "page_visits" ENABLE ROW LEVEL SECURITY;
