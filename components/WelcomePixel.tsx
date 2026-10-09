"use client";

import { useSearchParams } from "next/navigation";
import { MetaPixelEvent } from "@/components/MetaPixel";

/** Right after a sign-up that needed no email confirmation, signUp lands on
 * /gestion?bienvenue=1 — report it to the Meta Pixel once. */
export function WelcomePixel() {
  const params = useSearchParams();
  return params.get("bienvenue") === "1" ? <MetaPixelEvent event="CompleteRegistration" /> : null;
}
