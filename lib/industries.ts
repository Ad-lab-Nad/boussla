// The one-tap "what's your field?" answer (User.industry), asked on the
// dashboard and broken down in the back office. Order = display order.
export const INDUSTRIES = [
  { key: "FOOD", emoji: "🍽️" },
  { key: "CRAFTS", emoji: "🎁" },
  { key: "TEXTILE", emoji: "🧵" },
  { key: "FASHION", emoji: "👗" },
  { key: "BEAUTY", emoji: "🌸" },
  { key: "SERVICES", emoji: "🛠️" },
  { key: "OTHER", emoji: "🛒" },
] as const;

export type IndustryKey = (typeof INDUSTRIES)[number]["key"];

/** A stored value as one of the keys — including the free text the old
 * signup form collected ("Alimentaire"); null = not answered yet. */
export function normalizeIndustry(value: string | null | undefined): IndustryKey | null {
  if (!value) return null;
  if (INDUSTRIES.some((i) => i.key === value)) return value as IndustryKey;
  if (/aliment/i.test(value)) return "FOOD";
  return "OTHER";
}
