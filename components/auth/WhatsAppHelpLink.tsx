"use client";

import { MessageCircle } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";

const WHATSAPP_NUMBER = "21623958603";

/** "Need help?" under the sign-up button: someone hesitating on the form
 * can ask a person instead of leaving. Reported to the Meta Pixel as a
 * Contact, like the landing page's WhatsApp links. */
export function WhatsAppHelpLink() {
  const { t } = useLocale();
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t("auth.signup.helpMessage"))}`;
  return (
    <a
      className="g-auth-help"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        const w = window as unknown as { fbq?: (...args: unknown[]) => void };
        w.fbq?.("track", "Contact", { content_name: "signup-help" });
      }}
    >
      <MessageCircle size={16} aria-hidden="true" />
      {t("auth.signup.help")}
    </a>
  );
}
