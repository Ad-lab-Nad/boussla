import { linesToHtml, mailerConfigured, sendMail } from "@/lib/mailer";
import type { Locale } from "@/lib/i18n/config";
import { SITE } from "@/lib/site-config";

// Sent once, right after sign-up, from the founder's own mailbox — see
// lib/mailer.ts. Unconfigured = nothing is sent; sign-up never depends on it.

const WHATSAPP = "https://wa.me/21623958603";
const APP_URL = `${SITE.url}/gestion`;

const MESSAGES: Record<Locale, { subject: string; lines: string[]; signature: string }> = {
  fr: {
    subject: "Bienvenue sur Flux 👋",
    lines: [
      "Bonjour,",
      "Bienvenue sur Flux ! Je suis Nada, la fondatrice.",
      "Ton mois gratuit commence aujourd'hui : tu as accès à tout.",
      "Pour bien démarrer, ajoute 2 ou 3 produits, puis ta première vente : Flux calcule tout seul ton vrai bénéfice.",
      `Si tu veux, je t'aide à le faire en 10 minutes sur WhatsApp : ${WHATSAPP}`,
      "Ou réponds simplement à cet e-mail.",
      "Belle réussite à ton projet !",
    ],
    signature: "Nada — Flux",
  },
  ar: {
    subject: "مرحبا بيك في Flux 👋",
    lines: [
      "عسلامة،",
      "مرحبا بيك في Flux! أنا ندى، اللي عملت التطبيق.",
      "الشهر المجاني متاعك يبدا اليوم: عندك كل شي.",
      "باش تبدا مليح، زيد 2 ولا 3 منتجات، وبعد أوّل بيعة: Flux يحسبلك الربح الحقيقي وحدو.",
      `إذا تحب، نعاونك تعملها في 10 دقايق على واتساب: ${WHATSAPP}`,
      "ولا جاوبني على هالإيميل.",
      "بالتوفيق في مشروعك!",
    ],
    signature: "ندى — Flux",
  },
  en: {
    subject: "Welcome to Flux 👋",
    lines: [
      "Hello,",
      "Welcome to Flux! I'm Nada, the founder.",
      "Your free month starts today: you have access to everything.",
      "To get started, add 2 or 3 products, then your first sale: Flux works out your real profit on its own.",
      `If you like, I'll help you do it in 10 minutes on WhatsApp: ${WHATSAPP}`,
      "Or just reply to this email.",
      "Good luck with your business!",
    ],
    signature: "Nada — Flux",
  },
};

export async function sendWelcomeEmail(to: string, locale: Locale): Promise<void> {
  if (!mailerConfigured()) return;
  const m = MESSAGES[locale] ?? MESSAGES.fr;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const lines = [...m.lines, "", m.signature, APP_URL];
  await sendMail({ to, subject: m.subject, text: lines.join("\n\n"), html: linesToHtml(lines, dir), fromName: m.signature });
}
