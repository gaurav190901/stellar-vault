interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
}

export default function StatCard({ label, value, sub, icon }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider" style={{color: "var(--muted)"}}>{label}</p>
        <span className="text-lg" style={{color: "var(--accent)", opacity: 0.7}}>{icon}</span>
      </div>
      <p className="text-2xl font-bold" style={{color: "var(--text)"}}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{color: "var(--muted)"}}>{sub}</p>}
    </div>
  );
}
