import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default async function ForgotPasswordPage() {
  const { t } = await getServerT();
  return (
    <div className="g-auth-card">
      <div className="g-card">
        <h2>{t("auth.forgot.title")}</h2>
        <div className="g-auth-hint">{t("auth.forgot.hint")}</div>
        <ForgotPasswordForm />
      </div>

      <div className="g-auth-footer">
        <Link href="/login">{t("auth.forgot.back")}</Link>
      </div>
    </div>
  );
}
