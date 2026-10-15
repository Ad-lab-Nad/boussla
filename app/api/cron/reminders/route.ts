import { NextResponse, type NextRequest } from "next/server";
import { dueReminders, markReminderSent, reminderEmail } from "@/lib/reminders";
import { linesToHtml, mailerConfigured, sendMail } from "@/lib/mailer";

// Daily at 10:00 Tunis (vercel.json "crons"). Vercel calls it with
// "Authorization: Bearer $CRON_SECRET"; anyone else gets a 401.
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  // Without a mailbox nothing is sent — and nothing is marked as sent, so
  // these reminders go out once SMTP is configured.
  if (!mailerConfigured()) return NextResponse.json({ sent: 0, reason: "smtp not configured" });

  const due = (await dueReminders()).filter((r) => r.email);
  let sent = 0;
  for (const r of due) {
    const mail = reminderEmail(r.step, r.locale, r.userId);
    const ok = await sendMail({
      to: r.email!,
      subject: mail.subject,
      text: mail.blocks.map((b) => b.lines.join("\n\n")).join("\n\n— — —\n\n"),
      html: mail.blocks.map((b) => linesToHtml(b.lines, b.dir)).join('<hr style="border:none;border-top:1px solid #ddd;margin:24px 0">'),
      fromName: "Nada — Flux",
    });
    if (ok) {
      await markReminderSent(r.userId, r.step, "email");
      sent++;
    }
  }
  return NextResponse.json({ due: due.length, sent });
}
