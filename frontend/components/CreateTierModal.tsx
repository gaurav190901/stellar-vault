"use client";
import { useState } from "react";
import { createTier } from "@/lib/contracts";
import { useWallet } from "@/hooks/useWallet";
import TransactionStatus from "./TransactionStatus";

interface CreateTierModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTierModal({ onClose, onSuccess }: CreateTierModalProps) {
  const { address, signTx } = useWallet();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [days, setDays] = useState("");
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txError, setTxError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    setTxStatus("pending"); setTxError("");
    try {
      await createTier(address, name, parseFloat(price), parseInt(days), signTx);
      setTxStatus("success");
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err: unknown) {
      setTxStatus("error");
      setTxError(err instanceof Error ? err.message : "Failed");
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
      style={{background: "rgba(6,11,20,0.8)", backdropFilter: "blur(8px)"}}>
      <div className="card w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold">Create Subscription Tier</h2>
          <button onClick={onClose} className="text-sm" style={{color: "var(--muted)"}}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider mb-1.5 block" style={{color: "var(--muted)"}}>Tier Name</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Basic, Pro, Enterprise" required />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider mb-1.5 block" style={{color: "var(--muted)"}}>Price (XLM)</label>
            <input style={inputStyle} type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 10" min="0.1" step="0.1" required />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider mb-1.5 block" style={{color: "var(--muted)"}}>Duration (Days)</label>
            <input style={inputStyle} type="number" value={days} onChange={e => setDays(e.target.value)} placeholder="e.g. 30" min="1" required />
          </div>
          {txStatus !== "idle" && <TransactionStatus status={txStatus} message={txError || undefined} />}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 text-center">Cancel</button>
            <button type="submit" disabled={txStatus === "pending"} className="btn-primary flex-1 text-center disabled:opacity-50">
              {txStatus === "pending" ? "Creating..." : "Create Tier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
