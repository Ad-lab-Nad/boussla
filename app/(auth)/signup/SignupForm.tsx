"use client";

import { useActionState, useState } from "react";
import { signUp, type AuthActionState } from "@/lib/auth-actions";

const INDUSTRIES = [
  { value: "Alimentaire", label: "Alimentaire" },
  { value: "Artisanat", label: "Artisanat" },
  { value: "Mode", label: "Mode" },
  { value: "Services", label: "Services" },
  { value: "Autre", label: "Autre" },
];

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(signUp, null);
  const [industry, setIndustry] = useState("Alimentaire");

  return (
    <form action={formAction} className="g-auth-field-stack">
      {state?.error && <div className="g-auth-error">{state.error}</div>}
      {state?.success && <div className="g-auth-success">{state.success}</div>}

      <div className="g-field">
        <label>Email</label>
        <input type="email" name="email" required autoComplete="email" />
      </div>
      <div className="g-field">
        <label>Mot de passe</label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <div className="g-field">
        <label>Type d&apos;activité</label>
        <div className="g-radio-group">
          <label className="g-radio-option">
            <input type="radio" name="activityType" value="PRODUCTS" defaultChecked />
            <span>
              <strong>Produits physiques</strong>
              <small>Gère aussi le stock de matières et de produits finis.</small>
            </span>
          </label>
          <label className="g-radio-option">
            <input type="radio" name="activityType" value="SERVICES" />
            <span>
              <strong>Services / Prestations</strong>
              <small>Pas de stock — commandes, prestations et dépenses uniquement.</small>
            </span>
          </label>
        </div>
      </div>

      <div className="g-field">
        <label>Secteur d&apos;activité</label>
        <select
          name="industryChoice"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        >
          {INDUSTRIES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {industry === "Autre" ? (
        <div className="g-field">
          <label>Précise ton secteur</label>
          <input type="text" name="industry" placeholder="ex: Cosmétique" />
        </div>
      ) : (
        <input type="hidden" name="industry" value={industry} />
      )}

      <label className="g-auth-checkbox-row">
        <input type="checkbox" name="marketingConsent" />
        J&apos;accepte d&apos;être informé(e) des nouveaux outils Boussla.
      </label>

      <button type="submit" className="g-btn g-auth-submit" disabled={pending}>
        {pending ? "Création..." : "Créer mon compte"}
      </button>
    </form>
  );
}
