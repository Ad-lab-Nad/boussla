// Kept in its own zero-dependency file so lib/supabase/proxy.ts (Edge/Node
// middleware, no Prisma) and lib/admin.ts (Server Components, Prisma-heavy)
// can both check the same address without either pulling in the other's deps.
export const ADMIN_EMAIL = "dna.nada.abidi@gmail.com";
