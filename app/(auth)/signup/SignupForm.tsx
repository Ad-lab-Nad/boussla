"use client";

import { useActionState, useRef, useState } from "react";
import { signUp, type AuthActionState } from "@/lib/auth-actions";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { MetaPixelEvent } from "@/components/MetaPixel";
import { WhatsAppHelpLink } from "@/components/auth/WhatsAppHelpLink";

// As short as possible — most visitors arrive from an ad on their phone,
// and a longer form lost them: just phone-or-email + password (the eye toggle
// replaces a confirmation field) and an optional consent box. The tier
// picked on the landing page (?plan=) is still recorded; otherwise it's
// chosen later on the Abonnement page. Launch is Produits-only (the
// Services mode is built but hidden), hence the fixed activityType.
/** Anonymous step of the form, for /admin/visites ("où ça bloque"). */
function track(event: "started" | "submitted" | "client_invalid", detail?: string) {
  const body = JSON.stringify({ event, detail });
  try {
    if (!navigator.sendBeacon?.("/api/signup-event", body)) {
      void fetch("/api/signup-event", { method: "POST", body, keepalive: true });
    }
  } catch {
    // Measuring must never get in the way of signing up.
  }
}

/** Which built-in check stopped the field, e.g. "tooShort" (never the value). */
function invalidReason(el: HTMLInputElement): string {
  const v = el.validity;
  if (v.valueMissing) return "valueMissing";
  if (v.tooShort) return "tooShort";
  if (v.typeMismatch) return "typeMismatch";
  if (v.patternMismatch) return "patternMismatch";
  return "other";
}

export function SignupForm({ plan }: { plan: "palier1" | "palier2" | null }) {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(signUp, null);
  // Controlled, so an error doesn't wipe what was typed (a form action
  // resets uncontrolled fields).
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const started = useRef(false);
  // One report per field and reason per visit — the browser fires
  // `invalid` for every bad field each time the button is pressed.
  const reported = useRef(new Set<string>());
  function markStarted() {
    if (started.current) return;
    started.current = true;
    track("started");
  }

  return (
    <form
      action={formAction}
      className="g-auth-field-stack"
      onFocusCapture={markStarted}
      onInputCapture={markStarted}
      onSubmit={() => {
        reported.current.clear();
        track("submitted");
      }}
      onInvalidCapture={(e) => {
        const el = e.target as HTMLInputElement;
        const detail = `${el.name}:${invalidReason(el)}`;
        if (reported.current.has(detail)) return;
        reported.current.add(detail);
        track("client_invalid", detail);
      }}
    >
      {state?.error && <div className="g-auth-error">{state.error}</div>}
      {state?.success && <div className="g-auth-success">{state.success}</div>}
      {/* Account created, pending email confirmation. */}
      {state?.success && <MetaPixelEvent event="CompleteRegistration" />}

      <input type="hidden" name="activityType" value="PRODUCTS" />
      {plan && <input type="hidden" name="plan" value={plan} />}

      <div className="g-field">
<label htmlFor="signup-identifier">{t("auth.fields.identifier")}</label>
        <input
          id="signup-identifier"
          type="text"
          name="identifier"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <span className="g-field-hint">{t("auth.fields.identifierHint")}</span>
      </div>
      <div className="g-field">
        <label htmlFor="signup-password">{t("auth.fields.password")}</label>
        <PasswordInput
          id="signup-password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span className="g-field-hint">{t("auth.fields.passwordHint")}</span>
      </div>

      <button type="submit" className="g-btn g-auth-submit" disabled={pending}>
        {pending ? t("auth.signup.submitting") : t("auth.signup.submit")}
      </button>

      <label className="g-auth-checkbox-row">
        <input type="checkbox" name="marketingConsent" />
        {t("auth.signup.consent")}
      </label>

      <WhatsAppHelpLink />
    </form>
  );
}
