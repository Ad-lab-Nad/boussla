import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { ADMIN_EMAIL } from "@/lib/admin-email";
import { isPhoneAccount, accountPhone } from "@/lib/auth-identifier";
import { SITE } from "@/lib/site-config";

// Follow-up reminders after sign-up — the app can't bring people back by
// itself. Email accounts (or phone accounts that added an email) get them
// from the daily job (app/api/cron/reminders); the others show up in the
// back office for the founder to send on WhatsApp in one tap.
//
// One reminder per step (D1, D3, D7), the current step only, and none once
// the user has recorded a sale or opened the app in the last day.

export type ReminderStep = "D1" | "D3" | "D7";
const DAY = 24 * 60 * 60 * 1000;
const APP_URL = `${SITE.url}/gestion`;
const WHATSAPP = "https://wa.me/21623958603";

/** Which reminder is due for an account created at `createdAt`, if any. */
export function currentStep(createdAt: Date, now: Date): ReminderStep | null {
  const age = Math.floor((now.getTime() - createdAt.getTime()) / DAY);
  if (age >= 1 && age < 3) return "D1";
  if (age >= 3 && age < 7) return "D3";
  if (age >= 7 && age < 14) return "D7";
  return null;
}

export type DueReminder = {
  userId: string;
  step: ReminderStep;
  createdAt: Date;
  locale: string | null;
  /** Where the email goes; null = phone account without an email (WhatsApp). */
  email: string | null;
  phone: string | null;
  products: number;
};

export async function dueReminders(now: Date = new Date()): Promise<DueReminder[]> {
  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: new Date(now.getTime() - 14 * DAY), lte: new Date(now.getTime() - DAY) },
      remindersOff: false,
      email: { not: ADMIN_EMAIL },
    },
    include: { reminders: { select: { step: true } }, businessMemberships: { select: { businessId: true } } },
  });
  const due: DueReminder[] = [];
  for (const u of users) {
    const step = currentStep(u.createdAt, now);
    if (!step || u.reminders.some((r) => r.step === step)) continue;
    // Using it already: no nudge needed.
    if (u.lastSeenAt && now.getTime() - u.lastSeenAt.getTime() < DAY) continue;
    const businessIds = u.businessMemberships.map((m) => m.businessId);
    const [orders, products] = await Promise.all([
      prisma.order.count({ where: { businessId: { in: businessIds } } }),
      prisma.product.count({ where: { businessId: { in: businessIds } } }),
    ]);
    if (orders > 0) continue;
    const phoneAccount = isPhoneAccount(u.email);
    due.push({
      userId: u.id,
      step,
      createdAt: u.createdAt,
      locale: u.locale,
      email: phoneAccount ? u.contactEmail : u.email,
      phone: phoneAccount ? accountPhone(u.email) : null,
      products,
    });
  }
  return due;
}

export async function markReminderSent(userId: string, step: ReminderStep, channel: "email" | "whatsapp") {
  await prisma.userReminder.upsert({
    where: { userId_step: { userId, step } },
    update: {},
    create: { userId, step, channel },
  });
}

// ---------- "Ne plus recevoir ces rappels" ----------

function signature(userId: string): string {
  return createHmac("sha256", process.env.CRON_SECRET ?? "").update(`stop:${userId}`).digest("hex").slice(0, 32);
}

export function stopUrl(userId: string): string {
  return `${SITE.url}/rappels/stop?u=${encodeURIComponent(userId)}&t=${signature(userId)}`;
}

