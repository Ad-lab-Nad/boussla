// Content shapes for each HomepageBlock type, plus a defensive parser per
// type — `content` is untyped JSON at the database level, so every read
// falls back to sensible empty values instead of crashing if a field is
// ever missing or malformed (e.g. hand-edited in the database).

export type HeroContent = {
  title: string;
  subtitle: string;
  // The bold "Boussla te dit, chaque mois..." line.
  solutionText: string;
  ctaLabel: string;
  // When set, replaces the default illustration+dashboard-preview visual.
  imageUrl: string | null;
};

export function parseHeroContent(json: unknown): HeroContent {
  const c = (json ?? {}) as Partial<HeroContent>;
  return {
    title: typeof c.title === "string" ? c.title : "",
    subtitle: typeof c.subtitle === "string" ? c.subtitle : "",
    solutionText: typeof c.solutionText === "string" ? c.solutionText : "",
    ctaLabel: typeof c.ctaLabel === "string" ? c.ctaLabel : "",
    imageUrl: typeof c.imageUrl === "string" ? c.imageUrl : null,
  };
}

export type ArgumentaireContent = {
  sectionTitle: string;
  text: string;
  imageUrl: string | null;
};

export function parseArgumentaireContent(json: unknown): ArgumentaireContent {
  const c = (json ?? {}) as Partial<ArgumentaireContent>;
  return {
    sectionTitle: typeof c.sectionTitle === "string" ? c.sectionTitle : "",
    text: typeof c.text === "string" ? c.text : "",
    imageUrl: typeof c.imageUrl === "string" ? c.imageUrl : null,
  };
}

export type Offer = { name: string; price: string; features: string[]; ctaLabel: string };

export type OffresContent = { offers: Offer[] };

function parseOffer(json: unknown): Offer {
  const o = (json ?? {}) as Partial<Offer>;
  return {
    name: typeof o.name === "string" ? o.name : "",
    price: typeof o.price === "string" ? o.price : "",
    features: Array.isArray(o.features) ? o.features.filter((f) => typeof f === "string") : [],
    ctaLabel: typeof o.ctaLabel === "string" ? o.ctaLabel : "Essayer gratuitement",
  };
}

const EMPTY_OFFER: Offer = { name: "", price: "", features: [], ctaLabel: "Essayer gratuitement" };

/** Always returns exactly 3 offers (Limitée/Développée/VIP), padding with
 * empty ones if the stored content is somehow short. */
export function parseOffresContent(json: unknown): OffresContent {
  const c = (json ?? {}) as Partial<OffresContent>;
  const raw = Array.isArray(c.offers) ? c.offers.map(parseOffer) : [];
  const offers = [0, 1, 2].map((i) => raw[i] ?? EMPTY_OFFER);
  return { offers };
}

export type Testimonial = { quote: string; name: string; photoUrl: string | null };

export type TemoignagesContent = { items: Testimonial[] };

function parseTestimonial(json: unknown): Testimonial {
  const t = (json ?? {}) as Partial<Testimonial>;
  return {
    quote: typeof t.quote === "string" ? t.quote : "",
    name: typeof t.name === "string" ? t.name : "",
    photoUrl: typeof t.photoUrl === "string" ? t.photoUrl : null,
  };
}

export function parseTemoignagesContent(json: unknown): TemoignagesContent {
  const c = (json ?? {}) as Partial<TemoignagesContent>;
  return { items: Array.isArray(c.items) ? c.items.map(parseTestimonial) : [] };
}
