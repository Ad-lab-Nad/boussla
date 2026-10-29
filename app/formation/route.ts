import type { NextRequest } from "next/server";
import { serveLanding } from "@/lib/landing";

// The Meta Ads training (landing/formation.html): one-to-one, group or
// consultation, booked on WhatsApp — same visit beacon and Meta Pixel.
export function GET(request: NextRequest) {
  return serveLanding(request, "formation.html", { stayForSignedIn: true });
}
