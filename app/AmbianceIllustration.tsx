// A flat, illustrated "calm morning desk" scene (phone, coffee, resting
// hands) — not a real photograph. See LandingPage.tsx for why: no vetted
// royalty-free photo source is wired into this environment, so an
// on-brand illustration stands in rather than risking an unlicensed image.
export function AmbianceIllustration() {
  return (
    <svg
      viewBox="0 0 640 360"
      className="l-ambiance-svg"
      role="img"
      aria-label="Illustration d'un bureau calme : téléphone, tasse de café et mains posées à proximité"
    >
      <defs>
        <clipPath id="frame">
          <rect x="0" y="0" width="640" height="360" rx="28" />
        </clipPath>
      </defs>

      <g clipPath="url(#frame)">
        {/* desk background */}
        <rect x="0" y="0" width="640" height="360" fill="#FBF1E3" />
        <circle cx="540" cy="55" r="150" fill="#FFE9BE" opacity="0.55" />
        <circle cx="30" cy="330" r="120" fill="#E4F1EC" opacity="0.5" />

        {/* small plant, bottom-left */}
        <path d="M52 320 L100 320 L92 270 L60 270 Z" fill="#C9B08C" />
        <ellipse cx="60" cy="250" rx="16" ry="24" fill="#6FA277" transform="rotate(-20 60 250)" />
        <ellipse cx="78" cy="240" rx="16" ry="26" fill="#82B78A" />
        <ellipse cx="94" cy="252" rx="15" ry="23" fill="#6FA277" transform="rotate(20 94 252)" />

        {/* phone, viewed from above */}
        <rect x="232" y="46" width="132" height="252" rx="24" fill="#2B2925" />
        <rect x="244" y="60" width="108" height="224" rx="14" fill="#E8F1FB" />
        <rect x="284" y="56" width="28" height="4" rx="2" fill="#4A463F" />
        {/* mini "dashboard" on screen — a nod to the real product */}
        <rect x="256" y="76" width="38" height="20" rx="5" fill="#CFE0F5" />
        <rect x="300" y="76" width="38" height="20" rx="5" fill="#CFE0F5" />
        <polyline
          points="256,220 272,205 288,212 304,178 320,190 338,150"
          fill="none"
          stroke="#2A78D6"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="338" cy="150" r="5" fill="#2A78D6" />

        {/* coffee cup, viewed from above */}
        <circle cx="452" cy="238" r="72" fill="#FFFDF8" stroke="#E4D5BE" strokeWidth="2" />
        <circle cx="452" cy="238" r="50" fill="#FBF6EC" stroke="#D9C7A8" strokeWidth="2" />
        <ellipse cx="452" cy="238" rx="38" ry="37" fill="#6B4630" />
        <ellipse cx="440" cy="226" rx="12" ry="7" fill="#8A5D40" opacity="0.6" />
        <path
          d="M500 220 C 516 222, 516 250, 500 253"
          fill="none"
          stroke="#D9C7A8"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M436 178 C 432 168, 440 164, 436 154"
          fill="none"
          stroke="#D9C7A8"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M456 174 C 452 164, 460 160, 456 150"
          fill="none"
          stroke="#D9C7A8"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* left hand, resting near the phone — sleeve + neutral stylized hand */}
        <path
          d="M118 360 L118 300 C118 272, 158 260, 186 268 C206 274, 214 292, 210 312 L206 360 Z"
          fill="#9BB4C9"
        />
        <path
          d="M170 300 C168 282, 196 274, 212 286 C224 296, 224 316, 214 330 C 200 344, 176 336, 170 318 Z"
          fill="#D9A876"
        />
        <rect x="176" y="272" width="14" height="34" rx="7" fill="#D9A876" transform="rotate(-8 183 289)" />
        <rect x="194" y="270" width="14" height="38" rx="7" fill="#D9A876" transform="rotate(2 201 289)" />
        <rect x="212" y="276" width="13" height="34" rx="6.5" fill="#D9A876" transform="rotate(12 218 293)" />

        {/* right hand, resting near the cup */}
        <path
          d="M560 360 L560 296 C560 268, 520 256, 492 266 C472 274, 466 294, 472 314 L478 360 Z"
          fill="#D3937A"
        />
        <path
          d="M470 296 C466 278, 494 268, 512 280 C526 290, 528 310, 518 324 C504 340, 478 332, 470 314 Z"
          fill="#D9A876"
        />
        <rect x="474" y="264" width="13" height="34" rx="6.5" fill="#D9A876" transform="rotate(10 480 281)" />
        <rect x="492" y="260" width="14" height="38" rx="7" fill="#D9A876" transform="rotate(-2 499 279)" />
        <rect x="510" y="266" width="14" height="34" rx="7" fill="#D9A876" transform="rotate(-14 517 283)" />
      </g>
    </svg>
  );
}
