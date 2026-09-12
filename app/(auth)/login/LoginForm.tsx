"use client";

import { useActionState } from "react";
import { signIn, type AuthActionState } from "@/lib/auth-actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(signIn, null);

  return (
    <form action={formAction} className="g-auth-field-stack">
      <input type="hidden" name="next" value={next} />
      {state?.error && <div className="g-auth-error">{state.error}</div>}
      <div className="g-field">
        <label>Email</label>
        <input type="email" name="email" required autoComplete="email" />
      </div>
      <div className="g-field">
        <label>Mot de passe</label>
        <input type="password" name="password" required autoComplete="current-password" />
      </div>
      <button type="submit" className="g-btn g-auth-submit" disabled={pending}>
        {pending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
