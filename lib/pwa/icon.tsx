import { ImageResponse } from "next/og";

// Matches .g-brand__mark's colors exactly (components/gestion/GestionChrome.tsx
// / app/gestion/gestion.css) so the installed app icon is the same mark
// users already see in the app itself.
const BRAND_BLUE = "#2a78d6";

export function renderAppIcon(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND_BLUE,
          color: "#fff",
          fontWeight: 700,
          fontSize: size * 0.56,
          fontFamily: "sans-serif",
        }}
      >
        B
      </div>
    ),
    { width: size, height: size }
  );
}
