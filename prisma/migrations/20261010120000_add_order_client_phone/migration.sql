-- Client phone on an order, copied to the Clients page once delivered.
ALTER TABLE "orders" ADD COLUMN "clientPhone" TEXT;
