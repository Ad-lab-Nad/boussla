-- Supabase flagged rls_disabled_in_public: Prisma's own migration log was
-- the one public table without Row Level Security, so anyone holding the
-- public API key could read or rewrite it. No policy = no access through
-- the API; Prisma connects as the table's owner, which RLS doesn't apply to.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
