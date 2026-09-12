"use client";

import { useActionState } from "react";
import { updatePassword, type AuthActionState } from "@/lib/auth-actions";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    updatePassword,
    null
  );

  return (
    <form action={formAction} className="g-auth-field-stack">
      {state?.error && <div className="g-auth-error">{state.error}</div>}
      <div className="g-field">
        <label>Nouveau mot de passe</label>
        <input type="password" name="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div className="g-field">
        <label>Confirme le mot de passe</label>
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <button type="submit" className="g-btn g-auth-submit" disabled={pending}>
        {pending ? "Mise à jour..." : "Mettre à jour le mot de passe"}
      </button>
    </form>
  );
}
