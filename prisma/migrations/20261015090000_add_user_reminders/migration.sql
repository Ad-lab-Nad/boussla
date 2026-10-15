-- Follow-up reminders: contact email for phone accounts, opt-out, and a
-- log of which reminder went to whom.
ALTER TABLE "users" ADD COLUMN "contactEmail" TEXT,
ADD COLUMN "remindersOff" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "user_reminders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_reminders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_reminders_userId_step_key" ON "user_reminders"("userId", "step");

ALTER TABLE "user_reminders" ADD CONSTRAINT "user_reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Same as every other table: no direct access through Supabase's public API.
ALTER TABLE "user_reminders" ENABLE ROW LEVEL SECURITY;
