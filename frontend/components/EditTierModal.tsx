"use client";
import { useState } from "react";
import { updateTier, TierConfig } from "@/lib/contracts";
import { useWallet } from "@/hooks/useWallet";
import TransactionStatus from "./TransactionStatus";

interface EditTierModalProps {
  tier: TierConfig;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditTierModal({ tier, onClose, onSuccess }: EditTierModalProps) {
  const { address, signTx } = useWallet();
  const [price, setPrice] = useState((Number(tier.price) / 10_000_000).toString());
  const [days, setDays] = useState(Math.round(tier.duration_ledgers / 17280).toString());
  const [active, setActive] = useState(tier.active);
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txError, setTxError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    setTxStatus("pending");
    setTxError("");
    try {
      await updateTier(address, tier.id, parseFloat(price), parseInt(days), active, signTx);
      setTxStatus("success");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setTxStatus("error");
      setTxError(err instanceof Error ? err.message : "Failed to update tier");
    }
  };

  const inputStyle = {
    background: "var(--background)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "var(--text)",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(6,11,20,0.8)", backdropFilter: "blur(8px)" }}>
      <div className="card w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-white">Edit Subscription Tier</h2>
          <button onClick={onClose} className="text-sm text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider mb-1.5 block text-slate-400">Tier Name (Read-only)</label>
            <input style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} value={tier.name} disabled />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider mb-1.5 block text-slate-400">Price (XLM)</label>
            <input style={inputStyle} type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 10" min="0.1" step="0.1" required />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider mb-1.5 block text-slate-400">Duration (Days)</label>
            <input style={inputStyle} type="number" value={days} onChange={e => setDays(e.target.value)} placeholder="e.g. 30" min="1" required />
          </div>
          <div className="flex items-center gap-3 py-1">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={e => setActive(e.target.checked)}
              className="w-4 h-4 rounded bg-[#0a0f1e] border border-[#1e2d4a] checked:bg-[#4f8ef7]"
            />
            <label htmlFor="active" className="text-sm text-white select-none cursor-pointer">
              Tier Active (Allows new subscriptions)
            </label>
          </div>
          {txStatus !== "idle" && <TransactionStatus status={txStatus} message={txError || undefined} />}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 text-center">Cancel</button>
            <button type="submit" disabled={txStatus === "pending"} className="btn-primary flex-1 text-center disabled:opacity-50">
              {txStatus === "pending" ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
