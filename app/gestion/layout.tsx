import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { after } from "next/server";
import { Suspense } from "react";
import { GestionChrome } from "@/components/gestion/GestionChrome";
import { WelcomePixel } from "@/components/WelcomePixel";
import { WelcomeBubble } from "@/components/gestion/WelcomeBubble";
import { ADMIN_EMAIL } from "@/lib/admin-email";
import { getCurrentUser } from "@/lib/current-user";
import { recordLastSeen } from "@/lib/last-seen";
import { getOrCreateSubscription } from "@/lib/subscription";
import { canAccessPalier2, hasActiveAccess } from "@/lib/subscription-access";
import { getServerLocale } from "@/lib/i18n/server";
import "./gestion.css";

// Every Gestion page reads live, mutable data (orders, stock, expenses...) —
// never prerender it statically at build time.
export const dynamic = "force-dynamic";

const inter = Inter({
  variable: "--font-gestion-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-gestion-mono",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Gestion — Flux",
  description: "Stock, commandes, produits et analyse mensuelle du vrai bénéfice.",
};

const NEW_ACCOUNT_DAYS = 14;

/** The welcome bubble is for brand-new accounts only (not the founder's). */
function isNewAccount(user: { email: string; createdAt: Date }): boolean {
  return user.email !== ADMIN_EMAIL && Date.now() - user.createdAt.getTime() < NEW_ACCOUNT_DAYS * 24 * 60 * 60 * 1000;
}

export default async function GestionLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  // Off the response path: the back office's "dernière visite".
  after(() => recordLastSeen(user));
  const subscription = await getOrCreateSubscription(user.id);
  const hasPalier2 = canAccessPalier2(subscription);
  const accessExpired = !hasActiveAccess(subscription);
  const initialLocale = await getServerLocale();

  return (
    <div className={`gestion g-doodle ${inter.variable} ${jetbrainsMono.variable}`}>
      <GestionChrome
        userEmail={user.email}
        activityType={user.activityType}
        hasPalier2={hasPalier2}
        accessExpired={accessExpired}
        initialLocale={initialLocale}
      >
        <Suspense fallback={null}>
          <WelcomePixel />
        </Suspense>
        {children}
        <WelcomeBubble enabled={isNewAccount(user)} />
      </GestionChrome>
    </div>
  );
}
