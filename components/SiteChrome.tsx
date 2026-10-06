"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Header + footer copied from the public landing page (landing/index.html):
// same logo, tagline, fonts, colors and orange CTA, so going from the
// homepage to sign-up / login feels like one site. Styles live in
// app/(auth)/site-chrome.css, scoped under .sc-* so they never touch the
// app's own .g-* components.

function GoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Logo({ height }: { height: number }) {
  return (
    <span className="sc-logo-chip">
      {/* eslint-disable-next-line @next/next/no-img-element -- same static PNG as the landing page */}
      <img className="sc-logo-img" src="/brand/flux-logo-landing.png" alt="fluX" height={height} width={Math.round((height * 160) / 96)} />
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const onSignup = pathname === "/signup";

  return (
    <nav className="sc-nav" aria-label="Navigation principale">
      <div className="sc-wrap">
        <Link href="/" className="sc-logo-group" aria-label="fluX — accueil">
          <Logo height={42} />
          <span className="sc-nav-tag">Trouvez votre X.</span>
        </Link>
        {onSignup ? (
          <Link href="/login" className="sc-btn sc-btn-ghost">
            Déjà un compte ? Se connecter
          </Link>
        ) : (
          <Link href="/signup" className="sc-btn">
            <GoIcon />
            Commencer l&apos;essai gratuit
          </Link>
        )}
      </div>
    </nav>
  );
}

export function SiteFooterMini() {
  return (
    <footer className="sc-footer">
      <div className="sc-wrap">
        <Link href="/" aria-label="fluX — accueil">
          <Logo height={32} />
        </Link>
        <span className="sc-f-note">Trouvez votre X. Fait pour les commerçants et commerçantes de Tunisie.</span>
        <nav className="sc-f-links" aria-label="Liens utiles">
          <Link href="/contact">Contact</Link>
          <Link href="/conditions">Conditions</Link>
          <Link href="/confidentialite">Confidentialité</Link>
          <Link href="/mentions-legales">Mentions légales</Link>
        </nav>
      </div>
    </footer>
  );
}
