// Recharts renders raw SVG attribute values, which don't reliably resolve
// CSS custom properties across browsers — so charts need the actual hex
// values in JS. These mirror the tokens in app/gestion/gestion.css exactly;
// keep the two in sync if the palette ever changes.
export const CHART_COLORS = {
  light: {
    blue: "#2a78d6",
    orange: "#eb6834",
    aqua: "#1baf7a",
    ink: "#0b0b0b",
    ink2: "#52514e",
    muted: "#898781",
    grid: "#e1e0d9",
    axis: "#c3c2b7",
    surface: "#fcfcfb",
  },
  dark: {
    blue: "#3987e5",
    orange: "#d95926",
    aqua: "#199e70",
    ink: "#ffffff",
    ink2: "#c3c2b7",
    muted: "#898781",
    grid: "#2c2c2a",
    axis: "#383835",
    surface: "#1a1a19",
  },
} as const;
