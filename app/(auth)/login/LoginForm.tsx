"use client";

import { useActionState } from "react";
import { signIn, type AuthActionState } from "@/lib/auth-actions";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function LoginForm({ next }: { next: string }) {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(signIn, null);

  return (
    <form action={formAction} className="g-auth-field-stack">
      <input type="hidden" name="next" value={next} />
      {state?.error && <div className="g-auth-error">{state.error}</div>}
      <div className="g-field">
        <label htmlFor="login-email">{t("auth.fields.email")}</label>
        <input id="login-email" type="email" name="email" required autoComplete="email" inputMode="email" />
      </div>
      <div className="g-field">
        <label htmlFor="login-password">{t("auth.fields.password")}</label>
        <PasswordInput id="login-password" name="password" required autoComplete="current-password" />
      </div>
      <button type="submit" className="g-btn g-auth-submit" disabled={pending}>
        {pending ? t("auth.login.submitting") : t("auth.login.submit")}
      </button>
    </form>
  );
}
