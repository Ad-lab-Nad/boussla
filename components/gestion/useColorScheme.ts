"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(): "light" | "dark" {
  return window.matchMedia(QUERY).matches ? "dark" : "light";
}

function getServerSnapshot(): "light" | "dark" {
  return "light";
}

/** SSR-safe: renders "light" on the server and first client paint, then
 * syncs to the real system preference — avoids a hydration mismatch. */
export function useColorScheme(): "light" | "dark" {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
