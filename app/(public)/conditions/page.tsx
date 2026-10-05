import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site-config";
import { TIER_PRICING } from "@/lib/subscription";

export const metadata: Metadata = { title: "Conditions d'utilisation — Flux" };

export default function ConditionsPage() {
  const L = SITE.legal;
  return (
    <article className="l-legal">
      <h1 className="l-page__title">Conditions générales d&apos;utilisation</h1>
      <p className="l-legal__updated">Dernière mise à jour : {L.lastUpdated}</p>

      <h2>1. Objet</h2>
      <p>
        Les présentes conditions encadrent l&apos;utilisation de {SITE.name}, application en ligne de gestion
        pour petites activités (ventes, stock, dépenses, clients), éditée par {L.publisherName}. En créant un
        compte, tu acceptes ces conditions.
      </p>

      <h2>2. Ton compte</h2>
      <p>
        Tu t&apos;inscris avec une adresse email valide et un mot de passe que tu gardes confidentiel. Tu es
        responsable de l&apos;activité de ton compte et de l&apos;exactitude des informations que tu y saisis.
      </p>

      <h2>3. Essai gratuit</h2>
      <p>
        Chaque nouveau compte bénéficie d&apos;un mois d&apos;essai gratuit, avec accès complet, sans carte
        bancaire. À la fin de l&apos;essai, l&apos;accès est suspendu jusqu&apos;à la souscription d&apos;un
        abonnement. Tes données sont conservées.
      </p>

      <h2>4. Abonnements et prix</h2>
      <ul>
        <li>
          Palier 1 : {TIER_PRICING.PALIER_1.monthly} DT par mois ou {TIER_PRICING.PALIER_1.annual} DT par an.
        </li>
        <li>
          Palier 2 : {TIER_PRICING.PALIER_2.monthly} DT par mois ou {TIER_PRICING.PALIER_2.annual} DT par an.
        </li>
      </ul>
      <p>
        L&apos;accès payant est activé dès réception du paiement, pour la durée choisie (un mois ou un an). Un
        changement de palier s&apos;applique à partir du paiement suivant, sans calcul au prorata. Les prix
        peuvent évoluer : tout changement est annoncé à l&apos;avance et ne s&apos;applique pas à une période
        déjà payée.
      </p>

      <h2>5. Fin d&apos;abonnement</h2>
      <p>
        Sans renouvellement, l&apos;accès est suspendu à la fin de la période payée. Tes données restent
        conservées et redeviennent accessibles dès le renouvellement. Tu peux demander à tout moment la
        suppression de ton compte via la <Link href="/contact">page contact</Link>. Les sommes déjà versées pour
        une période entamée ne sont pas remboursées.
      </p>

      <h2>6. Tes données</h2>
      <p>
        Les données que tu saisis t&apos;appartiennent. Leur traitement est décrit dans la{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>

      <h2>7. Responsabilité</h2>
      <p>
        {SITE.name} est un outil d&apos;aide au suivi de ton activité. Les chiffres affichés dépendent des
        informations que tu saisis et ne remplacent pas l&apos;avis d&apos;un comptable ni tes obligations
        fiscales. Nous faisons le maximum pour que le service soit disponible et fiable, sans pouvoir garantir
        une disponibilité ininterrompue (maintenance, incident technique).
      </p>

      <h2>8. Usage acceptable</h2>
      <p>
        Tu t&apos;engages à utiliser {SITE.name} pour ta propre activité, de façon légale, sans tenter
        d&apos;accéder aux données d&apos;autres comptes ni de perturber le service. Tout manquement peut
        entraîner la suspension du compte.
      </p>

      <h2>9. Modification des conditions</h2>
      <p>
        Ces conditions peuvent évoluer. En cas de changement important, tu en seras informée par email ou dans
        l&apos;application.
      </p>

      <h2>10. Droit applicable</h2>
      <p>
        Ces conditions sont soumises au droit tunisien. En cas de litige, et à défaut d&apos;accord amiable,
        les tribunaux de Tunis sont compétents.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
      </p>
    </article>
  );
}
