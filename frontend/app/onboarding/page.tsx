"use client";

import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";
import { useWallet } from "@/hooks/useWallet";
import { trackEvent } from "@/lib/telemetry";

const FEEDBACK_URL = "https://docs.google.com/forms/d/1etiCOf1ZtK_5LS3Re1RSLpIK6nK8cF7zJ_Q2XKOpzHs/viewform";

const steps = [
  {
    label: "Prepare",
    title: "Install & Unlock Freighter",
    detail: "Use the Freighter browser wallet and switch its active network to Stellar Testnet.",
    action: "https://www.freighter.app/",
    actionLabel: "Get Freighter",
  },
  {
    label: "Fund",
    title: "Add Testnet XLM",
    detail: "Fund your public wallet address with free test XLM. Never enter your recovery phrase into a website.",
    action: "https://laboratory.stellar.org/#account-creator?network=test",
    actionLabel: "Open Account Creator",
  },
  {
    label: "Connect",
    title: "Connect Your Wallet",
    detail: "Approve read access, confirm Testnet is selected, and keep control of every transaction signature.",
  },
  {
    label: "Verify",
    title: "Subscribe & Keep the Hash",
    detail: "Choose a tier, approve the transaction, and save the Stellar Expert link as proof of your interaction.",
  },
  {
    label: "Improve",
    title: "Share Product Feedback",
    detail: "Tell us what worked and what slowed you down. Feedback is reviewed without publishing wallet secrets.",
    action: FEEDBACK_URL,
    actionLabel: "Open Feedback Form",
  },
];

export default function OnboardingPage() {
  const { isConnected } = useWallet();

  return (
    <div className="max-w-5xl mx-auto">
      <section className="onboarding-hero mb-10">
        <div>
          <p className="tag w-fit mb-4">5-Minute Testnet Onboarding</p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4 text-balance">
            One Wallet. One Signature. Verifiable Access.
          </h1>
          <p className="max-w-2xl text-base md:text-lg" style={{ color: "var(--muted)", lineHeight: 1.75 }}>
            Follow the ledger path from a new wallet to a confirmed on-chain subscription.
            No seed phrase, custody, or real funds are required.
          </p>
        </div>
        <div className="ledger-stamp" aria-label={isConnected ? "Wallet connected" : "Wallet not connected"}>
          <span className="ledger-stamp__status" aria-hidden="true" />
          <span>{isConnected ? "Wallet Ready" : "Awaiting Wallet"}</span>
        </div>
      </section>

      <ol className="grid gap-4" aria-label="Onboarding steps">
        {steps.map((step, index) => (
          <li key={step.label} className="card p-5 md:p-6 grid md:grid-cols-[88px_1fr_auto] gap-4 md:items-center">
            <div className="ledger-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] mb-1" style={{ color: "var(--accent)" }}>{step.label}</p>
              <h2 className="text-lg font-semibold mb-1">{step.title}</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{step.detail}</p>
            </div>
            {step.label === "Connect" ? (
              <WalletConnect />
            ) : step.action ? (
              <a
                href={step.action}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-center whitespace-nowrap"
                onClick={() => trackEvent("onboarding_resource_opened", { step: step.label })}
              >
                {step.actionLabel}
              </a>
            ) : (
              <Link href="/subscribe" className="btn-primary text-center whitespace-nowrap">Browse Tiers</Link>
            )}
          </li>
        ))}
      </ol>

      <section className="card p-6 mt-8">
        <h2 className="text-lg font-semibold mb-2">Privacy & Safety</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          StellarVault only needs your public wallet address and signed transaction. Never share a secret key,
          recovery phrase, one-time code, or GitHub credential with the app or feedback form.
        </p>
      </section>
    </div>
  );
}