export function verifyStop(userId: string, token: string): boolean {
  if (!process.env.CRON_SECRET) return false;
  const a = Buffer.from(signature(userId));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

// ---------- Messages ----------

type Mail = { subject: string; lines: string[] };

const EMAILS: Record<ReminderStep, { fr: Mail; ar: Mail }> = {
  D1: {
    fr: {
      subject: "Ta première vente en 30 secondes ⏱️",
      lines: [
        "Bonjour 👋",
        "C'est Nada, de Flux. Merci d'avoir créé ton compte !",
        "Le plus utile maintenant : enregistrer une vente. Ouvre Flux, touche le bouton bleu « + Vente rapide », choisis ton produit… c'est fait. Flux calcule ton bénéfice tout seul.",
        `Ouvrir Flux : ${APP_URL}`,
        `Besoin d'aide ? Écris-moi sur WhatsApp : ${WHATSAPP}`,
      ],
    },
    ar: {
      subject: "أول عملية بيع في 30 ثانية ⏱️",
      lines: [
        "مرحبًا 👋",
        "أنا ندى من Flux. شكرًا لأنك أنشأت حسابك!",
        "أهم خطوة الآن: تسجيل عملية بيع. افتح Flux، واضغط على الزر الأزرق «بيع سريع»، واختر منتجك… وانتهى الأمر. يحسب Flux ربحك تلقائيًا.",
        `افتح Flux: ${APP_URL}`,
        `تحتاج مساعدة؟ راسلني على واتساب: ${WHATSAPP}`,
      ],
    },
  },
  D3: {
    fr: {
      subject: "Ce que Flux te montrera à la fin du mois 📊",
      lines: [
        "Bonjour 👋",
        "C'est Nada, de Flux.",
        "Avec quelques ventes et dépenses enregistrées, Flux te montre :",
        "• ton vrai bénéfice, une fois les coûts et les dépenses déduits ;",
        "• qui te doit encore de l'argent, avec un rappel WhatsApp en un toucher ;",
        "• les produits qui te rapportent le plus.",
        `2 minutes par jour suffisent. Ouvrir Flux : ${APP_URL}`,
      ],
    },
    ar: {
      subject: "ما سيُظهره لك Flux في نهاية الشهر 📊",
      lines: [
        "مرحبًا 👋",
        "أنا ندى من Flux.",
        "بتسجيل بعض المبيعات والمصاريف، يُظهر لك Flux:",
        "• ربحك الحقيقي بعد خصم التكاليف والمصاريف؛",
        "• من ما زال مدينًا لك، مع تذكير على واتساب بلمسة واحدة؛",
        "• المنتجات التي تربحك أكثر.",
        `دقيقتان في اليوم تكفيان. افتح Flux: ${APP_URL}`,
      ],
    },
  },
  D7: {
    fr: {
      subject: "Je peux t'aider ? 🙂",
      lines: [
        "Bonjour 👋",
        "C'est Nada, de Flux. Ça fait une semaine que tu t'es inscrit(e).",
        "Si quelque chose t'a bloqué ou ne t'a pas plu, réponds simplement à cet e-mail : je lis chaque message.",
        `Ou prenons 10 minutes ensemble sur WhatsApp pour démarrer : ${WHATSAPP}`,
      ],
    },
    ar: {
      subject: "هل يمكنني مساعدتك؟ 🙂",
      lines: [
        "مرحبًا 👋",
        "أنا ندى من Flux. مرّ أسبوع على تسجيلك.",
        "إذا واجهتك صعوبة أو لم يعجبك شيء، فقط ردّ على هذا البريد: أقرأ كل رسالة.",
        `أو لنأخذ 10 دقائق معًا على واتساب للبدء: ${WHATSAPP}`,
      ],
    },
  },
};

/** The email for a step. Unknown language (most accounts before
 * 14 Oct 2026) = Arabic first, then French — the ads are in Arabic. */
export function reminderEmail(step: ReminderStep, locale: string | null, userId: string) {
  const { fr, ar } = EMAILS[step];
  const stop = stopUrl(userId);
  const stopFr = `Tu ne veux plus recevoir ces rappels ? ${stop}`;
  const stopAr = `لا تريد تلقي هذه التذكيرات؟ ${stop}`;
  if (locale === "ar") return { subject: ar.subject, blocks: [{ dir: "rtl" as const, lines: [...ar.lines, "ندى — Flux", "", stopAr] }] };
  if (locale === "fr" || locale === "en") {
    return { subject: fr.subject, blocks: [{ dir: "ltr" as const, lines: [...fr.lines, "Nada — Flux", "", stopFr] }] };
  }
  return {
    subject: `${ar.subject} · ${fr.subject}`,
    blocks: [
      { dir: "rtl" as const, lines: [...ar.lines, "ندى — Flux"] },
      { dir: "ltr" as const, lines: [...fr.lines, "Nada — Flux", "", stopFr, stopAr] },
    ],
  };
}

/** Short WhatsApp messages the founder sends herself, in her own voice. */
export const WHATSAPP_REMINDERS: Record<ReminderStep, string> = {
  D1: "عسلامة 👋 أنا ندى من Flux. يعيشك على التسجيل 🙏 باش تبدا، اضغط على «بيع سريع» وسجّل أوّل بيعة، وFlux يحسبلك الربح وحدو. تحب نعاونك في 5 دقايق؟",
  D3: "عسلامة 👋 ندى من Flux. كيفاش لقيت التطبيق؟ بشوية بيعات ومصاريف، Flux يوريك الربح الحقيقي متاعك وشكون مازال يتسالك فلوس. إذا عندك أي سؤال، أنا هوني 🙂",
  D7: "عسلامة 👋 ندى من Flux. فات أسبوع على التسجيل متاعك. إذا فما حاجة صعيبة ولا ما عجبتكش، قلّي بكلّ صراحة، يهمّني رايك برشا 🙏",
};
