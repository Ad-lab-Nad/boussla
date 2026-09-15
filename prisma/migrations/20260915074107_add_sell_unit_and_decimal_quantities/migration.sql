-- CreateEnum
CREATE TYPE "SellUnit" AS ENUM ('PIECE', 'KG', 'GRAM', 'LITRE');

-- AlterTable: products get a sellUnit, defaulting existing rows to Pièce
-- (the implicit assumption every product made before this column existed).
ALTER TABLE "products" ADD COLUMN     "sellUnit" "SellUnit" NOT NULL DEFAULT 'PIECE';

-- AlterTable: order_lines get a frozen sellUnitSnapshot (added nullable,
-- backfilled to Pièce for existing rows, then locked NOT NULL — a plain
-- NOT NULL ADD COLUMN would fail against rows already in this table) and
-- quantity becomes fractional.
ALTER TABLE "order_lines" ADD COLUMN     "sellUnitSnapshot" "SellUnit";
UPDATE "order_lines" SET "sellUnitSnapshot" = 'PIECE' WHERE "sellUnitSnapshot" IS NULL;
ALTER TABLE "order_lines" ALTER COLUMN "sellUnitSnapshot" SET NOT NULL;
ALTER TABLE "order_lines" ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable: production batch quantities become fractional too.
ALTER TABLE "production_batches" ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;
