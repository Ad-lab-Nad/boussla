import type { NextRequest } from "next/server";
import { serveLanding } from "@/lib/landing";

// Public homepage in Arabic (Tunisian derja) — see lib/landing.ts.
export function GET(request: NextRequest) {
  return serveLanding(request, "ar.html", { appLocale: "ar" });
}
