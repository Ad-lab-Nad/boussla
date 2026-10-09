"use client";

import { useActionState, useState } from "react";
import { signUp, type AuthActionState } from "@/lib/auth-actions";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { TIER_PRICING } from "@/lib/pricing";
import { MetaPixelEvent } from "@/components/MetaPixel";

// Kept as short as possible — most visitors arrive from an ad on their
// phone: email + password (+ confirmation), the tier picker (pre-checked
// from the landing page's ?plan=palier1|palier2) and an optional consent
// box. Sector can be set later in the app. Launch is Produits-only (the
// Services mode is built but hidden), hence the fixed activityType.
export function SignupForm({ plan }: { plan: "palier1" | "palier2" | null }) {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(signUp, null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const mismatch = confirmPassword.length > 0 && confirmPassword !== password;

  return (
    <form action={formAction} className="g-auth-field-stack">
      {state?.error && <div className="g-auth-error">{state.error}</div>}
      {state?.success && <div className="g-auth-success">{state.success}</div>}
      {/* Account created, pending email confirmation. */}
      {state?.success && <MetaPixelEvent event="CompleteRegistration" />}

      <input type="hidden" name="activityType" value="PRODUCTS" />

      <div className="g-field">
        <label htmlFor="signup-email">{t("auth.fields.email")}</label>
        <input id="signup-email" type="email" name="email" required autoComplete="email" inputMode="email" />
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
      <div className="g-field">
        <label htmlFor="signup-confirm-password">{t("auth.fields.confirmPassword")}</label>
        <PasswordInput
          id="signup-confirm-password"
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          aria-invalid={mismatch}
        />
        {mismatch && <span className="g-password-mismatch">{t("auth.fields.mismatch")}</span>}
      </div>

      <div className="g-field">
        <label>{t("auth.signup.planLabel")}</label>
        <div className="g-radio-group">
          {(["palier1", "palier2"] as const).map((value) => (
            <label className="g-radio-option" key={value}>
              <input type="radio" name="plan" value={value} defaultChecked={plan === value} />
              <span>
                <strong>
                  {t("auth.signup.planOption", {
                    plan: t(`auth.plans.${value}`),
                    price: TIER_PRICING[value === "palier1" ? "PALIER_1" : "PALIER_2"].monthly,
                  })}
                </strong>
                <small>{t("auth.signup.planHint")}</small>
              </span>
            </label>
          ))}
          <label className="g-radio-option">
            <input type="radio" name="plan" value="later" defaultChecked={plan === null} />
            <span>
              <strong>{t("auth.signup.later")}</strong>
              <small>{t("auth.signup.laterHint")}</small>
            </span>
          </label>
        </div>
      </div>

      <label className="g-auth-checkbox-row">
        <input type="checkbox" name="marketingConsent" />
        {t("auth.signup.consent")}
      </label>

      <button type="submit" className="g-btn g-auth-submit" disabled={pending || mismatch}>
        {pending ? t("auth.signup.submitting") : t("auth.signup.submit")}
      </button>
    </form>
  );
}
