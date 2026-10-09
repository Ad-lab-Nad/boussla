"use client";

import { useActionState } from "react";
import { requestPasswordReset, type AuthActionState } from "@/lib/auth-actions";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function ForgotPasswordForm() {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    requestPasswordReset,
    null
  );

  return (
    <form action={formAction} className="g-auth-field-stack">
      {state?.error && <div className="g-auth-error">{state.error}</div>}
      {state?.success && <div className="g-auth-success">{state.success}</div>}
      <div className="g-field">
        <label htmlFor="forgot-email">{t("auth.fields.email")}</label>
        <input id="forgot-email" type="email" name="email" required autoComplete="email" inputMode="email" />
      </div>
      <button type="submit" className="g-btn g-auth-submit" disabled={pending}>
        {pending ? t("auth.forgot.submitting") : t("auth.forgot.submit")}
      </button>
    </form>
  );
}
