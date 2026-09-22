import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { GestionChrome } from "@/components/gestion/GestionChrome";
import { getCurrentUser } from "@/lib/current-user";
import { getOrCreateSubscription } from "@/lib/subscription";
import { canAccessPalier2 } from "@/lib/subscription-access";
import { getServerLocale } from "@/lib/i18n/server";
import "./gestion.css";

// Every Gestion page reads live, mutable data (orders, stock, expenses...) —
// never prerender it statically at build time.
export const dynamic = "force-dynamic";

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
  title: "Gestion — Boussla",
  description: "Stock, commandes, produits et analyse mensuelle du vrai bénéfice.",
};

export default async function GestionLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const subscription = await getOrCreateSubscription(user.id);
  const hasPalier2 = canAccessPalier2(subscription);
  const initialLocale = await getServerLocale();

  return (
    <div className={`gestion ${inter.variable} ${jetbrainsMono.variable}`}>
      <GestionChrome
        userEmail={user.email}
        activityType={user.activityType}
        hasPalier2={hasPalier2}
        initialLocale={initialLocale}
      >
        {children}
      </GestionChrome>
    </div>
  );
}
