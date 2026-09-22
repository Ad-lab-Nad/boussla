import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * The signed-in user's own business-data row (never another user's).
 * Redirects to /login if there's no session — middleware already guards
 * /gestion/*, this is the defense-in-depth check for Server Actions invoked
 * directly.
 *
 * Wrapped in React's cache() so a page that needs both this (email,
 * activityType) and getCurrentBusiness() (which also calls this internally)
 * only checks the session once per request instead of twice.
 */
export const getCurrentUser = cache(async function getCurrentUser() {
  // Local dev-only escape hatch: set DEV_BYPASS_AUTH_EMAIL in your own .env
  // (never committed, never active outside `next dev`) to skip Supabase
  // Auth entirely and work as that user. Remove it to test the real flow.
  if (process.env.NODE_ENV !== "production" && process.env.DEV_BYPASS_AUTH_EMAIL) {
    const email = process.env.DEV_BYPASS_AUTH_EMAIL;
    return prisma.user.upsert({ where: { email }, update: {}, create: { email } });
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect("/login");

  const user = await prisma.user.findUnique({ where: { authUserId: claims.sub } });
  if (user) return user;

  // Defensive fallback: signup already claims-or-creates the row keyed by
  // authUserId (see lib/auth-actions.ts). Getting here means that link is
  // somehow missing — repair it by email rather than failing outright.
  const email = claims.email as string | undefined;
  if (!email) redirect("/login");
  return prisma.user.upsert({
    where: { email },
    update: { authUserId: claims.sub },
    create: { email, authUserId: claims.sub },
  });
});
