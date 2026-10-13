-- Advance paid by the client when ordering (0 = none).
ALTER TABLE "orders" ADD COLUMN "advanceAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
