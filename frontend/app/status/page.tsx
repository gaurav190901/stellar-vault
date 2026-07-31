"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/hooks/useContract";
import { CONTRACTS } from "@/lib/contracts";
import { TESTNET_EVIDENCE, shortenEvidenceAddress } from "@/lib/testnetEvidence";

const READ_ONLY_ADDRESS = "GB7FBPFF4EZ7ZTS4GSODM2RDWHGIRPAK3FGBEEMMGLLEZYFIYBUXYYEI";

type Health = {
  status: "ok" | "degraded";
  network: string;
  rpc: string;
  contractsConfigured: boolean;
  checkedAt: string;
};

const contractRows = [
  ["SubscriptionManager", CONTRACTS.subscriptionManager],
  ["RevenueRouter", CONTRACTS.revenueRouter],
  ["VaultToken", CONTRACTS.vaultToken],
] as const;

export default function StatusPage() {
  const { stats, loading, error, refresh } = useDashboard(READ_ONLY_ADDRESS);
  const [health, setHealth] = useState<Health | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/health", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json() as Health;
        setHealth(data);
        if (!response.ok) setHealthError("The RPC health check is degraded. Retry in a moment.");
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof Error && fetchError.name === "AbortError") return;
        setHealthError("The health endpoint could not be reached. Check the deployment logs.");
      });
    return () => controller.abort();
  }, []);

  const latest = TESTNET_EVIDENCE.transactions.slice(-5).reverse();
  const verifiedAt = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(TESTNET_EVIDENCE.createdAt));

  return (
    <div className="flex flex-col gap-7">
      <section className="status-header">
        <div>
          <p className="tag w-fit mb-3">Protocol Observatory</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 text-balance">Testnet Health & Proof</h1>
          <p className="max-w-2xl" style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            Public contract configuration, live RPC health, and transaction evidence in one reviewer-friendly view.
          </p>
        </div>
        <div className={`health-pill ${health?.status === "ok" ? "health-pill--ok" : ""}`} aria-live="polite">
          <span aria-hidden="true" />
          {health ? (health.status === "ok" ? "All Systems Operational" : "Degraded") : "Checking Health…"}
        </div>
      </section>

      {(error || healthError) && (
        <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" role="alert">
          <p className="text-sm" style={{ color: "#fbbf24" }}>{error || healthError}</p>
          <button type="button" className="btn-outline" onClick={() => refresh(true)}>Retry On-Chain Read</button>
        </div>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Protocol metrics">
        {[
          ["Subscribers", loading ? "—" : stats.totalSubscribers, "On-chain counter"],
          ["Active Deployment", "3", "Soroban contracts"],
          ["Verified Transactions", TESTNET_EVIDENCE.transactions.length, "Unique successful hashes"],
          ["Network", "Testnet", health?.rpc === "healthy" ? "RPC healthy" : "RPC checking"],
        ].map(([label, value, caption]) => (
          <article className="card p-5" key={label}>
            <p className="text-xs uppercase tracking-[0.16em] mb-3" style={{ color: "var(--muted)" }}>{label}</p>
            <p className="text-2xl md:text-3xl font-bold tabular-nums">{value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{caption}</p>
          </article>
        ))}
      </section>

      <section className="grid lg:grid-cols-[1.15fr_.85fr] gap-5">
        <article className="card p-5 md:p-6 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-semibold">Latest Verified Interactions</h2>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Automated testnet validation · verified {verifiedAt}</p>
            </div>
            <span className="tag whitespace-nowrap">5 of 18</span>
          </div>
          <div className="flex flex-col">
            {latest.map((transaction) => (
              <a
                key={transaction.hash}
                href={`https://stellar.expert/explorer/testnet/tx/${transaction.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="evidence-row"
              >
                <span className="evidence-row__pulse" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-sm font-mono truncate" translate="no">{shortenEvidenceAddress(transaction.address)}</span>
                  <span className="block text-xs font-mono truncate" style={{ color: "var(--muted)" }} translate="no">{transaction.hash}</span>
                </span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </article>

        <article className="card p-5 md:p-6 min-w-0">
          <h2 className="text-lg font-semibold mb-5">Contract Registry</h2>
          <div className="flex flex-col gap-4">
            {contractRows.map(([name, id]) => (
              <div key={name} className="min-w-0">
                <p className="text-xs uppercase tracking-[0.14em] mb-1" style={{ color: "var(--muted)" }}>{name}</p>
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contract-code"
                  translate="no"
                >
                  {id || "Not Configured"}
                </a>
              </div>
            ))}
          </div>
          <a href="/api/health" className="btn-outline mt-6 text-center w-full">Open Machine-Readable Health Check</a>
        </article>
      </section>
    </div>
  );
}
