import { ImageResponse } from "next/og";

// Flux brand colors, sampled from the logo (public/brand/flux-logo.png):
// navy "flu" letters, orange X and its corner brackets.
const BRAND_NAVY = "#102751";
const BRAND_ORANGE = "#ffab15";
const BRAND_ORANGE_DEEP = "#fe9a08";

/** The logo's bracketed X on navy — the wordmark itself is unreadable at
 * favicon size, so the icon keeps just its distinctive mark. */
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
          background: BRAND_NAVY,
        }}
      >
        <svg width={size} height={size} viewBox="0 0 100 100">
          <defs>
            <linearGradient id="x" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={BRAND_ORANGE} />
              <stop offset="1" stopColor={BRAND_ORANGE_DEEP} />
            </linearGradient>
          </defs>
          <g fill="none" stroke={BRAND_ORANGE} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 32V25a5 5 0 0 1 5-5h7" />
            <path d="M68 20h7a5 5 0 0 1 5 5v7" />
            <path d="M80 68v7a5 5 0 0 1-5 5h-7" />
            <path d="M32 80h-7a5 5 0 0 1-5-5v-7" />
          </g>
          <g stroke="url(#x)" strokeWidth="13" strokeLinecap="round">
            <path d="M35 35L65 65" />
            <path d="M65 35L35 65" />
          </g>
        </svg>
      </div>
    ),
    { width: size, height: size }
  );
}
