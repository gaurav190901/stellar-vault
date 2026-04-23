"use client";
import { useWallet } from "@/hooks/useWallet";
import { useDashboard } from "@/hooks/useContract";
import TierCard from "@/components/TierCard";
import WalletConnect from "@/components/WalletConnect";
import { isSubscriptionActive } from "@/lib/contracts";
import { useEffect, useState } from "react";

// A known funded testnet account to use for read-only simulations
const READ_ONLY_ADDR = "GC5HL2KXTCEXGZU4N6QIDQLIXW6HSFYEZV7ELAEEHDL4EHUMVSTZCPX6";

export default function SubscribePage() {
  const { address, isConnected } = useWallet();
  // Use the deployer address for read-only calls so tiers load even without wallet
  const readAddr = address || READ_ONLY_ADDR;
  const { tiers, loading } = useDashboard(readAddr);
  const [activeSubs, setActiveSubs] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!address || tiers.length === 0) return;
    const checkSubs = async () => {
      const results: Record<number, boolean> = {};
      for (const tier of tiers) {
        results[tier.id] = await isSubscriptionActive(address, address, tier.id);
      }
      setActiveSubs(results);
    };
    checkSubs();
  }, [address, tiers]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscription Tiers</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Subscribe on-chain and earn VAULT token rewards
        </p>
      </div>

      {!isConnected && (
        <div className="rounded-2xl bg-[#0d1526] border border-[#1e2d4a] p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="text-white font-medium">Connect wallet to subscribe</p>
            <p className="text-slate-400 text-sm mt-1">
              You need Freighter wallet to subscribe to tiers on Stellar Testnet.
            </p>
          </div>
          <WalletConnect />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-[#0d1526] border border-[#1e2d4a] p-6 h-52 animate-pulse" />
          ))}
        </div>
      ) : tiers.length === 0 ? (
        <div className="rounded-2xl bg-[#0d1526] border border-[#1e2d4a] p-12 text-center">
          <p className="text-slate-400">No subscription tiers available yet.</p>
          <p className="text-slate-600 text-sm mt-1">Check back soon or connect as a creator to create tiers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} isSubscribed={activeSubs[tier.id]} />
          ))}
        </div>
      )}

      {isConnected && (
        <div className="mt-4">
          <h2 className="text-lg font-bold text-white mb-4">My Subscriptions</h2>
          {Object.entries(activeSubs).filter(([, active]) => active).length === 0 ? (
            <div className="rounded-2xl bg-[#0d1526] border border-[#1e2d4a] p-6 text-center">
              <p className="text-slate-500 text-sm">No active subscriptions.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(activeSubs)
                .filter(([, active]) => active)
                .map(([tierId]) => {
                  const tier = tiers.find((t) => t.id === Number(tierId));
                  if (!tier) return null;
                  return (
                    <div key={tierId} className="rounded-2xl bg-[#0d1526] border border-emerald-500/20 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{tier.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Tier #{tierId}</p>
                      </div>
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        ✓ Active
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
