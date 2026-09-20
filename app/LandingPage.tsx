import Link from "next/link";
import { Eye, Package, Trophy, Wallet } from "lucide-react";
import { AmbianceIllustration } from "./AmbianceIllustration";
import { DashboardPreview } from "./DashboardPreview";
import { getActiveHomepageBlocks } from "@/lib/homepage/queries";
import {
  parseArgumentaireContent,
  parseHeroContent,
  parseOffresContent,
  parseTemoignagesContent,
} from "@/lib/homepage/types";
import { ArgumentaireSection, HeroSection, OffresSection, TemoignagesSection } from "./HomepageBlocks";
import "./landing.css";

const VALUES = [
  {
    icon: Wallet,
    tone: "blue",
    title: "Bénéfice réel",
    text: "Ce qu'il te reste vraiment une fois le stock et les dépenses payés.",
  },
  {
    icon: Eye,
    tone: "orange",
    title: "Impayés visibles",
    text: "Sache toujours qui te doit encore de l'argent, en un coup d'œil.",
  },
  {
    icon: Package,
    tone: "violet",
    title: "Alertes stock",
    text: "Ne sois plus jamais pris de court sur une matière qui manque.",
  },
  {
    icon: Trophy,
    tone: "aqua",
    title: "Top produits",
    text: "Repère ce qui se vend vraiment, pour arrêter de deviner.",
  },
];

// The illustration+dashboard-preview demo and the "Nos valeurs" grid don't
// match any of the block types Nada asked for (Argumentaire is a single
// title/text/image, not an icon grid) — converting them would be a visual
// regression she didn't request, so they stay fixed here, piggybacked onto
// the Hero block's position in the ordered list.
function DefaultHeroVisual() {
  return (
    <section className="l-media">
      <div className="l-ambiance">
        <AmbianceIllustration />
      </div>
      <DashboardPreview />
    </section>
  );
}

function ValuesSection() {
  return (
    <section className="l-values">
      <div className="l-value-grid">
        {VALUES.map((v) => {
          const Icon = v.icon;
          return (
            <div className="l-value-card" key={v.title}>
              <div className={`l-value-card__icon g-kpi__icon--${v.tone}`}>
                <Icon />
              </div>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export async function LandingPage() {
  const blocks = await getActiveHomepageBlocks();

  return (
    <div className="gestion landing">
      <nav className="l-nav">
        <div className="l-brand">
          <div className="l-brand__mark">B</div>
          <span className="l-brand__name">Boussla</span>
        </div>
        <Link href="/login" className="l-nav-login">
          Déjà un compte ? Se connecter
        </Link>
      </nav>

      {blocks.map((block) => {
        switch (block.type) {
          case "HERO": {
            const content = parseHeroContent(block.content);
            return (
              <div key={block.id}>
                <HeroSection content={content} />
                {content.imageUrl ? (
                  <section className="l-media">
                    <div className="l-ambiance">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded
                          Supabase Storage URL, not a static asset next/image can optimize. */}
                      <img src={content.imageUrl} alt="" className="l-ambiance-svg" />
                    </div>
                  </section>
                ) : (
                  <DefaultHeroVisual />
                )}
                <ValuesSection />
              </div>
            );
          }
          case "ARGUMENTAIRE":
            return <ArgumentaireSection key={block.id} content={parseArgumentaireContent(block.content)} />;
          case "OFFRES":
            return <OffresSection key={block.id} content={parseOffresContent(block.content)} />;
          case "TEMOIGNAGES": {
            const content = parseTemoignagesContent(block.content);
            if (content.items.length === 0) return null;
            return <TemoignagesSection key={block.id} content={content} />;
          }
          default:
            // FAQ is reserved in the model but has no public renderer yet.
            return null;
        }
      })}

      <footer className="l-footer">Boussla — gestion simple pour petites activités</footer>
    </div>
  );
}
