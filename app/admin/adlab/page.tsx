import { WaLandingStats, type StatsSearchParams } from "@/components/WaLandingStats";

// Flux Ad Lab (/adlab) audience: who comes, from where, and who taps a
// WhatsApp button.

const BUTTON_LABELS: Record<string, string> = {
  "adlab-nav": "Menu · Mini-audit offert",
  "adlab-hero": "Haut de page · Mon mini-audit offert",
  "adlab-proof": "Preuve · Je veux ce résultat",
  "adlab-tier1": "Formule Essentiel",
  "adlab-tier2": "Formule Croissance",
  "adlab-tier3": "Formule Performance",
  "adlab-audit": "Bandeau · Mini-audit (Je le veux)",
  "adlab-final": "Bas de page",
  "adlab-sticky": "Bouton fixe (mobile)",
  whatsapp: "Autre lien WhatsApp",
};

export default function AdLabStatsPage({ searchParams }: { searchParams: StatsSearchParams }) {
  return <WaLandingStats path="/adlab" buttonLabels={BUTTON_LABELS} pixelEvent="Planifier" searchParams={searchParams} />;
}
