-- Palier 1's expense entry: pro/perso toggle + optional receipt photo.
-- Both additive, defaulted/nullable — no backfill needed.

ALTER TABLE "expenses" ADD COLUMN "isPersonal" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "expenses" ADD COLUMN "receiptPath" TEXT;
