import { WaLandingStats, type StatsSearchParams } from "@/components/WaLandingStats";

// Meta Ads training (/formation) audience: who comes, from where, and who
// taps a WhatsApp button to book.

const BUTTON_LABELS: Record<string, string> = {
  "formation-nav": "Menu · Réserver ma place",
  "formation-hero": "Haut de page · Je réserve ma place",
  "formation-goal": "Résultat · Je veux atteindre mon objectif",
  "formation-one": "Formule One-to-one",
  "formation-groupe": "Formule En groupe",
  "formation-consult": "Formule Consultation",
  "formation-final": "Bas de page",
  "formation-sticky": "Bouton fixe (mobile)",
  whatsapp: "Autre lien WhatsApp",
};

export default function FormationStatsPage({ searchParams }: { searchParams: StatsSearchParams }) {
  return <WaLandingStats path="/formation" buttonLabels={BUTTON_LABELS} pixelEvent="InitiateCheckout" searchParams={searchParams} />;
}
