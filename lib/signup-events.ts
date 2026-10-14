import { prisma } from "@/lib/prisma";

// Where people stop on the sign-up form. Anonymous on purpose: an event
// and a short reason, never what was typed.

export const SIGNUP_EVENTS = ["started", "submitted", "client_invalid", "error", "success"] as const;
export type SignupEventName = (typeof SIGNUP_EVENTS)[number];

export async function recordSignupEvent(event: SignupEventName, detail?: string | null): Promise<void> {
  try {
    await prisma.signupEvent.create({ data: { event, detail: detail ? detail.slice(0, 80) : null } });
  } catch (err) {
    // Measuring must never break signing up.
    console.error("signup event not recorded:", err);
  }
}

/** A short, stable reason for a Supabase sign-up error message. */
export function authErrorCode(message: string): string {
  if (/already registered|already exists/i.test(message)) return "supabase:already_registered";
  if (/password/i.test(message)) return "supabase:password";
  if (/rate limit/i.test(message)) return "supabase:rate_limit";
  if (/invalid.*email|email.*invalid/i.test(message)) return "supabase:invalid_email";
  return `supabase:${message.replace(/[^a-z ]/gi, "").trim().slice(0, 50)}`;
}
