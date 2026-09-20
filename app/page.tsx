import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Inter, JetBrains_Mono } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "./LandingPage";
import "./gestion/gestion.css";

const inter = Inter({
  variable: "--font-gestion-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-gestion-mono",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Boussla — sais-tu vraiment combien tu gagnes ce mois-ci ?",
  description:
    "Boussla te dit, chaque mois, combien ton activité gagne réellement : bénéfice réel, impayés, alertes stock, top produits. 14 jours gratuits, sans carte bancaire.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  // Logged-in visitors normally get bounced to their dashboard — except the
  // admin's own "Aperçu" link from /admin/accueil, which needs to actually
  // show the public page while she's signed in to edit it.
  if (data?.claims && preview !== "1") redirect("/gestion");

  return (
    <div className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <LandingPage />
    </div>
  );
}
