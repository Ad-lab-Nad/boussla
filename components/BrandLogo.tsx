// The Flux wordmark. Both variants are in the DOM and CSS shows one
// (.brand-logo rules in app/globals.css), keyed on prefers-color-scheme —
// the same signal that drives the app's own dark theme. A <picture> source
// swap only re-evaluated on reload, so switching the OS theme live left the
// navy "flu" on a black background. Source art: public/brand/.
export function BrandLogo({ height = 28, className }: { height?: number; className?: string }) {
  // 385x160 is the files' intrinsic size — keeps the aspect ratio exact.
  const width = Math.round((height * 385) / 160);
  return (
    <span className={`brand-logo ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static PNGs, no optimization needed */}
      <img className="brand-logo__light" src="/brand/flux-logo.png" alt="Flux" width={width} height={height} />
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static PNGs, no optimization needed */}
      <img className="brand-logo__dark" src="/brand/flux-logo-dark.png" alt="Flux" width={width} height={height} />
    </span>
  );
}
