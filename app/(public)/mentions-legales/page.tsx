import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = { title: "Mentions légales — Flux" };

export default function MentionsLegalesPage() {
  const L = SITE.legal;
  return (
    <article className="l-legal">
      <h1 className="l-page__title">Mentions légales</h1>
      <p className="l-legal__updated">Dernière mise à jour : {L.lastUpdated}</p>

      <h2>Éditeur du site</h2>
      <p>
        Le site {SITE.url.replace("https://", "")} et l&apos;application {SITE.name} sont édités par :
        <br />
        {L.publisherName} — {L.legalForm}
        <br />
        {L.address}
        <br />
        {L.taxId && (
          <>
            Matricule fiscal : {L.taxId}
            <br />
          </>
        )}
        {L.registryId && (
          <>
            RNE : {L.registryId}
            <br />
          </>
        )}
        Email : <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
      </p>
      <p>Responsable de la publication : {L.director}</p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
        (vercel.com). Les données de l&apos;application sont stockées par Supabase Inc. sur des serveurs
        situés dans l&apos;Union européenne (Irlande).
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        La marque {SITE.name}, son logo, les textes, visuels et le code de l&apos;application sont la propriété
        de l&apos;éditeur. Toute reproduction ou réutilisation sans autorisation écrite préalable est interdite.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Le traitement de tes données est décrit dans notre{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>
    </article>
  );
}
