"use client";

import { useEffect } from "react";

// Root-level error boundary — catches failures from every nested page and
// layout (Gestion, Admin, the public homepage), including the retried-but-
// still-failing database connection errors from lib/prisma.ts. Inline
// styles only: this can render before any nested layout's CSS (gestion.css,
// landing.css) has loaded, since the failure may have happened in that very
// layout.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        textAlign: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0, color: "#0b0b0b" }}>
        Un problème temporaire est survenu
      </h1>
      <p style={{ color: "#6b6b66", maxWidth: 420, margin: 0, lineHeight: 1.5 }}>
        La connexion a été interrompue un instant. Réessaie — ça se résout généralement tout seul
        en quelques secondes.
      </p>
      <button
        onClick={() => reset()}
        style={{
          background: "#2a78d6",
          color: "#fff",
          border: "none",
          borderRadius: 9,
          padding: "10px 22px",
          fontWeight: 600,
          fontSize: "0.9rem",
          cursor: "pointer",
        }}
      >
        Réessayer
      </button>
    </div>
  );
}
