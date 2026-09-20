import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { signOut } from "@/lib/auth-actions";
import { AdminTabs } from "@/components/AdminTabs";
import "@/app/gestion/gestion.css";

// Reads live subscription/feedback data — never prerender at build time.
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
  title: "Back office — Boussla",
  description: "Administration interne Boussla.",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className={`gestion ${inter.variable} ${jetbrainsMono.variable}`}>
      <div className="g-topbar">
        <h1>Back office</h1>
        <div style={{ display: "flex", gap: 10, marginLeft: "auto", alignItems: "center" }}>
          <Link href="/gestion" className="g-btn secondary small">
            <LayoutDashboard size={14} /> Gestion
          </Link>
          <form action={signOut}>
            <button type="submit" className="g-btn secondary small">
              <LogOut size={14} /> Déconnexion
            </button>
          </form>
        </div>
      </div>
      <AdminTabs />
      <div className="g-page-body">{children}</div>
    </div>
  );
}
