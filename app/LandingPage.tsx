import Link from "next/link";
import { CheckCircle2, Eye, Package, Trophy, Wallet } from "lucide-react";
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

export function LandingPage() {
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

      <section className="l-hero">
        <h1>Sais-tu vraiment combien tu gagnes ce mois-ci ?</h1>
        <p>
          Entre les commandes, le stock et les dépenses, la gestion prend vite le dessus. Résultat
          : tes vrais chiffres — ce qu&apos;il te reste une fois tout payé — arrivent toujours en
          dernier, quand il est trop tard pour réagir.
        </p>
        <p className="l-solution">
          Boussla te dit, chaque mois, combien ton activité gagne réellement — sans tableur, sans
          prise de tête.
        </p>

        <div className="l-cta-group">
          <Link href="/signup" className="g-btn l-btn-large">
            Essayer gratuitement
          </Link>
          <span className="l-trial-pill">
            <CheckCircle2 />
            14 jours gratuits, sans carte bancaire requise
          </span>
        </div>
      </section>

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

      <section className="l-pricing">
        <div className="l-pricing-card">
          <div className="l-price">39 DT/mois</div>
          <div className="l-price-note">après l&apos;essai gratuit de 14 jours</div>
          <Link href="/signup" className="g-btn l-btn-large">
            Essayer gratuitement
          </Link>
        </div>
      </section>

      <footer className="l-footer">Boussla — gestion simple pour petites activités</footer>
    </div>
  );
}
