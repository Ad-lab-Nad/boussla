import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Boussla",
    short_name: "Boussla",
    description: "Sais-tu vraiment combien tu gagnes ce mois-ci ? Gestion simple pour petites activités.",
    start_url: "/gestion",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2a78d6",
    lang: "fr",
    icons: [
      { src: "/manifest-icon-192", sizes: "192x192", type: "image/png" },
      { src: "/manifest-icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
