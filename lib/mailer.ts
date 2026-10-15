import nodemailer from "nodemailer";

// Sends from the founder's own mailbox (OVH MX Plan) so replies reach a
// person. Configured on Vercel with SMTP_USER / SMTP_PASSWORD (+ optional
// SMTP_HOST / SMTP_PORT); unset = nothing is sent and callers carry on.

export function mailerConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Plain lines → simple, readable HTML (links made clickable). */
export function linesToHtml(lines: string[], dir: "ltr" | "rtl" = "ltr"): string {
  const linkify = (s: string) => escapeHtml(s).replace(/https:\/\/\S+/g, (url) => `<a href="${url}">${url}</a>`);
  return `<div dir="${dir}" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#16274E">${lines
    .map((l) => (l === "" ? "<br>" : `<p style="margin:0 0 12px">${linkify(l)}</p>`))
    .join("")}</div>`;
}

/** true = handed to the mail server. Never throws. */
export async function sendMail(mail: { to: string; subject: string; text: string; html: string; fromName: string }): Promise<boolean> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!user || !pass) return false;
  const port = Number(process.env.SMTP_PORT) || 465;
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "ssl0.ovh.net",
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  try {
    await transport.sendMail({ from: `"${mail.fromName}" <${user}>`, to: mail.to, subject: mail.subject, text: mail.text, html: mail.html });
    return true;
  } catch (err) {
    console.error("mail not sent:", err);
    return false;
  }
}
