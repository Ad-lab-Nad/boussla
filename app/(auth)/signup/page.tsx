import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";
import { SignupForm } from "./SignupForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const initialPlan = plan === "palier1" || plan === "palier2" ? plan : null;
  const { t } = await getServerT();

  return (
    <div className="g-auth-card">
      <div className="g-card">
        <h2>{t("auth.signup.title")}</h2>
        <div className="g-auth-hint">{t("auth.signup.hint")}</div>
        <SignupForm plan={initialPlan} />
      </div>

      <div className="g-auth-footer">
        {t("auth.signup.haveAccount")} <Link href="/login">{t("auth.signup.loginLink")}</Link>
      </div>
    </div>
  );
}
