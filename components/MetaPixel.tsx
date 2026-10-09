"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { META_PIXEL_ID, pixelBaseSnippet } from "@/lib/meta-pixel";

type Fbq = (...args: unknown[]) => void;

function ensurePixel(): Fbq | null {
  if (!META_PIXEL_ID) return null;
  const w = window as unknown as { fbq?: Fbq };
  if (!w.fbq) {
    // Loads fbevents.js and records the first PageView.
    new Function(pixelBaseSnippet(META_PIXEL_ID))();
    return null;
  }
  return w.fbq;
}

/** Loads the Pixel on the auth pages and sends a PageView on each one. */
export function MetaPixel() {
  const pathname = usePathname();
  useEffect(() => {
    const fbq = ensurePixel();
    fbq?.("track", "PageView");
  }, [pathname]);
  return null;
}

/** Fires a single standard event once (e.g. CompleteRegistration). */
export function MetaPixelEvent({ event }: { event: string }) {
  useEffect(() => {
    ensurePixel();
    const w = window as unknown as { fbq?: Fbq };
    w.fbq?.("track", event);
  }, [event]);
  return null;
}
