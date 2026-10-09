import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const hasSession = Boolean(data?.claims);
  const { t } = await getServerT();

  return (
    <div className="g-auth-card">
      <div className="g-card">
        <h2>{t("auth.reset.title")}</h2>
        {hasSession ? (
          <ResetPasswordForm />
        ) : (
          <div className="g-auth-error">
            {t("auth.reset.invalid")} <Link href="/forgot-password">{t("auth.reset.requestNew")}</Link>.
          </div>
        )}
      </div>
    </div>
  );
}
