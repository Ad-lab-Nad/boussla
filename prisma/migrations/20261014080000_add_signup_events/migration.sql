-- Anonymous sign-up funnel steps (where people stop on the form).
CREATE TABLE "signup_events" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signup_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "signup_events_createdAt_idx" ON "signup_events"("createdAt");

-- Same as every other table: no direct access through Supabase's public API.
ALTER TABLE "signup_events" ENABLE ROW LEVEL SECURITY;
