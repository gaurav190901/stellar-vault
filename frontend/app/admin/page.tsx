"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import WalletConnect from "@/components/WalletConnect";
import TransactionStatus from "@/components/TransactionStatus";
import { getSplits, updateSplits, getRewardRate, updateRewardRate } from "@/lib/contracts";
import { trackEvent } from "@/lib/telemetry";

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "";

export default function AdminPage() {
  const { address, isConnected, signTx } = useWallet();
  const [splits, setSplits] = useState([
    { address: "", basisPoints: 7000 },
    { address: "", basisPoints: 2000 },
    { address: "", basisPoints: 1000 },
  ]);
  const [rewardRate, setRewardRate] = useState("100");
  const [saved, setSaved] = useState(false);
  const [rateSaved, setRateSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txError, setTxError] = useState("");

  const isAdmin = isConnected && (!ADMIN_ADDRESS || address === ADMIN_ADDRESS);

  useEffect(() => {
    async function loadData() {
      if (!address) return;
      setLoading(true);
      try {
        const [fetchedSplits, fetchedRate] = await Promise.all([
          getSplits(address),
          getRewardRate(address),
        ]);
        if (fetchedSplits && fetchedSplits.length > 0) {
          setSplits(fetchedSplits);
        }
        if (fetchedRate > 0) {
          setRewardRate(fetchedRate.toString());
        }
      } catch (err) {
        console.error("Failed to load on-chain splits/rates", err);
      } finally {
        setLoading(false);
      }
    }
    if (isAdmin) {
      loadData();
    }
  }, [address, isAdmin]);

  const totalBp = splits.reduce((a, s) => a + s.basisPoints, 0);

  const handleSaveSplits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalBp !== 10000 || !address) return;
    setTxStatus("pending");
    setTxError("");
    try {
      await updateSplits(address, splits, signTx);
      setTxStatus("success");
      setSaved(true);
      trackEvent("revenue_splits_updated", { recipients: splits.length });
      setTimeout(() => {
        setSaved(false);
        setTxStatus("idle");
      }, 2000);
    } catch (err: unknown) {
      setTxStatus("error");
      setTxError(err instanceof Error ? err.message : "Failed to save splits");
    }
  };

  const handleSaveRewardRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    setTxStatus("pending");
    setTxError("");
    try {
      await updateRewardRate(address, parseInt(rewardRate) || 0, signTx);
      setTxStatus("success");
      setRateSaved(true);
      trackEvent("reward_rate_updated", { rewardRate: parseInt(rewardRate) || 0 });
      setTimeout(() => {
        setRateSaved(false);
        setTxStatus("idle");
      }, 2000);
    } catch (err: unknown) {
      setTxStatus("error");
      setTxError(err instanceof Error ? err.message : "Failed to save reward rate");
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="text-5xl">⚙</div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
          <p className="text-slate-400 text-sm mb-6">Connect your admin wallet to access this panel.</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-slate-400 text-sm">This panel is only accessible to the contract admin.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage protocol settings and revenue splits</p>
      </div>

      {txStatus !== "idle" && (
        <div className="rounded-xl border p-4 text-sm" style={{
          borderColor: txStatus === "pending" ? "#4f8ef7" : txStatus === "success" ? "#10b981" : "#f87171",
          background: txStatus === "pending" ? "rgba(79,142,247,0.05)" : txStatus === "success" ? "rgba(16,185,129,0.05)" : "rgba(248,113,113,0.05)",
        }}>
          <TransactionStatus status={txStatus} message={txError || undefined} />
        </div>
      )}

      {/* Revenue Splits */}
      <div className="rounded-2xl bg-[#0d1526] border border-[#1e2d4a] p-6">
        <h2 className="text-sm font-semibold text-white mb-4">
          Revenue Splits {loading && <span className="text-xs text-[#4f8ef7] animate-pulse ml-2 font-normal">(Loading…)</span>}
        </h2>
        <form onSubmit={handleSaveSplits} className="flex flex-col gap-4">
          {splits.map((split, i) => (
            <div key={i} className="flex gap-3 items-center">
              <label htmlFor={`split-address-${i}`} className="sr-only">Recipient {i + 1} Stellar address</label>
              <input
                id={`split-address-${i}`}
                name={`split_address_${i}`}
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={split.address}
                onChange={(e) => {
                  const next = [...splits];
                  next[i].address = e.target.value;
                  setSplits(next);
                }}
                placeholder="Stellar address (G…)"
                className="flex-1 bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#4f8ef7]/50 text-sm font-mono"
                required
              />
              <label htmlFor={`split-basis-points-${i}`} className="sr-only">Recipient {i + 1} basis points</label>
              <input
                id={`split-basis-points-${i}`}
                name={`split_basis_points_${i}`}
                type="number"
                autoComplete="off"
                inputMode="numeric"
                value={split.basisPoints}
                onChange={(e) => {
                  const next = [...splits];
                  next[i].basisPoints = parseInt(e.target.value) || 0;
                  setSplits(next);
                }}
                min="0"
                max="10000"
                className="w-24 bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#4f8ef7]/50 text-sm text-center"
                required
              />
              <span className="text-slate-500 text-sm w-8">bp</span>
            </div>
          ))}

          <div className="flex items-center justify-between text-xs" aria-live="polite">
            <span className="text-slate-500">Total: {totalBp} / 10000 basis points</span>
            {totalBp !== 10000 && (
              <span className="text-red-400">Must equal 10000</span>
            )}
            {totalBp === 10000 && (
              <span className="text-emerald-400">✓ Valid</span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSplits([...splits, { address: "", basisPoints: 0 }])}
              className="text-xs text-[#4f8ef7] hover:text-white transition-colors"
            >
              + Add recipient
            </button>
          </div>

          <button
            type="submit"
            disabled={totalBp !== 10000 || txStatus === "pending"}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#4f8ef7] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {saved ? "✓ Saved" : txStatus === "pending" ? "Updating…" : "Update Splits"}
          </button>
        </form>
      </div>

      {/* Reward Rate */}
      <div className="rounded-2xl bg-[#0d1526] border border-[#1e2d4a] p-6">
        <h2 className="text-sm font-semibold text-white mb-4">
          VAULT Reward Rate {loading && <span className="text-xs text-[#4f8ef7] animate-pulse ml-2 font-normal">(Loading…)</span>}
        </h2>
        <form onSubmit={handleSaveRewardRate} className="flex flex-col gap-4">
          <div className="flex gap-3 items-center">
            <label htmlFor="reward-rate" className="sr-only">VAULT reward rate per 10 million stroops</label>
            <input
              id="reward-rate"
              name="reward_rate"
              type="number"
              autoComplete="off"
              inputMode="numeric"
              value={rewardRate}
              onChange={(e) => setRewardRate(e.target.value)}
              min="0"
              className="flex-1 bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#4f8ef7]/50 text-sm"
              required
            />
            <span className="text-slate-400 text-sm">VAULT per 10M stroops</span>
          </div>
          <p className="text-xs text-slate-500">
            Current rate: {rewardRate} VAULT tokens minted per subscription payment unit.
          </p>
          <button
            type="submit"
            disabled={txStatus === "pending"}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#4f8ef7] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {rateSaved ? "✓ Saved" : txStatus === "pending" ? "Updating…" : "Update Rate"}
          </button>
        </form>
      </div>

      {/* Contract Info */}
      <div className="rounded-2xl bg-[#0d1526] border border-[#1e2d4a] p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Contract Addresses</h2>
        <div className="flex flex-col gap-3">
          {[
            { label: "Subscription Manager", env: process.env.NEXT_PUBLIC_SUBSCRIPTION_MANAGER_CONTRACT_ID },
            { label: "Revenue Router", env: process.env.NEXT_PUBLIC_REVENUE_ROUTER_CONTRACT_ID },
            { label: "Vault Token", env: process.env.NEXT_PUBLIC_VAULT_TOKEN_CONTRACT_ID },
          ].map((c) => (
            <div key={c.label} className="flex flex-col gap-1">
              <span className="text-xs text-slate-500 uppercase tracking-wider">{c.label}</span>
              <span className="text-xs text-white font-mono bg-[#0a0f1e] px-3 py-2 rounded-lg border border-[#1e2d4a]">
                {c.env || "Not deployed"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
