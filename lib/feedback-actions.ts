"use server";

import { prisma } from "@/lib/prisma";
import type { AuthActionState } from "@/lib/auth-actions";
import { getServerT } from "@/lib/i18n/server";

export async function submitFeedback(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const message = String(formData.get("message") || "").trim();

  const { t } = await getServerT();
  if (!email || !message) return { error: t("auth.errors.feedbackRequired") };

  await prisma.feedback.create({ data: { email, message } });
  return { success: t("auth.success.feedbackSent") };
}
