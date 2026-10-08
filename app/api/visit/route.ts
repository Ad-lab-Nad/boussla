import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { clip, deviceOf, hostOf, isBot, sourceOf } from "@/lib/analytics/visit";

// Records one landing-page view (beacon from the script app/route.ts injects).
// Public and unauthenticated by design; inputs are length-clipped, bots
// are dropped, and nothing identifying (IP, name, email) is stored.
export async function POST(request: NextRequest) {
  const ua = request.headers.get("user-agent");
  if (isBot(ua)) return new NextResponse(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const visitorId = clip(body.vid, 64);
  if (!visitorId) return new NextResponse(null, { status: 400 });

  const referrerHost = hostOf(clip(body.ref, 500));
  const utmSource = clip(body.us, 80);
  const utmMedium = clip(body.um, 80);
  const utmCampaign = clip(body.uc, 120);

  const visit = await prisma.pageVisit.create({
    data: {
      visitorId,
      path: clip(body.path, 200) ?? "/",
      source: sourceOf({
        referrerHost,
        utmSource,
        utmMedium,
        fbclid: body.fb === true,
        ownHost: request.nextUrl.hostname,
      }),
      referrerHost,
      utmSource,
      utmMedium,
      utmCampaign,
      device: deviceOf(ua ?? ""),
      country: clip(request.headers.get("x-vercel-ip-country"), 4),
    },
    select: { id: true },
  });

  return NextResponse.json({ id: visit.id });
}
