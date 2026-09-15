-- Enables Row Level Security on every table with zero policies attached.
-- This is a default-deny: Supabase's REST API (PostgREST) authenticates as
-- the "anon"/"authenticated" Postgres roles, which have no BYPASSRLS
-- privilege, so once RLS is on and no policy grants them anything, every
-- SELECT/INSERT/UPDATE/DELETE they attempt returns zero rows / permission
-- denied. The app itself is unaffected: Prisma connects as the "postgres"
-- role, which has BYPASSRLS, so it keeps working exactly as before.
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "campaign_kpis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "creative_analyses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "landing_page_analyses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "diagnoses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_purchases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_usages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "production_batches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "feedback" ENABLE ROW LEVEL SECURITY;
