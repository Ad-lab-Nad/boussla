import Link from "next/link";
import { Mail } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { SITE, type SocialNetwork } from "@/lib/site-config";

// lucide-react dropped brand logos, so the social icons are inline SVGs
// (simple, single-color glyphs that follow currentColor).
const SOCIAL_ICONS: Record<SocialNetwork, { label: string; path: string }> = {
  instagram: {
    label: "Instagram",
    path: "M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 4.7a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2Zm0 8.4a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6Zm5.3-9.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z",
  },
  facebook: {
    label: "Facebook",
    path: "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z",
  },
  linkedin: {
    label: "LinkedIn",
    path: "M20.4 2H3.6A1.6 1.6 0 0 0 2 3.6v16.8A1.6 1.6 0 0 0 3.6 22h16.8a1.6 1.6 0 0 0 1.6-1.6V3.6A1.6 1.6 0 0 0 20.4 2ZM8 19H5V9.5h3V19ZM6.5 8.2a1.7 1.7 0 1 1 0-3.5 1.7 1.7 0 0 1 0 3.5ZM19 19h-3v-4.6c0-1.1 0-2.5-1.5-2.5s-1.8 1.2-1.8 2.4V19h-3V9.5h2.9v1.3a3.2 3.2 0 0 1 2.9-1.6c3 0 3.6 2 3.6 4.6V19Z",
  },
  tiktok: {
    label: "TikTok",
    path: "M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z",
  },
};

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { href: "/#fonctionnalites", label: "Fonctionnalités" },
      { href: "/#tarifs", label: "Tarifs" },
      { href: "/signup", label: "Essai gratuit 1 mois" },
      { href: "/login", label: "Se connecter" },
    ],
  },
  {
    title: "Aide",
    links: [
      { href: "/contact", label: "Nous contacter" },
      { href: "/forgot-password", label: "Mot de passe oublié" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/conditions", label: "Conditions d'utilisation" },
      { href: "/confidentialite", label: "Politique de confidentialité" },
      { href: "/mentions-legales", label: "Mentions légales" },
    ],
  },
];

export function SiteFooter() {
  const socials = (Object.keys(SITE.social) as SocialNetwork[]).filter((k) => SITE.social[k]);
  const year = new Date().getFullYear();

  return (
    <footer className="l-site-footer">
      <div className="l-site-footer__inner">
        <div className="l-site-footer__brand">
          <BrandLogo height={32} />
          <p>{SITE.tagline}</p>
          <a href={`mailto:${SITE.contactEmail}`} className="l-site-footer__mail">
            <Mail size={15} /> {SITE.contactEmail}
          </a>
          {socials.length > 0 && (
            <div className="l-site-footer__social">
              {socials.map((k) => (
                <a
                  key={k}
                  href={SITE.social[k]}
                  // "#" = icon shown before the real page link exists: stay put.
                  {...(SITE.social[k] === "#" ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                  aria-label={SOCIAL_ICONS[k].label}
                  title={SOCIAL_ICONS[k].label}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d={SOCIAL_ICONS[k].path} />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} className="l-site-footer__col" aria-label={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="l-site-footer__bottom">
        <span>
          © {year} {SITE.name}. Tous droits réservés.
        </span>
        <span>Fait avec soin en Tunisie 🇹🇳</span>
      </div>
    </footer>
  );
}
