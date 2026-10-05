// Server-side Supabase config, read from the environment at request time.
//
// A literal `process.env.NEXT_PUBLIC_…` is replaced by its value at BUILD
// time — so a deployment built before the variables existed (or restored
// from a stale build cache) ships `undefined` baked in, and every request
// fails with "Invalid supabaseUrl" even once the variables are set. Reading
// through a computed key isn't inlined, so server code (proxy, Server
// Components, actions) always sees the runtime value. Browser code would
// still need the inlined form, but nothing client-side creates a Supabase
// client today (lib/supabase/client.ts is unused).
function runtimeEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

export function supabaseUrl(): string {
  return runtimeEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function supabasePublishableKey(): string {
  return runtimeEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
}

export function supabaseServiceRoleKey(): string {
  return runtimeEnv("SUPABASE_SERVICE_ROLE_KEY");
}
