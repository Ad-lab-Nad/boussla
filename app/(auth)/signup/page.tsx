import Link from "next/link";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <div className="g-auth-card">
      <div className="g-auth-brand">
        <div className="g-auth-brand__mark">B</div>
        <span className="g-auth-brand__name">Boussla</span>
      </div>

      <div className="g-card">
        <h2>Créer un compte</h2>
        <div className="g-auth-hint">
          Chaque compte a ses propres produits, commandes, stock et dépenses.
        </div>
        <SignupForm />
      </div>

      <div className="g-auth-footer">
        Déjà un compte ? <Link href="/login">Se connecter</Link>
      </div>
    </div>
  );
}
