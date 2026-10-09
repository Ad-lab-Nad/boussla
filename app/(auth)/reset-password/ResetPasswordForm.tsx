"use client";

import { useActionState } from "react";
import { updatePassword, type AuthActionState } from "@/lib/auth-actions";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function ResetPasswordForm() {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    updatePassword,
    null
  );

  return (
    <form action={formAction} className="g-auth-field-stack">
      {state?.error && <div className="g-auth-error">{state.error}</div>}
      <div className="g-field">
        <label htmlFor="reset-password">{t("auth.reset.newPassword")}</label>
        <PasswordInput id="reset-password" name="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div className="g-field">
        <label htmlFor="reset-confirm-password">{t("auth.fields.confirmPassword")}</label>
        <PasswordInput
          id="reset-confirm-password"
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <button type="submit" className="g-btn g-auth-submit" disabled={pending}>
        {pending ? t("auth.reset.submitting") : t("auth.reset.submit")}
      </button>
    </form>
  );
}
