import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyStop } from "@/lib/reminders";

// The "ne plus recevoir ces rappels" link at the bottom of every reminder
// email. Signed per user (lib/reminders.ts), works without signing in.
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("u") ?? "";
  const token = request.nextUrl.searchParams.get("t") ?? "";
  const ok = userId && verifyStop(userId, token);
  if (ok) await prisma.user.updateMany({ where: { id: userId }, data: { remindersOff: true } });
  const message = ok
    ? ["C'est noté : tu ne recevras plus ces rappels.", "تمّ: لن تصلك هذه التذكيرات بعد الآن."]
    : ["Ce lien n'est pas valide.", "هذا الرابط غير صالح."];
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Flux</title></head>
<body style="font-family:Arial,sans-serif;background:#F5F6F9;color:#16213C;margin:0;padding:40px 20px;text-align:center">
<p style="font-size:18px;font-weight:bold">${message[0]}</p><p dir="rtl" style="font-size:17px">${message[1]}</p>
<p><a href="/" style="color:#16274E">fluxtunisie.com</a></p></body></html>`;
  return new NextResponse(html, { status: ok ? 200 : 400, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
