"use client";

import { useActionState, useState } from "react";
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
export function SignupForm({ plan }: { plan: "palier1" | "palier2" | null }) {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(signUp, null);
  // Controlled, so an error doesn't wipe what was typed (a form action
  // resets uncontrolled fields).
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form action={formAction} className="g-auth-field-stack">
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
