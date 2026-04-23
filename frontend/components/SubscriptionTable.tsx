"use client";
import { TierConfig, stroopsToXlm, ledgersToDays } from "@/lib/contracts";

interface SubscriptionTableProps {
  tiers: TierConfig[];
  onEdit?: (tier: TierConfig) => void;
}

export default function SubscriptionTable({ tiers, onEdit }: SubscriptionTableProps) {
  if (tiers.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm" style={{color: "var(--muted)"}}>No tiers yet. Create your first subscription tier.</p>
      </div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{borderBottom: "1px solid var(--border)"}}>
              {["Tier", "Price", "Duration", "Status", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider"
                  style={{color: "var(--muted)"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => (
              <tr key={tier.id} style={{borderBottom: "1px solid rgba(26,40,64,0.5)"}}>
                <td className="px-5 py-4">
                  <p className="font-medium">{tier.name}</p>
                  <p className="text-xs mt-0.5" style={{color: "var(--muted)"}}>#{tier.id}</p>
                </td>
                <td className="px-5 py-4 font-mono font-semibold" style={{color: "var(--accent)"}}>
                  {stroopsToXlm(tier.price)} XLM
                </td>
                <td className="px-5 py-4" style={{color: "var(--muted)"}}>
                  {ledgersToDays(tier.duration_ledgers)}d
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs px-2 py-1 rounded-full font-medium"
                    style={tier.active
                      ? {background: "rgba(91,184,212,0.1)", color: "var(--accent)", border: "1px solid rgba(91,184,212,0.2)"}
                      : {background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)"}}>
                    {tier.active ? "Active" : "Paused"}
                  </span>
                </td>
                {onEdit && (
                  <td className="px-5 py-4">
                    <button onClick={() => onEdit(tier)} className="text-xs transition-colors"
                      style={{color: "var(--muted)"}}>Edit</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
