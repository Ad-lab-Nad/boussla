import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = { title: "Politique de confidentialité — Flux" };

export default function ConfidentialitePage() {
  const L = SITE.legal;
  return (
    <article className="l-legal">
      <h1 className="l-page__title">Politique de confidentialité</h1>
      <p className="l-legal__updated">Dernière mise à jour : {L.lastUpdated}</p>

      <p>
        {SITE.name} t&apos;aide à suivre ton activité : ventes, stock, dépenses, clients. Pour cela, nous
        conservons des informations te concernant. Cette page explique lesquelles, pourquoi, et quels sont tes
        droits, conformément à la loi organique tunisienne n° 2004-63 du 27 juillet 2004 relative à la
        protection des données à caractère personnel.
      </p>

      <h2>Responsable du traitement</h2>
      <p>
        {L.publisherName}, {L.address} — <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>

      <h2>Les données que nous collectons</h2>
      <ul>
        <li>
          <strong>Ton compte</strong> : adresse email, mot de passe (stocké chiffré, nous ne le voyons jamais),
          secteur d&apos;activité, et ton choix concernant les communications sur nos nouveaux outils.
        </li>
        <li>
          <strong>Les données de ton activité</strong> que tu saisis : produits, stock, commandes, clients et
          créances, dépenses et photos de reçus, objectifs.
        </li>
        <li>
          <strong>Ton abonnement</strong> : palier choisi, dates et montants des paiements.
        </li>
        <li>
          <strong>Tes messages</strong> envoyés via le formulaire de contact.
        </li>
        <li>
          <strong>Des données techniques</strong> nécessaires au fonctionnement : cookies de connexion et choix
          de la langue.
        </li>
      </ul>

      <h2>Pourquoi nous les utilisons</h2>
      <ul>
        <li>Te fournir le service : calculer ton bénéfice, ton stock, tes impayés, afficher tes tableaux de bord.</li>
        <li>Gérer ton compte, ton essai gratuit et ton abonnement.</li>
        <li>Répondre à tes messages et t&apos;assister.</li>
        <li>T&apos;informer de nos nouveaux outils, uniquement si tu l&apos;as accepté.</li>
      </ul>
      <p>
        Nous ne vendons jamais tes données, et nous ne les utilisons pas pour de la publicité. Les données de ton
        activité t&apos;appartiennent.
      </p>

      <h2>Qui y a accès</h2>
      <p>
        Seuls toi et l&apos;équipe {SITE.name} (pour l&apos;assistance et la gestion des abonnements). Nos
        prestataires techniques traitent les données uniquement pour faire fonctionner le service : Supabase
        (base de données et stockage, serveurs en Irlande, Union européenne) et Vercel (hébergement du site,
        États-Unis). Ces transferts hors de Tunisie sont nécessaires au fonctionnement du service.
      </p>

      <h2>Combien de temps nous les gardons</h2>
      <p>
        Tant que ton compte existe. Si ton abonnement prend fin, tes données sont conservées pour que tu puisses
        les retrouver en te réabonnant. Tu peux à tout moment demander la suppression définitive de ton compte et
        de tes données.
      </p>

      <h2>Sécurité</h2>
      <p>
        Connexions chiffrées (https), mots de passe chiffrés, photos de reçus dans un espace privé, accès à tes
        données limité à ton compte.
      </p>

      <h2>Cookies</h2>
      <p>
        Nous utilisons uniquement des cookies indispensables : rester connectée et mémoriser ta langue. Aucun
        cookie publicitaire.
      </p>

      <h2>Tes droits</h2>
      <p>
        Tu peux accéder à tes données, les faire rectifier, t&apos;opposer à leur traitement ou demander leur
        suppression en écrivant à <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> ou via la{" "}
        <Link href="/contact">page contact</Link>. Tu peux aussi saisir l&apos;Instance Nationale de Protection
        des Données Personnelles (INPDP, www.inpdp.tn).
      </p>
    </article>
  );
}
