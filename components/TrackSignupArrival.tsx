"use client";

import { useEffect } from "react";

// Records that a visitor reached the sign-up page (a PageVisit with path
// "/signup"), using the same anonymous localStorage id as the landing-page
// beacon — so /admin/visites can count real arrivals on the form, whatever
// browser the click came from (e.g. the Facebook/Instagram in-app one).
export function TrackSignupArrival() {
  useEffect(() => {
    let vid: string | null = null;
    try {
      vid = localStorage.getItem("fx_vid");
      if (!vid) {
        vid = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem("fx_vid", vid);
      }
    } catch {
      vid = `nostore-${Math.random().toString(36).slice(2)}`;
    }
    const q = new URLSearchParams(location.search);
    fetch("/api/visit", {
      method: "POST",
      keepalive: true,
      body: JSON.stringify({
        vid,
        path: "/signup",
        ref: document.referrer,
        us: q.get("utm_source"),
        um: q.get("utm_medium"),
        uc: q.get("utm_campaign"),
        fb: q.has("fbclid"),
      }),
    }).catch(() => {});
  }, []);
  return null;
}
