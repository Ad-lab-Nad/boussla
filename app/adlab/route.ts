import type { NextRequest } from "next/server";
import { serveLanding } from "@/lib/landing";

// Flux Ad Lab — the Meta ads media-buying service (landing/adlab.html),
// with the same visit beacon and Meta Pixel as the Flux landings.
export function GET(request: NextRequest) {
  return serveLanding(request, "adlab.html", { stayForSignedIn: true });
}
