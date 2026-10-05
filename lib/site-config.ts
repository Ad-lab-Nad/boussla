// Public-facing site details, shown in the footer and the legal pages. One
// place to edit them — no code change needed elsewhere.

export const SITE = {
  name: "Flux",
  tagline: "La gestion simple qui te dit ce que tu gagnes vraiment.",
  url: "https://www.fluxtunisie.com",
  contactEmail: "contact@fluxtunisie.com",

  // Leave a link empty ("") to hide its icon in the footer.
  social: {
    instagram: "#", // TODO: lien réel
    facebook: "#", // TODO: lien réel
    linkedin: "#", // TODO: lien réel
    tiktok: "",
  },

  // Publisher details for Mentions légales / Confidentialité. Anything still
  // in [brackets] is a placeholder to fill in before the pages go live.
  legal: {
    publisherName: "[Nom ou raison sociale]",
    legalForm: "[Forme juridique — ex. personne physique, SUARL]",
    address: "[Adresse postale complète]",
    taxId: "[Matricule fiscal]",
    registryId: "[Identifiant RNE]",
    director: "[Nom du/de la responsable de la publication]",
    lastUpdated: "5 octobre 2026",
  },
} as const;

export type SocialNetwork = keyof typeof SITE.social;
