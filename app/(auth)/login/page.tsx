import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";
import { LoginForm } from "./LoginForm";
import { FeedbackForm } from "@/components/FeedbackForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const { t } = await getServerT();

  return (
    <div className="g-auth-card">
      <div className="g-card">
        <h2>{t("auth.login.title")}</h2>
        {error === "confirm_failed" && <div className="g-auth-error">{t("auth.login.linkInvalid")}</div>}
        <LoginForm next={next ?? "/gestion"} />
      </div>

      <div className="g-auth-footer">
        <Link href="/forgot-password">{t("auth.login.forgot")}</Link>
      </div>
      <div className="g-auth-footer">
        {t("auth.login.noAccount")} <Link href="/signup">{t("auth.login.signupLink")}</Link>
      </div>

      <FeedbackForm />
    </div>
  );
}
