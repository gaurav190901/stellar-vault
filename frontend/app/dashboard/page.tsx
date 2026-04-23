"use client";
import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useDashboard } from "@/hooks/useContract";
import StatCard from "@/components/StatCard";
import SubscriptionTable from "@/components/SubscriptionTable";
import RevenueChart from "@/components/RevenueChart";
import CreateTierModal from "@/components/CreateTierModal";
import WalletConnect from "@/components/WalletConnect";
import { TierConfig, CONTRACTS } from "@/lib/contracts";

export default function DashboardPage() {
  const { address, isConnected } = useWallet();
  const { stats, tiers, loading, error, refresh } = useDashboard(address);
  const [showCreate, setShowCreate] = useState(false);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="text-4xl" style={{color: "var(--accent)"}}>◈</div>
        <div>
          <h2 className="text-xl font-bold mb-2">Connect your wallet</h2>
          <p className="text-sm mb-6" style={{color: "var(--muted)"}}>Connect Freighter to view your creator dashboard.</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  const deployed = CONTRACTS.subscriptionManager.length > 10;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm mt-0.5" style={{color: "var(--muted)"}}>Manage your subscription tiers and revenue</p>
        </div>
        <button onClick={() => setShowCreate(true)} disabled={!deployed}
          className="btn-primary disabled:opacity-40">
          + Create Tier
        </button>
      </div>

      {!deployed && (
        <div className="card p-4 text-sm" style={{borderColor: "rgba(251,191,36,0.3)", color: "#fbbf24"}}>
          ⚠ Contracts not deployed. Run <code className="px-1 rounded text-xs" style={{background: "rgba(0,0,0,0.3)"}}>bash scripts/deploy.sh</code> first.
        </div>
      )}
      {error && (
        <div className="card p-4 text-sm" style={{borderColor: "rgba(248,113,113,0.3)", color: "#f87171"}}>{error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Subscribers" value={loading ? "—" : stats.totalSubscribers} icon="◎" />
        <StatCard label="Active Tiers" value={loading ? "—" : stats.tierCount} icon="◈" />
        <StatCard label="VAULT Balance" value={loading ? "—" : stats.vaultBalance} sub="tokens" icon="✦" />
        <StatCard label="XLM Balance" value={loading ? "—" : `${stats.xlmBalance} XLM`} icon="⟁" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Subscription Tiers</h2>
            <button onClick={refresh} className="text-xs transition-colors" style={{color: "var(--muted)"}}>↻ Refresh</button>
          </div>
          <SubscriptionTable tiers={tiers} onEdit={(t: TierConfig) => console.log("edit", t)} />
        </div>
        <RevenueChart />
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-4">Recent Subscriptions</h2>
        {tiers.length === 0 ? (
          <p className="text-sm text-center py-4" style={{color: "var(--muted)"}}>No subscriptions yet</p>
        ) : (
          <div className="flex flex-col gap-3">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2"
                style={{borderBottom: "1px solid var(--border)"}}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                    style={{background: "rgba(91,184,212,0.1)", color: "var(--accent)"}}>◎</div>
                  <div>
                    <p className="text-sm font-mono">G...{(i*1234).toString().padStart(4,"0")}</p>
                    <p className="text-xs" style={{color: "var(--muted)"}}>Tier #{i-1}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full"
                  style={{background: "rgba(91,184,212,0.1)", color: "var(--accent)", border: "1px solid rgba(91,184,212,0.2)"}}>
                  Active
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateTierModal onClose={() => setShowCreate(false)} onSuccess={refresh} />}
    </div>
  );
}
