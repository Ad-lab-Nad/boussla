"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateSubscription, priceFor } from "@/lib/subscription";
import { getServerT } from "@/lib/i18n/server";
import type { TFunction } from "@/lib/i18n/translate";

export type AuthActionState = { error?: string; success?: string } | null;

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

// Messages follow the visitor's language (locale cookie, set by the Arabic
// landing page or the in-app language switcher) — see lib/i18n/server.ts.
function mapAuthError(message: string, t: TFunction): string {
  if (/invalid login credentials/i.test(message)) return t("auth.errors.invalidCredentials");
  if (/email not confirmed/i.test(message)) return t("auth.errors.emailNotConfirmed");
  if (/already registered|already exists/i.test(message)) return t("auth.errors.alreadyRegistered");
  if (/password.*(least|character)/i.test(message)) return t("auth.errors.passwordTooShort");
  if (/rate limit/i.test(message)) return t("auth.errors.rateLimit");
  return message;
}

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  const industry = String(formData.get("industry") || "").trim() || null;
  const marketingConsent = formData.get("marketingConsent") === "on";
  const activityType = formData.get("activityType") === "SERVICES" ? "SERVICES" : "PRODUCTS";
  const { t } = await getServerT();

  if (!email || !password) return { error: t("auth.errors.emailPasswordRequired") };
  if (password.length < 8) return { error: t("auth.errors.passwordTooShort") };
  if (password !== confirmPassword) return { error: t("auth.fields.mismatch") };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${siteUrl()}/auth/confirm?next=/gestion` },
  });

  if (error) return { error: mapAuthError(error.message, t) };

  // Signing up with an email that already has an account doesn't error:
  // Supabase returns a fake user with no identities and sends no email. Say
  // so instead of a misleading "check your inbox" — and never touch the
  // existing User row with that fake id.
  if (data.user && data.user.identities?.length === 0) {
    return { error: t("auth.errors.accountExists") };
  }

  const authUserId = data.user?.id;
  if (authUserId) {
    // Claim-or-create: a pre-existing single-tenant row with this email
    // (from before real auth existed) gets linked rather than duplicated —
    // its data (products, orders, stock...) carries over untouched.
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        authUserId,
        industry,
        marketingConsent,
        marketingConsentAt: marketingConsent ? new Date() : null,
        activityType,
      },
      create: {
        email,
        authUserId,
        industry,
        marketingConsent,
        marketingConsentAt: marketingConsent ? new Date() : null,
        activityType,
      },
    });
    // Starts the free trial. A no-op if this account (new or claimed)
    // already has a subscription.
    const subscription = await getOrCreateSubscription(user.id);

    // Tier picked on the landing page (?plan=palier1|palier2), carried
    // through the signup form: recorded as the trial's pending choice — the
    // same thing chooseBillingPlan stores — so the Abonnement page and the
    // back office show it. The trial itself still grants full access.
    const plan = formData.get("plan");
    const tier = plan === "palier1" ? "PALIER_1" : plan === "palier2" ? "PALIER_2" : null;
    if (tier && subscription.status === "TRIALING") {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { tier, billingInterval: "MONTHLY", priceAmount: priceFor(tier, "MONTHLY") },
      });
    }
  }

  if (data.session) {
    // Email confirmation is disabled on this project — already signed in.
    redirect("/gestion");
  }

  return { success: t("auth.success.signupCheckEmail") };
}

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/gestion");
  const { t } = await getServerT();

  if (!email || !password) return { error: t("auth.errors.emailPasswordRequired") };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: mapAuthError(error.message, t) };

  redirect(next.startsWith("/") ? next : "/gestion");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const { t } = await getServerT();
  if (!email) return { error: t("auth.errors.emailRequired") };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/confirm?next=/reset-password`,
  });

  // Same message whether or not the email exists — this endpoint must not
  // let anyone probe which addresses have an account.
  if (error && !/rate limit/i.test(error.message)) {
    return { error: mapAuthError(error.message, t) };
  }
  return { success: t("auth.success.resetSent") };
}

export async function updatePassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  const { t } = await getServerT();

  if (password.length < 8) return { error: t("auth.errors.passwordTooShort") };
  if (password !== confirmPassword) return { error: t("auth.fields.mismatch") };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: mapAuthError(error.message, t) };

  redirect("/gestion");
}
