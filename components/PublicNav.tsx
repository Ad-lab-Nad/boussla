import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

/** Top bar shared by the landing page and the public info pages. */
export function PublicNav() {
  return (
    <nav className="l-nav">
      <Link href="/" className="l-brand" aria-label="Flux — accueil">
        <BrandLogo height={34} />
      </Link>
      <Link href="/login" className="l-nav-login">
        Déjà un compte ? Se connecter
      </Link>
    </nav>
  );
}
