"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitFeedback } from "@/lib/feedback-actions";
import type { AuthActionState } from "@/lib/auth-actions";

const SUBJECTS = [
  "Question sur Flux",
  "Problème technique",
  "Abonnement et paiement",
  "Partenariat",
  "Autre",
];

/** Contact page form — same storage as the login page's feedback form (the
 * Feedback table, listed in /admin); the chosen subject is prefixed to the
 * message so no schema change is needed. */
export function ContactForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(submitFeedback, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={(fd) => {
        const subject = String(fd.get("subject") || "");
        const message = String(fd.get("body") || "").trim();
        fd.set("message", message ? `[${subject}] ${message}` : "");
        return formAction(fd);
      }}
      className="g-auth-field-stack"
    >
      {state?.error && <div className="g-auth-error">{state.error}</div>}
      {state?.success && <div className="g-auth-success">{state.success}</div>}
      <div className="g-field">
        <label htmlFor="contact-email">Ton email</label>
        <input id="contact-email" type="email" name="email" required autoComplete="email" />
      </div>
      <div className="g-field">
        <label htmlFor="contact-subject">Sujet</label>
        <select id="contact-subject" name="subject" defaultValue={SUBJECTS[0]}>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="g-field">
        <label htmlFor="contact-body">Message</label>
        <textarea id="contact-body" name="body" required rows={6} />
      </div>
      <button type="submit" className="g-btn g-auth-submit" disabled={pending}>
        {pending ? "Envoi..." : "Envoyer le message"}
      </button>
    </form>
  );
}
