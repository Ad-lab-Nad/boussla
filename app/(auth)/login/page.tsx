import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { FeedbackForm } from "@/components/FeedbackForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="g-auth-card">
      <div className="g-auth-brand">
        <div className="g-auth-brand__mark">B</div>
        <span className="g-auth-brand__name">Boussla</span>
      </div>

      <div className="g-card">
        <h2>Connexion</h2>
        {error === "confirm_failed" && (
          <div className="g-auth-error">
            Ce lien n&apos;est plus valide ou a déjà été utilisé. Réessaie de te connecter, ou
            demande un nouveau lien.
          </div>
        )}
        <LoginForm next={next ?? "/gestion"} />
      </div>

      <div className="g-auth-footer">
        <Link href="/forgot-password">Mot de passe oublié ?</Link>
      </div>
      <div className="g-auth-footer">
        Pas encore de compte ? <Link href="/signup">Créer un compte</Link>
      </div>

      <FeedbackForm />
    </div>
  );
}
