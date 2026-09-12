"use client";

import { useActionState } from "react";
import { requestPasswordReset, type AuthActionState } from "@/lib/auth-actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    requestPasswordReset,
    null
  );

  return (
    <form action={formAction} className="g-auth-field-stack">
      {state?.error && <div className="g-auth-error">{state.error}</div>}
      {state?.success && <div className="g-auth-success">{state.success}</div>}
      <div className="g-field">
        <label>Email</label>
        <input type="email" name="email" required autoComplete="email" />
      </div>
      <button type="submit" className="g-btn g-auth-submit" disabled={pending}>
        {pending ? "Envoi..." : "Envoyer le lien de réinitialisation"}
      </button>
    </form>
  );
}
