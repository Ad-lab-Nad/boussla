// Public-facing site details, shown in the footer and the legal pages. One
// place to edit them — no code change needed elsewhere.

export const SITE = {
  name: "Flux",
  tagline: "La gestion simple qui te dit ce que tu gagnes vraiment.",
  url: "https://www.fluxtunisie.com",
  contactEmail: "contact@fluxtunisie.com",

  // Leave a link empty ("") to hide its icon in the footer.
  social: {
    instagram: "https://www.instagram.com/fluxtunisie",
    facebook: "https://www.facebook.com/fluxtunisie",
    linkedin: "", // à ajouter quand la page existe
    tiktok: "",
  },

  // Publisher details for Mentions légales / Confidentialité. Anything still
  // in [brackets] is a placeholder to fill in. taxId / registryId can stay
  // empty ("") until the business is registered — those lines are then
  // simply not shown.
  legal: {
    publisherName: "[Nom ou raison sociale]",
    legalForm: "Personne physique",
    address: "[Adresse postale complète]",
    taxId: "",
    registryId: "",
    director: "[Nom du/de la responsable de la publication]",
    lastUpdated: "5 octobre 2026",
  },
} as const;

export type SocialNetwork = keyof typeof SITE.social;
