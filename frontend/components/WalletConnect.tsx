"use client";
import { useWallet } from "@/hooks/useWallet";

export default function WalletConnect() {
  const { shortAddress, isConnected, loading, error, connect, disconnect } = useWallet();
  return (
    <div>
      {isConnected ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono"
            style={{background: "rgba(91,184,212,0.08)", border: "1px solid rgba(91,184,212,0.2)", color: "var(--accent)"}}>
            <span className="w-1.5 h-1.5 rounded-full" style={{background: "var(--accent)"}} />
            {shortAddress}
          </div>
          <button onClick={disconnect} className="text-xs px-2 py-1.5 rounded-lg transition-colors"
            style={{color: "var(--muted)"}}>
            ✕
          </button>
        </div>
      ) : (
        <button onClick={connect} disabled={loading}
          className="btn-primary text-xs px-4 py-2 disabled:opacity-50">
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
      {error && <p className="text-xs mt-1" style={{color: "#f87171"}}>{error}</p>}
    </div>
  );
}
