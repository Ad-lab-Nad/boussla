// Shown instantly when moving between /gestion pages, while the server
// renders the next one — otherwise a menu tap looks like it did nothing.
export default function GestionLoading() {
  return (
    <div className="g-loading" aria-busy="true" aria-live="polite">
      <div className="g-loading-bar" />
      <div className="g-loading-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="g-card g-loading-block" />
        ))}
      </div>
      <div className="g-card g-loading-block g-loading-block--tall" />
    </div>
  );
}
