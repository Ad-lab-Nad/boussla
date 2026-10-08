// Helpers for the anonymous landing-page audience (model PageVisit).

const BOT_UA =
  /bot|crawl|spider|slurp|facebookexternalhit|facebookcatalog|meta-externalagent|preview|headless|lighthouse|pingdom|uptime|curl|wget|python|httpclient/i;

export function isBot(userAgent: string | null): boolean {
  return !userAgent || BOT_UA.test(userAgent);
}

export function deviceOf(userAgent: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(userAgent)) return "tablet";
  if (/mobi|iphone|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

export function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

/**
 * Buckets a visit into a readable source. Paid Meta clicks carry fbclid (or
 * a utm_source naming facebook/instagram with a paid medium); organic ones
 * come through Facebook/Instagram's link shims (l.facebook.com, …).
 */
export function sourceOf(params: {
  referrerHost: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  fbclid: boolean;
  ownHost: string;
}): string {
  const { referrerHost, utmSource, utmMedium, fbclid, ownHost } = params;
  const us = (utmSource ?? "").toLowerCase();
  const paid = /paid|cpc|ads?|sponsored/i.test(utmMedium ?? "");

  if (fbclid || (paid && /facebook|instagram|meta|fb|ig/.test(us))) return "Pub Meta";
  if (us) return utmSource!.slice(0, 40);

  const ref = referrerHost ?? "";
  if (!ref || ref === ownHost.replace(/^www\./, "")) return "Direct";
  if (/instagram\.com$/.test(ref)) return "Instagram";
  if (/facebook\.com$|fb\.com$|messenger\.com$/.test(ref)) return "Facebook";
  if (/google\./.test(ref)) return "Google";
  if (/whatsapp|wa\.me/.test(ref)) return "WhatsApp";
  if (/tiktok\.com$/.test(ref)) return "TikTok";
  if (/linkedin\.com$|lnkd\.in$/.test(ref)) return "LinkedIn";
  return ref.slice(0, 60);
}

export function clip(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v ? v.slice(0, max) : null;
}

/** Visible time is capped so a tab left open overnight can't skew averages. */
export const MAX_DURATION_MS = 30 * 60 * 1000;
