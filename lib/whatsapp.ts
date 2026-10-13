// WhatsApp click-to-chat links (wa.me) — free, no API, the merchant's own
// WhatsApp opens with the message ready to send.

/** "20 123 456", "+216 20123456", "0021620123456" → "21620123456"; null if
 * there's no usable number. Bare 8-digit numbers are Tunisian. */
export function waNumber(raw: string | null | undefined): string | null {
  let digits = (raw ?? "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 8) digits = "216" + digits;
  return digits.length >= 10 ? digits : null;
}

export function waLink(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
