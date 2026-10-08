import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { clip, MAX_DURATION_MS } from "@/lib/analytics/visit";

// Updates a visit while the visitor stays (sendBeacon on tab hide / page
// leave / sign-up click): visible time only ever grows, CTA clicks add up.
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const visit = await prisma.pageVisit.findUnique({
    where: { id },
    select: { durationMs: true },
  });
  if (!visit) return new NextResponse(null, { status: 404 });

  const reported = Math.min(Math.max(Math.round(Number(body.d) || 0), 0), MAX_DURATION_MS);
  const cta = clip(body.cta, 40);

  await prisma.pageVisit.update({
    where: { id },
    data: {
      durationMs: Math.max(visit.durationMs, reported),
      ...(cta ? { ctaClicks: { increment: 1 }, lastCta: cta } : {}),
    },
  });

  return new NextResponse(null, { status: 204 });
}
