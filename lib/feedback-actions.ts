"use server";

import { prisma } from "@/lib/prisma";
import type { AuthActionState } from "@/lib/auth-actions";

export async function submitFeedback(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const message = String(formData.get("message") || "").trim();

  if (!email || !message) return { error: "Indique ton email et ton message." };

  await prisma.feedback.create({ data: { email, message } });
  return { success: "Merci, ton message a bien été envoyé." };
}
