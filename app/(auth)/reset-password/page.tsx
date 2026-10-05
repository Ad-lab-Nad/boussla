import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { BrandLogo } from "@/components/BrandLogo";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const hasSession = Boolean(data?.claims);

  return (
    <div className="g-auth-card">
      <div className="g-auth-brand">
        <BrandLogo height={40} />
      </div>

      <div className="g-card">
        <h2>Nouveau mot de passe</h2>
        {hasSession ? (
          <ResetPasswordForm />
        ) : (
          <div className="g-auth-error">
            Ce lien de réinitialisation n&apos;est plus valide ou a expiré.{" "}
            <Link href="/forgot-password">Demande-en un nouveau</Link>.
          </div>
        )}
      </div>
    </div>
  );
}
