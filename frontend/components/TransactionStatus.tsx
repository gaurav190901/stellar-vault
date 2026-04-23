interface TransactionStatusProps {
  status: "pending" | "success" | "error";
  hash?: string;
  message?: string;
}

export default function TransactionStatus({ status, hash, message }: TransactionStatusProps) {
  if (status === "pending") return (
    <div className="text-xs px-3 py-2 rounded-lg" style={{background: "rgba(91,184,212,0.08)", color: "var(--accent)", border: "1px solid rgba(91,184,212,0.15)"}}>
      ⟳ Transaction pending...
    </div>
  );
  if (status === "success") return (
    <div className="text-xs px-3 py-2 rounded-lg" style={{background: "rgba(52,211,153,0.08)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)"}}>
      ✓ Confirmed
      {hash && <a href={`https://stellar.expert/explorer/testnet/tx/${hash}`} target="_blank" rel="noopener noreferrer"
        className="ml-2 underline opacity-70">{hash.slice(0,12)}...</a>}
    </div>
  );
  return (
    <div className="text-xs px-3 py-2 rounded-lg" style={{background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)"}}>
      ✗ {message || "Transaction failed"}
    </div>
  );
}
