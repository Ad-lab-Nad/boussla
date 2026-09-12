import { Inter, JetBrains_Mono } from "next/font/google";
import "@/app/gestion/gestion.css";
import "./auth.css";

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

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`gestion ${inter.variable} ${jetbrainsMono.variable}`}>
      <div className="g-auth-shell">{children}</div>
    </div>
  );
}
