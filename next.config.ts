import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // app/route.ts reads the static landing page from disk at request time —
  // make sure the file ships with the deployed server function.
  outputFileTracingIncludes: {
    "/": ["./landing/index.html"],
  },

  // Site layout: public landing at "/", the app under /gestion (dashboard),
  // /login + /signup for auth, /admin for the back office — all on one
  // domain so the login cookie is shared. /app is a short, memorable alias
  // for the app (signed-out visitors land on /login via the proxy).
  async redirects() {
    return [
      { source: "/app", destination: "/gestion", permanent: false },
      { source: "/app/:path*", destination: "/gestion/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
