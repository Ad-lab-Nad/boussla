"use client";

import { MessageCircle } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { waLink, waNumber } from "@/lib/whatsapp";

/** "Rappel WhatsApp" next to money a client still owes: opens the
 * merchant's WhatsApp with a polite reminder ready to send. The message
 * is signed "envoyé avec Flux" — every reminder is also word of mouth. */
export function WhatsAppReminder({ phone, name, amount }: { phone: string | null; name: string | null; amount: string }) {
  const { t } = useLocale();
  const number = waNumber(phone);
  const label = t("gestion.reminder.button");
  if (!number) {
    return (
      <span className="g-wa-btn is-off" title={t("gestion.reminder.noPhone")}>
        <MessageCircle size={14} aria-hidden="true" /> {label}
      </span>
    );
  }
  const text = t("gestion.reminder.message", { name: name?.trim() ? ` ${name.trim()}` : "", amount });
  return (
    <a className="g-wa-btn" href={waLink(number, text)} target="_blank" rel="noopener noreferrer">
      <MessageCircle size={14} aria-hidden="true" /> {label}
    </a>
  );
}
