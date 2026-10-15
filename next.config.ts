import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // app/route.ts reads the static landing page from disk at request time —
  // make sure the file ships with the deployed server function.
  outputFileTracingIncludes: {
    "/": ["./landing/index.html"],
    "/ar": ["./landing/ar.html"],
    "/adlab": ["./landing/adlab.html"],
  },

  // Site layout: public landing at "/", the app under /gestion (dashboard),
  // /login + /signup for auth, /admin for the back office — all on one
  // domain so the login cookie is shared. /app is a short, memorable alias
  // for the app (signed-out visitors land on /login via the proxy).
  // Browser-side protections on every page: no framing by other sites
  // (clickjacking), no MIME sniffing, no full URLs leaked to other sites,
  // and no camera/microphone/location access the app never needs.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: "/app", destination: "/gestion", permanent: false },
      { source: "/app/:path*", destination: "/gestion/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
