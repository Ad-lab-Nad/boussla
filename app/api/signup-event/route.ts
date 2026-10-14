import { NextResponse, type NextRequest } from "next/server";
import { isBot, clip } from "@/lib/analytics/visit";
import { recordSignupEvent } from "@/lib/signup-events";

// Browser-side steps of the sign-up form (started typing, pressed the
// button, blocked by the browser's own field check). Public, anonymous,
// and limited to these three events.
const CLIENT_EVENTS = new Set(["started", "submitted", "client_invalid"]);

export async function POST(request: NextRequest) {
  if (isBot(request.headers.get("user-agent"))) return new NextResponse(null, { status: 204 });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const event = typeof body.event === "string" ? body.event : "";
  if (!CLIENT_EVENTS.has(event)) return new NextResponse(null, { status: 400 });
  const detail = clip(body.detail, 60)?.replace(/[^a-zA-Z:_]/g, "") || null;
  await recordSignupEvent(event as "started" | "submitted" | "client_invalid", detail);
  return new NextResponse(null, { status: 204 });
}
