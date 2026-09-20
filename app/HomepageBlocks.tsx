import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type {
  ArgumentaireContent,
  HeroContent,
  OffresContent,
  TemoignagesContent,
} from "@/lib/homepage/types";

export function HeroSection({ content }: { content: HeroContent }) {
  return (
    <section className="l-hero">
      <h1>{content.title}</h1>
      {content.subtitle && <p>{content.subtitle}</p>}
      {content.solutionText && <p className="l-solution">{content.solutionText}</p>}

      <div className="l-cta-group">
        <Link href="/signup" className="g-btn l-btn-large">
          {content.ctaLabel}
        </Link>
        <span className="l-trial-pill">
          <CheckCircle2 />
          14 jours gratuits, sans carte bancaire requise
        </span>
      </div>
    </section>
  );
}

export function ArgumentaireSection({ content }: { content: ArgumentaireContent }) {
  return (
    <section className="l-argumentaire">
      <div className="l-argumentaire-inner">
        {content.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded Supabase Storage URL, not a static asset next/image can optimize.
          <img src={content.imageUrl} alt="" className="l-argumentaire-image" />
        )}
        <div>
          <h2>{content.sectionTitle}</h2>
          <p>{content.text}</p>
        </div>
      </div>
    </section>
  );
}

export function OffresSection({ content }: { content: OffresContent }) {
  return (
    <section className="l-offers">
      <div className="g-plan-grid">
        {content.offers.map((offer, i) => (
          <div className={`g-plan-card ${i === 1 ? "g-plan-card--featured" : ""}`} key={i}>
            <h3>{offer.name}</h3>
            <div className="g-plan-price">{offer.price}</div>
            {offer.features.length > 0 && (
              <ul className="l-offer-features">
                {offer.features.map((feature, fi) => (
                  <li key={fi}>
                    <CheckCircle2 size={14} />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
            <Link href="/signup" className="g-btn l-btn-large">
              {offer.ctaLabel}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TemoignagesSection({ content }: { content: TemoignagesContent }) {
  return (
    <section className="l-temoignages">
      <h2>Ce qu&apos;en disent nos utilisatrices</h2>
      <div className="l-temoignage-grid">
        {content.items.map((t, i) => (
          <div className="l-temoignage-card" key={i}>
            <p className="l-temoignage-quote">&laquo; {t.quote} &raquo;</p>
            <div className="l-temoignage-author">
              {t.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded Supabase Storage URL, not a static asset next/image can optimize.
                <img src={t.photoUrl} alt="" className="l-temoignage-photo" />
              )}
              <span>{t.name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
