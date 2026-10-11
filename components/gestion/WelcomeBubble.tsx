"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";

const WHATSAPP_NUMBER = "21623958603";
const DISMISSED_KEY = "fx_welcome_bubble_closed";
const SHOW_AFTER_MS = 2500;

/** A small "hi, want help getting started?" bubble for new accounts,
 * a moment after the app opens: yes = WhatsApp with the founder (a real
 * person answers), no = closed for good on this device. */
export function WelcomeBubble({ enabled }: { enabled: boolean }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return;
    } catch {
      // Storage blocked (private mode…): still show it, once per page load.
    }
    const timer = setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [enabled]);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Nothing to remember it with — it just comes back next visit.
    }
  }

  if (!open) return null;
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t("gestion.gettingStarted.helpMessage"))}`;

  return (
    <div className="g-bubble" role="dialog" aria-label={t("gestion.welcomeBubble.title")}>
      <button type="button" className="g-bubble__close" onClick={close} aria-label={t("gestion.welcomeBubble.no")}>
        <X size={16} />
      </button>
      <p className="g-bubble__title">{t("gestion.welcomeBubble.title")}</p>
      <p className="g-bubble__text">{t("gestion.welcomeBubble.text")}</p>
      <div className="g-bubble__actions">
        <a
          className="g-bubble__yes"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            const w = window as unknown as { fbq?: (...args: unknown[]) => void };
            w.fbq?.("track", "Contact", { content_name: "welcome-bubble" });
            close();
          }}
        >
          <MessageCircle size={16} aria-hidden="true" /> {t("gestion.welcomeBubble.yes")}
        </a>
        <button type="button" className="g-bubble__no" onClick={close}>
          {t("gestion.welcomeBubble.no")}
        </button>
      </div>
    </div>
  );
}
