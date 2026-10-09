"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleProvider";

// Header + footer copied from the public landing page (landing/index.html):
// same logo, tagline, fonts, colors and orange CTA, so going from the
// homepage to sign-up / login feels like one site. Text follows the
// visitor's language; the logo leads back to the matching landing (/ or
// /ar). Styles live in app/(auth)/site-chrome.css, scoped under .sc-* so
// they never touch the app's own .g-* components.

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

function useHomeHref() {
  const { locale } = useLocale();
  return locale === "ar" ? "/ar" : "/";
}

export function SiteHeader() {
  const pathname = usePathname();
  const { t } = useLocale();
  const home = useHomeHref();
  const onSignup = pathname === "/signup";

  return (
    <nav className="sc-nav" aria-label={t("auth.chrome.home")}>
      <div className="sc-wrap">
        <Link href={home} className="sc-logo-group" aria-label={t("auth.chrome.home")}>
          <Logo height={42} />
          <span className="sc-nav-tag">{t("auth.chrome.tagline")}</span>
        </Link>
        {onSignup ? (
          <Link href="/login" className="sc-btn sc-btn-ghost">
            {t("auth.chrome.haveAccountLogin")}
          </Link>
        ) : (
          <Link href="/signup" className="sc-btn">
            <GoIcon />
            {t("auth.chrome.startTrial")}
          </Link>
        )}
      </div>
    </nav>
  );
}

export function SiteFooterMini() {
  const { t } = useLocale();
  const home = useHomeHref();
  return (
    <footer className="sc-footer">
      <div className="sc-wrap">
        <Link href={home} aria-label={t("auth.chrome.home")}>
          <Logo height={32} />
        </Link>
        <span className="sc-f-note">{t("auth.chrome.footerNote")}</span>
        <nav className="sc-f-links" aria-label={t("auth.chrome.legal")}>
          <Link href="/contact">{t("auth.chrome.contact")}</Link>
          <Link href="/conditions">{t("auth.chrome.terms")}</Link>
          <Link href="/confidentialite">{t("auth.chrome.privacy")}</Link>
          <Link href="/mentions-legales">{t("auth.chrome.legal")}</Link>
        </nav>
      </div>
    </footer>
  );
}
