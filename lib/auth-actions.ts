"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = { error?: string; success?: string } | null;

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function mapAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return "Email ou mot de passe incorrect.";
  if (/email not confirmed/i.test(message))
    return "Confirme d'abord ton adresse email (vérifie ta boîte mail).";
  if (/already registered|already exists/i.test(message))
    return "Un compte existe déjà avec cet email.";
  if (/password.*(least|character)/i.test(message))
    return "Mot de passe trop court (8 caractères minimum).";
  if (/rate limit/i.test(message)) return "Trop de tentatives — réessaie dans quelques minutes.";
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
  const industry = String(formData.get("industry") || "").trim() || null;
  const marketingConsent = formData.get("marketingConsent") === "on";
  const activityType = formData.get("activityType") === "SERVICES" ? "SERVICES" : "PRODUCTS";

  if (!email || !password) return { error: "Email et mot de passe requis." };
  if (password.length < 8)
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${siteUrl()}/auth/confirm?next=/gestion` },
  });

  if (error) return { error: mapAuthError(error.message) };

  const authUserId = data.user?.id;
  if (authUserId) {
    // Claim-or-create: a pre-existing single-tenant row with this email
    // (from before real auth existed) gets linked rather than duplicated —
    // its data (products, orders, stock...) carries over untouched.
    await prisma.user.upsert({
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
  }

  if (data.session) {
    // Email confirmation is disabled on this project — already signed in.
    redirect("/gestion");
  }

  return {
    success:
      "Compte créé — vérifie ta boîte mail pour confirmer ton adresse avant de te connecter.",
  };
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

  if (!email || !password) return { error: "Email et mot de passe requis." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: mapAuthError(error.message) };

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
  if (!email) return { error: "Indique ton email." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/confirm?next=/reset-password`,
  });

  // Same message whether or not the email exists — this endpoint must not
  // let anyone probe which addresses have an account.
  if (error && !/rate limit/i.test(error.message)) {
    return { error: mapAuthError(error.message) };
  }
  return {
    success: "Si un compte existe pour cet email, un lien de réinitialisation vient d'être envoyé.",
  };
}

export async function updatePassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (password.length < 8)
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  if (password !== confirmPassword) return { error: "Les mots de passe ne correspondent pas." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: mapAuthError(error.message) };

  redirect("/gestion");
}
