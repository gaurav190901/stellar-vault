export default function Loading() {
  return (
    <div className="min-h-[55vh] flex items-center justify-center" aria-live="polite" aria-busy="true">
      <div className="card px-6 py-5 flex items-center gap-3">
        <span className="loading-orbit" aria-hidden="true" />
        <span className="text-sm" style={{ color: "var(--muted)" }}>Loading StellarVault…</span>
      </div>
    </div>
  );
}
