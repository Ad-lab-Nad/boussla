import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// The public homepage is a hand-built static page (landing/index.html),
// served byte-for-byte — no React layout, fonts or CSS from the app wrap it.
// Its sign-up buttons point at /signup (?plan=palier1|palier2 for the
// pricing cards); its demo form keeps opening WhatsApp on its own.
// The file is bundled into the server trace via next.config.ts.
const LANDING_FILE = path.join(process.cwd(), "landing", "index.html");

let cachedHtml: string | null = null;

export async function GET(request: NextRequest) {
  // Signed-in visitors go straight to their dashboard, as before — except
  // the admin's "Aperçu" link (?preview=1), which wants the public page.
  if (request.nextUrl.searchParams.get("preview") !== "1") {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (data?.claims) return NextResponse.redirect(new URL("/gestion", request.url));
  }

  // Re-read on every request in dev so edits to the file show up live.
  if (cachedHtml === null || process.env.NODE_ENV !== "production") {
    cachedHtml = await readFile(LANDING_FILE, "utf8");
  }

  return new NextResponse(cachedHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
