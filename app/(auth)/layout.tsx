import { IBM_Plex_Mono, Inter, JetBrains_Mono, Work_Sans } from "next/font/google";
import { SiteFooterMini, SiteHeader } from "@/components/SiteChrome";
import "@/app/gestion/gestion.css";
import "./auth.css";
import "./site-chrome.css";

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

// The landing page's own fonts, for the shared header/footer.
const workSans = Work_Sans({
  variable: "--font-sc-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-sc-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`gestion g-doodle sc-chrome ${inter.variable} ${jetbrainsMono.variable} ${workSans.variable} ${plexMono.variable}`}
    >
      <SiteHeader />
      <div className="g-auth-shell">{children}</div>
      <SiteFooterMini />
    </div>
  );
}
