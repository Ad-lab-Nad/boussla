import { prisma } from "@/lib/prisma";

// No authentication exists yet in this app (no login, no session). Until
// that's built, the Gestion module operates as a single-tenant app scoped to
// one default User, found-or-created by a fixed email. Every Gestion query
// and mutation should go through this helper so swapping it for a real
// `auth()` session lookup later is a one-file change.
const DEFAULT_USER_EMAIL = "nada.abidi@sogeplan.tn";

export async function getCurrentUser() {
  return prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: { email: DEFAULT_USER_EMAIL },
  });
}
