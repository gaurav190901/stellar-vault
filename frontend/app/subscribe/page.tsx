"use client";
import { useWallet } from "@/hooks/useWallet";
import { useDashboard } from "@/hooks/useContract";
import TierCard from "@/components/TierCard";
import WalletConnect from "@/components/WalletConnect";
import {
  isSubscriptionActive,
  getSubscription,
  getCurrentLedger,
  ledgerToEstimatedDate,
  renewSubscription,
  SubscriptionRecord,
} from "@/lib/contracts";
import { useEffect, useState, useCallback } from "react";

// A known funded testnet account to use for read-only simulations
const READ_ONLY_ADDR = "GC5HL2KXTCEXGZU4N6QIDQLIXW6HSFYEZV7ELAEEHDL4EHUMVSTZCPX6";

export default function SubscribePage() {
  const { address, isConnected, signTx } = useWallet();
  // Always use the real address when connected so tiers and subs reflect the
  // actual wallet — fall back to read-only only when no wallet is present.
  const readAddr = address || READ_ONLY_ADDR;
  const { tiers, loading } = useDashboard(readAddr);
  const [activeSubs, setActiveSubs] = useState<Record<number, boolean>>({});
  const [subRecords, setSubRecords] = useState<Record<number, SubscriptionRecord>>({});
  const [currentLedger, setCurrentLedger] = useState(0);
  const [renewStatus, setRenewStatus] = useState<Record<number, "idle" | "pending" | "success" | "error">>({});

  const checkSubs = useCallback(async () => {
    if (!address || tiers.length === 0) return;
    // Fetch active status and subscription records in parallel
    const [ledger, ...subChecks] = await Promise.all([
      getCurrentLedger(),
      ...tiers.map((tier) => isSubscriptionActive(address, address, tier.id)),
    ]);
    setCurrentLedger(ledger as number);

    const results: Record<number, boolean> = {};
    tiers.forEach((tier, i) => {
      results[tier.id] = subChecks[i] as boolean;
    });
    setActiveSubs(results);

    // Fetch full records for active subs in parallel
    const activeIds = tiers.filter((t) => results[t.id]);
    const records = await Promise.all(
      activeIds.map((t) => getSubscription(address, address, t.id))
    );
    const recordMap: Record<number, SubscriptionRecord> = {};
    activeIds.forEach((t, i) => {
      if (records[i]) recordMap[t.id] = records[i]!;
    });
    setSubRecords(recordMap);
  }, [address, tiers]);

  useEffect(() => {
    checkSubs();
  }, [checkSubs]);

  const handleRenew = async (tierId: number) => {
    if (!address) return;
    setRenewStatus((s) => ({ ...s, [tierId]: "pending" }));
    try {
      await renewSubscription(address, tierId, signTx);
      setRenewStatus((s) => ({ ...s, [tierId]: "success" }));
      await checkSubs();
    } catch {
      setRenewStatus((s) => ({ ...s, [tierId]: "error" }));
    }
  };

  const getExpiryInfo = (tierId: number) => {
    const record = subRecords[tierId];
    if (!record || currentLedger === 0) return null;
    const expiryDate = ledgerToEstimatedDate(record.expiry_ledger, currentLedger);
    const msLeft = expiryDate.getTime() - Date.now();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    return { expiryDate, daysLeft };
  };

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
            <TierCard
              key={tier.id}
              tier={tier}
              isSubscribed={activeSubs[tier.id]}
              onSubscribeSuccess={checkSubs}
            />
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
                  const expiry = getExpiryInfo(Number(tierId));
                  const isExpiringSoon = expiry && expiry.daysLeft <= 3 && expiry.daysLeft > 0;
                  const isExpired = expiry && expiry.daysLeft <= 0;
                  const status = renewStatus[Number(tierId)] ?? "idle";

                  return (
                    <div
                      key={tierId}
                      className="rounded-2xl bg-[#0d1526] border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      style={{
                        borderColor: isExpiringSoon || isExpired
                          ? "rgba(251,191,36,0.3)"
                          : "rgba(52,211,153,0.2)",
                      }}
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">{tier.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Tier #{tierId}</p>
                        {expiry && (
                          <p
                            className="text-xs mt-1"
                            style={{
                              color: isExpired
                                ? "#f87171"
                                : isExpiringSoon
                                ? "#fbbf24"
                                : "#6b8299",
                            }}
                          >
                            {isExpired
                              ? "⚠ Expired — renew to restore access"
                              : isExpiringSoon
                              ? `⚠ Expires in ${expiry.daysLeft} day${expiry.daysLeft === 1 ? "" : "s"}`
                              : `Expires ${expiry.expiryDate.toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {(isExpiringSoon || isExpired) && (
                          <button
                            onClick={() => handleRenew(Number(tierId))}
                            disabled={status === "pending"}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity disabled:opacity-50"
                            style={{
                              background: "rgba(251,191,36,0.15)",
                              color: "#fbbf24",
                              border: "1px solid rgba(251,191,36,0.3)",
                            }}
                          >
                            {status === "pending" ? "Renewing..." : status === "success" ? "✓ Renewed" : "Renew"}
                          </button>
                        )}
                        <span
                          className="text-xs bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"
                          style={{ color: isExpired ? "#f87171" : "#34d399" }}
                        >
                          {isExpired ? "Expired" : "✓ Active"}
                        </span>
                      </div>
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
