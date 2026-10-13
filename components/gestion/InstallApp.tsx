"use client";

import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";

// Flux is already installable (app/manifest.ts) but nobody knew. Chrome
// fires `beforeinstallprompt` once, early — InstallCapture (mounted in the
// gestion layout) keeps it until the dashboard card asks for it.

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
type InstallWindow = Window & { __fxInstall?: InstallEvent | null };
const READY = "fx-install-ready";
const DISMISSED_KEY = "fx_install_card_closed";

export function InstallCapture() {
  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault();
      (window as InstallWindow).__fxInstall = e as InstallEvent;
      window.dispatchEvent(new Event(READY));
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);
  return null;
}

function isInstalled(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

/** "Garde Flux sur ton téléphone": the real install button on Android
 * Chrome, the two Share-menu steps on iPhone Safari, nothing elsewhere or
 * once installed. Closing it hides it for good on this device. */
export function InstallAppCard() {
  const { t } = useLocale();
  const [mode, setMode] = useState<"none" | "prompt" | "ios">("none");

  useEffect(() => {
    const decide = () => {
      try {
        if (localStorage.getItem(DISMISSED_KEY)) return;
      } catch {
        // No storage: show it anyway.
      }
      if (isInstalled()) return;
      if ((window as InstallWindow).__fxInstall) setMode("prompt");
      else if (isIosSafari()) setMode("ios");
    };
    const frame = requestAnimationFrame(decide);
    window.addEventListener(READY, decide);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(READY, decide);
    };
  }, []);

  function close() {
    setMode("none");
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Not remembered — it may come back next visit.
    }
  }

  async function install() {
    const w = window as InstallWindow;
    const e = w.__fxInstall;
    if (!e) return;
    await e.prompt();
    const { outcome } = await e.userChoice;
    w.__fxInstall = null;
    if (outcome === "accepted") close();
  }

  if (mode === "none") return null;
  return (
    <div className="g-card g-install">
      <span className="g-install__icon" aria-hidden="true">
        <Smartphone size={22} />
      </span>
      <div className="g-install__body">
        <h2>{t("gestion.install.title")}</h2>
        <p>{mode === "ios" ? t("gestion.install.iosSteps") : t("gestion.install.text")}</p>
        {mode === "prompt" && (
          <button type="button" className="g-btn" onClick={install}>
            {t("gestion.install.button")}
          </button>
        )}
      </div>
      <button type="button" className="g-install__close" onClick={close} aria-label={t("gestion.install.later")}>
        <X size={16} />
      </button>
    </div>
  );
}
