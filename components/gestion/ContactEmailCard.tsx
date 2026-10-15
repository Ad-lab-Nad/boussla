"use client";

import { useEffect, useState, useTransition } from "react";
import { Mail, X } from "lucide-react";
import { setContactEmail } from "@/lib/gestion/actions";
import { useLocale } from "@/components/i18n/LocaleProvider";

const DISMISSED_KEY = "fx_contact_email_later";

/** For accounts created with a phone number: an optional email, so the
 * follow-up tips reach them too. "Plus tard" hides it on this device. */
export function ContactEmailCard() {
  const { t } = useLocale();
  const [hidden, setHidden] = useState(false);
  // Read after mount, so the server and first client render agree.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        if (localStorage.getItem(DISMISSED_KEY) === "1") setHidden(true);
      } catch {
        // No storage: keep showing it.
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();
  if (hidden) return null;

  function later() {
    setHidden(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Not remembered — shown again next visit.
    }
  }

  return (
    <div className="g-card g-install">
      <span className="g-install__icon" aria-hidden="true">
        <Mail size={22} />
      </span>
      <div className="g-install__body">
        <h2>{t("gestion.contactEmail.title")}</h2>
        <p>{t("gestion.contactEmail.text")}</p>
        <form
          className="g-contact-email"
          action={(formData) =>
            startTransition(async () => {
              const { ok } = await setContactEmail(formData);
              setError(!ok);
            })
          }
        >
          <input type="email" name="contactEmail" required placeholder={t("gestion.contactEmail.placeholder")} autoComplete="email" />
          <button type="submit" className="g-btn" disabled={pending}>
            {t("gestion.contactEmail.save")}
          </button>
        </form>
        {error && <p style={{ color: "var(--g-critical)" }}>{t("gestion.contactEmail.invalid")}</p>}
      </div>
      <button type="button" className="g-install__close" onClick={later} aria-label={t("gestion.contactEmail.later")}>
        <X size={16} />
      </button>
    </div>
  );
}
