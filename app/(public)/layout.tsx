import { Inter } from "next/font/google";
import { PublicNav } from "@/components/PublicNav";
import { SiteFooter } from "@/components/SiteFooter";
import "@/app/gestion/gestion.css";
import "@/app/landing.css";

// Public info pages (contact, legal) — same look as the landing page, and
// reachable whether or not the visitor is signed in.
const inter = Inter({
  variable: "--font-gestion-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`gestion landing ${inter.variable}`}>
      <PublicNav />
      <main className="l-page">{children}</main>
      <SiteFooter />
    </div>
  );
}
