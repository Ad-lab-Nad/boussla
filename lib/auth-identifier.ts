// Sign-up / login accept a phone number instead of an email: many small
// merchants live on WhatsApp, not email. Supabase Auth still needs an
// email, so a phone becomes a placeholder address on a domain that never
// receives mail — no SMS is sent and the number isn't verified (password
// resets for these accounts go through the founder on WhatsApp).

export const PHONE_EMAIL_DOMAIN = "tel.fluxtunisie.com";

export type Identifier = { kind: "email" | "phone"; email: string };

/** "20 123 456", "+216 20123456", "0021620123456" → "21620123456". */
function tunisianPhoneDigits(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 8) digits = "216" + digits;
  return /^216[2-9]\d{7}$/.test(digits) ? digits : null;
}

/** null = neither a valid email nor a Tunisian mobile/landline number. */
export function parseIdentifier(raw: string): Identifier | null {
  const value = raw.trim().toLowerCase();
  if (!value) return null;
  if (value.includes("@")) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? { kind: "email", email: value } : null;
  }
  const digits = tunisianPhoneDigits(value);
  return digits ? { kind: "phone", email: `${digits}@${PHONE_EMAIL_DOMAIN}` } : null;
}

export function isPhoneAccount(email: string): boolean {
  return email.endsWith(`@${PHONE_EMAIL_DOMAIN}`);
}

/** The phone number of a phone account, as "+216 20 123 456"; null otherwise. */
export function accountPhone(email: string): string | null {
  if (!isPhoneAccount(email)) return null;
  const d = email.split("@")[0];
  return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
}

/** What to show for an account: its phone number, or its email. */
export function displayAccount(email: string): string {
  return accountPhone(email) ?? email;
}

/** wa.me link for a phone account; null for email accounts. */
export function accountWhatsAppLink(email: string): string | null {
  return isPhoneAccount(email) ? `https://wa.me/${email.split("@")[0]}` : null;
}
