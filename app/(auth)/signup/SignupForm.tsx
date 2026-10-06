"use client";

import { useActionState, useState } from "react";
import { signUp, type AuthActionState } from "@/lib/auth-actions";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { TIER_PRICING } from "@/lib/pricing";

// Launch is Produits-only — the Services/Prestations mode is fully built
// (Gestion nav, Commandes/Ventes copy, etc.) but not yet validated with real
// users on that segment, so the choice is hidden rather than removed. Flip
// this back on once that research happens; every new signup defaults to
// PRODUCTS below either way.
const SERVICES_MODE_ENABLED = false;

// Pre-selected from the landing page's pricing cards (?plan=palier1|palier2).
// The first month is free either way, with full access; the choice is just
// recorded so the admin knows which tier to bill once the trial ends.
const PLANS = [
  { value: "palier1", title: `Palier 1 — ${TIER_PRICING.PALIER_1.monthly} DT/mois`, hint: "1er mois offert" },
  { value: "palier2", title: `Palier 2 — ${TIER_PRICING.PALIER_2.monthly} DT/mois`, hint: "1er mois offert" },
  { value: "later", title: "Je choisirai plus tard", hint: "Accès complet pendant l'essai" },
] as const;

const INDUSTRIES = [
  { value: "Alimentaire", label: "Alimentaire" },
  { value: "Artisanat", label: "Artisanat" },
  { value: "Mode", label: "Mode" },
  { value: "Services", label: "Services" },
  { value: "Autre", label: "Autre" },
];

export function SignupForm({ initialPlan = "later" }: { initialPlan?: "palier1" | "palier2" | "later" }) {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(signUp, null);
  const [industry, setIndustry] = useState("Alimentaire");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const mismatch = confirmPassword.length > 0 && confirmPassword !== password;

  return (
    <form action={formAction} className="g-auth-field-stack">
      {state?.error && <div className="g-auth-error">{state.error}</div>}
      {state?.success && <div className="g-auth-success">{state.success}</div>}

      <div className="g-field">
        <label>Email</label>
        <input type="email" name="email" required autoComplete="email" />
      </div>
      <div className="g-field">
        <label htmlFor="signup-password">Mot de passe</label>
        <PasswordInput
          id="signup-password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="g-field">
        <label htmlFor="signup-confirm-password">Confirme le mot de passe</label>
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
        {mismatch && (
          <span className="g-password-mismatch">Les mots de passe ne correspondent pas.</span>
        )}
      </div>

      <div className="g-field">
        <label>Palier choisi</label>
        <div className="g-radio-group">
          {PLANS.map((p) => (
            <label className="g-radio-option" key={p.value}>
              <input type="radio" name="plan" value={p.value} defaultChecked={p.value === initialPlan} />
              <span>
                <strong>{p.title}</strong>
                <small>{p.hint}</small>
              </span>
            </label>
          ))}
        </div>
      </div>

      {SERVICES_MODE_ENABLED ? (
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
      ) : (
        <input type="hidden" name="activityType" value="PRODUCTS" />
      )}

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
        J&apos;accepte d&apos;être informé(e) des nouveaux outils Flux.
      </label>

      <button type="submit" className="g-btn g-auth-submit" disabled={pending || mismatch}>
        {pending ? "Création..." : "Créer mon compte"}
      </button>
    </form>
  );
}
