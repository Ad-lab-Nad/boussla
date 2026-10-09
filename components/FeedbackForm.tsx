"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { submitFeedback } from "@/lib/feedback-actions";
import type { AuthActionState } from "@/lib/auth-actions";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function FeedbackForm() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    submitFeedback,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        className="g-auth-footer"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          justifyContent: "center",
          width: "100%",
          color: "var(--g-muted)",
        }}
        onClick={() => setOpen(true)}
      >
        <MessageCircle size={14} /> {t("auth.feedback.open")}
      </button>
    );
  }

  return (
    <div className="g-card" style={{ marginTop: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>{t("auth.feedback.title")}</h2>
        <button
          type="button"
          className="g-modal__close"
          onClick={() => setOpen(false)}
          aria-label={t("auth.feedback.close")}
        >
          <X size={16} />
        </button>
      </div>
      <form ref={formRef} action={formAction} className="g-auth-field-stack" style={{ marginTop: 12 }}>
        {state?.error && <div className="g-auth-error">{state.error}</div>}
        {state?.success && <div className="g-auth-success">{state.success}</div>}
        <div className="g-field">
          <label>{t("auth.fields.email")}</label>
          <input type="email" name="email" required autoComplete="email" />
        </div>
        <div className="g-field">
          <label>{t("auth.feedback.message")}</label>
          <textarea name="message" required rows={3} />
        </div>
        <button type="submit" className="g-btn secondary g-auth-submit" disabled={pending}>
          {pending ? t("auth.feedback.sending") : t("auth.feedback.send")}
        </button>
      </form>
    </div>
  );
}
