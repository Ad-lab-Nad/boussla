import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { BrandLogo } from "@/components/BrandLogo";

export default function ForgotPasswordPage() {
  return (
    <div className="g-auth-card">
      <div className="g-auth-brand">
        <BrandLogo height={40} />
      </div>

      <div className="g-card">
        <h2>Mot de passe oublié</h2>
        <div className="g-auth-hint">
          On t&apos;envoie un lien pour choisir un nouveau mot de passe.
        </div>
        <ForgotPasswordForm />
      </div>

      <div className="g-auth-footer">
        <Link href="/login">Retour à la connexion</Link>
      </div>
    </div>
  );
}
