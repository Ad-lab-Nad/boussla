import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — server-only, bypasses storage RLS the same
 * way Prisma's `postgres` role bypasses table RLS (see lib/prisma.ts and the
 * "enable RLS, zero policies" migrations). Never import this from a Client
 * Component, and never let SUPABASE_SERVICE_ROLE_KEY leak into a
 * NEXT_PUBLIC_-prefixed variable.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
