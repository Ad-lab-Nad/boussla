import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { Tabs } from "@/components/gestion/Tabs";
import "./gestion.css";

// Every Gestion page reads live, mutable data (orders, stock, expenses...) —
// never prerender it statically at build time.
export const dynamic = "force-dynamic";

const fraunces = Fraunces({
  variable: "--font-gestion-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-gestion-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-gestion-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Gestion — Boussla",
  description: "Stock, commandes, produits et analyse mensuelle du vrai bénéfice.",
};

export default function GestionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`gestion ${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <div className="wrap">
        <h1>Gestion</h1>
        <div className="subtitle">
          Stock, commandes, produits et analyse mensuelle du vrai bénéfice.
        </div>
        <Tabs />
        {children}
      </div>
    </div>
  );
}
