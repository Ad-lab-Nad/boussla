import Link from "next/link";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

/**
 * One card, two modes, driven purely by `locked`: unlocked renders
 * `children` normally (the same real content a Palier 2 account would see
 * elsewhere in the app — never a mockup), locked blurs it behind a
 * lock/CTA overlay. Currently only ever rendered with locked=true (from
 * Palier1Dashboard) — kept generic so the same component is ready to reuse
 * wherever an unlocked view is wired in later, without duplicating markup.
 */
export function UpsellPreviewCard({
  title,
  hint,
  locked,
  unlockLabel,
  children,
}: {
  title: string;
  hint?: string;
  locked: boolean;
  unlockLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className={`g-card ${locked ? "g-upsell-card" : ""}`}>
      <h2>{title}</h2>
      {hint && <div className="g-hint">{hint}</div>}
      <div className={locked ? "g-upsell-card__content" : undefined} aria-hidden={locked || undefined}>
        {children}
      </div>
      {locked && unlockLabel && (
        <div className="g-upsell-overlay">
          <span className="g-upsell-overlay__icon">
            <Lock size={16} />
          </span>
          <Link href="/gestion/abonnement" className="g-btn">
            {unlockLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
