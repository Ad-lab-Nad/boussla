import Link from "next/link";
import { SignupForm } from "./SignupForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const initialPlan = plan === "palier1" || plan === "palier2" ? plan : "later";
  return (
    <div className="g-auth-card">

      <div className="g-card">
        <h2>Créer un compte</h2>
        <div className="g-auth-hint">
          Chaque compte a ses propres produits, commandes, stock et dépenses.
        </div>
        <SignupForm initialPlan={initialPlan} />
      </div>

      <div className="g-auth-footer">
        Déjà un compte ? <Link href="/login">Se connecter</Link>
      </div>
    </div>
  );
}
