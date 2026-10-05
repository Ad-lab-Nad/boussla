import { prisma } from "@/lib/prisma";
import { TIER_PRICING } from "@/lib/subscription";

// Starter content, created once when homepage_blocks is empty (fresh
// database, or the table got wiped) — the /admin/accueil editor can only
// edit existing blocks, never create them, so an empty table would
// otherwise mean a blank public homepage with no way to fix it from the UI.
function defaultBlocks() {
  return [
    {
      type: "HERO" as const,
      order: 0,
      active: true,
      content: {
        title: "Sais-tu vraiment combien tu gagnes ce mois-ci ?",
        subtitle:
          "Entre les commandes, le stock et les dépenses, la gestion prend vite le dessus. Résultat : tes vrais chiffres — ce qu'il te reste une fois tout payé — arrivent toujours en dernier, quand il est trop tard pour réagir.",
        solutionText:
          "Flux te dit, chaque mois, combien ton activité gagne réellement — sans tableur, sans prise de tête.",
        ctaLabel: "Essayer gratuitement",
        imageUrl: null,
      },
    },
    {
      type: "OFFRES" as const,
      order: 1,
      active: true,
      content: {
        offers: [
          {
            name: "Palier 1",
            price: `${TIER_PRICING.PALIER_1.monthly} DT/mois`,
            features: [
              "Saisie rapide d'une vente",
              "Dépenses avec bascule pro/perso",
              "Le chiffre du mois : ce que vous gagnez vraiment",
              "1 mois d'essai gratuit",
            ],
            ctaLabel: "Essayer gratuitement",
          },
          {
            name: "Palier 2",
            price: `${TIER_PRICING.PALIER_2.monthly} DT/mois`,
            features: [
              "Tout le Palier 1",
              "Tableau de bord complet et analyse sur l'année",
              "Suivi des impayés, du stock et des commandes",
              "1 mois d'essai gratuit",
            ],
            ctaLabel: "Essayer gratuitement",
          },
          {
            name: "Palier 3",
            price: "Bientôt",
            features: ["À compléter"],
            ctaLabel: "Essayer gratuitement",
          },
        ],
      },
    },
    {
      type: "ARGUMENTAIRE" as const,
      order: 2,
      active: false,
      content: { sectionTitle: "", text: "", imageUrl: null },
    },
    {
      type: "TEMOIGNAGES" as const,
      order: 3,
      active: false,
      content: { items: [] },
    },
  ];
}

async function ensureHomepageBlocks() {
  if ((await prisma.homepageBlock.count()) > 0) return;
  // Two simultaneous first visits could both seed (there's no unique key on
  // type) — a duplicate block is harmless and editable, unlike a blank page.
  await prisma.homepageBlock.createMany({ data: defaultBlocks() });
}

/** All blocks (active or not), for the admin list. */
export async function getAllHomepageBlocks() {
  await ensureHomepageBlocks();
  return prisma.homepageBlock.findMany({ orderBy: { order: "asc" } });
}

/** Active blocks only, for the public homepage. */
export async function getActiveHomepageBlocks() {
  await ensureHomepageBlocks();
  return prisma.homepageBlock.findMany({ where: { active: true }, orderBy: { order: "asc" } });
}
