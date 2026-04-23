"use client";
import { TierConfig, stroopsToXlm, ledgersToDays, subscribe } from "@/lib/contracts";
import { useWallet } from "@/hooks/useWallet";
import { useState } from "react";
import TransactionStatus from "./TransactionStatus";

interface TierCardProps {
  tier: TierConfig;
  isSubscribed?: boolean;
}

export default function TierCard({ tier, isSubscribed }: TierCardProps) {
  const { address, isConnected, signTx } = useWallet();
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [txMsg, setTxMsg] = useState("");

  const handleSubscribe = async () => {
    if (!address) return;
    setTxStatus("pending"); setTxMsg("");
    try {
      const result = await subscribe(address, tier.id, signTx);
      setTxHash(result.hash);
      setTxStatus("success");
    } catch (e: unknown) {
      setTxStatus("error");
      setTxMsg(e instanceof Error ? e.message : "Transaction failed");
    }
  };

  return (
    <div className="card p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-base">{tier.name}</h3>
          <p className="text-xs mt-0.5" style={{color: "var(--muted)"}}>Tier #{tier.id}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full"
          style={tier.active
            ? {background: "rgba(91,184,212,0.1)", color: "var(--accent)", border: "1px solid rgba(91,184,212,0.2)"}
            : {background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)"}}>
          {tier.active ? "Active" : "Inactive"}
        </span>
      </div>

      <div>
        <span className="text-3xl font-bold">{stroopsToXlm(tier.price)}</span>
        <span className="text-sm ml-1" style={{color: "var(--muted)"}}>XLM</span>
        <p className="text-xs mt-1" style={{color: "var(--muted)"}}>per {ledgersToDays(tier.duration_ledgers)} days</p>
      </div>

      {isSubscribed ? (
        <div className="text-center py-2.5 rounded-lg text-sm font-medium"
          style={{background: "rgba(91,184,212,0.08)", color: "var(--accent)", border: "1px solid rgba(91,184,212,0.2)"}}>
          ✓ Subscribed
        </div>
      ) : (
        <button onClick={handleSubscribe}
          disabled={!isConnected || txStatus === "pending" || !tier.active}
          className="btn-primary w-full text-center disabled:opacity-40">
          {txStatus === "pending" ? "Confirming..." : "Subscribe"}
        </button>
      )}

      {txStatus !== "idle" && txStatus !== "pending" && (
        <TransactionStatus status={txStatus} hash={txHash} message={txMsg} />
      )}
    </div>
  );
}
