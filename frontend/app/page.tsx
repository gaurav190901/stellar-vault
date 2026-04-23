import Link from "next/link";

const stats = [
  { value: "3", label: "Smart Contracts" },
  { value: "100%", label: "On-Chain" },
  { value: "0", label: "Middlemen" },
  { value: "∞", label: "Scalable" },
];

const features = [
  {
    icon: "◈",
    title: "Subscription Tiers",
    desc: "Create unlimited subscription tiers with custom pricing in XLM and durations from 1 day to 1 year. Each tier is stored immutably on Stellar.",
  },
  {
    icon: "⟁",
    title: "Automatic Revenue Splits",
    desc: "Define revenue splits in basis points across any number of recipients. Every payment routes instantly on-chain — no manual payouts, ever.",
  },
  {
    icon: "✦",
    title: "VAULT Token Rewards",
    desc: "Subscribers earn VAULT tokens on every payment. Build loyalty, align incentives, and reward your most engaged community members.",
  },
  {
    icon: "⬡",
    title: "Soroban Smart Contracts",
    desc: "Built on Stellar's Soroban VM. Contracts are auditable, deterministic, and execute in milliseconds with near-zero fees.",
  },
  {
    icon: "◎",
    title: "Freighter Wallet",
    desc: "Connect with Freighter in one click. Sign transactions directly from your browser — no seed phrases exposed, no custodial risk.",
  },
  {
    icon: "⚙",
    title: "Creator Dashboard",
    desc: "Real-time analytics on subscribers, revenue, and token distribution. Manage tiers, update splits, and monitor growth from one place.",
  },
];

const steps = [
  {
    n: "01",
    title: "Deploy your tiers",
    desc: "Connect your Freighter wallet and create subscription tiers with your pricing. Each tier is written directly to the Stellar blockchain.",
  },
  {
    n: "02",
    title: "Subscribers pay on-chain",
    desc: "Fans subscribe by signing a single transaction. XLM transfers directly to your wallet — no payment processor, no 30% cut.",
  },
  {
    n: "03",
    title: "Revenue flows automatically",
    desc: "Every payment triggers your revenue split rules. Team members, collaborators, and treasury wallets receive their share instantly.",
  },
];

const usecases = [
  { title: "Content Creators", desc: "Monetize newsletters, videos, and exclusive content with recurring on-chain subscriptions." },
  { title: "SaaS Products", desc: "Gate API access, features, or usage tiers behind verifiable on-chain subscription records." },
  { title: "DAOs & Communities", desc: "Fund your treasury transparently. Members pay dues on-chain, splits go to contributors automatically." },
  { title: "Open Source Projects", desc: "Sustainable funding for maintainers. Sponsors subscribe, revenue splits to all contributors." },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="relative min-h-[88vh] flex flex-col justify-center px-6 py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{background: "radial-gradient(circle, #5bb8d4 0%, transparent 70%)"}} />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="tag mb-6 w-fit">Live on Stellar Testnet</div>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.08] tracking-tight mb-6"
            style={{letterSpacing: "-0.02em"}}>
            On-Chain Subscriptions<br />
            <span style={{color: "var(--accent)"}}>for the Open Web.</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-10" style={{color: "var(--muted)", lineHeight: "1.7"}}>
            StellarVault lets creators, DAOs, and SaaS products monetize with transparent,
            trustless subscriptions on Stellar. Revenue splits automatically.
            Subscribers earn rewards. No middlemen.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard" className="btn-primary">Launch Dashboard →</Link>
            <Link href="/subscribe" className="btn-outline">Browse Tiers</Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-10"
            style={{borderTop: "1px solid var(--border)"}}>
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold mb-1" style={{color: "var(--accent)"}}>{s.value}</p>
                <p className="text-sm" style={{color: "var(--muted)"}}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is StellarVault */}
      <section className="px-6 py-20" style={{borderTop: "1px solid var(--border)"}}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="tag mb-4 w-fit">What we built</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{letterSpacing: "-0.02em"}}>
              The subscription layer<br />Stellar was missing.
            </h2>
            <p className="mb-4" style={{color: "var(--muted)", lineHeight: "1.8"}}>
              Traditional subscription platforms take 5–30% of your revenue, hold your funds for days,
              and give you zero transparency into how money flows. StellarVault changes that.
            </p>
            <p style={{color: "var(--muted)", lineHeight: "1.8"}}>
              Every subscription is a smart contract interaction. Every payment is a blockchain transaction.
              Every split is enforced by code — not by a company's terms of service.
              Your revenue, your rules, your chain.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {[
              ["Transfer speed", "3–5 seconds"],
              ["Transaction fee", "~0.00001 XLM"],
              ["Platform cut", "0%"],
              ["Custody", "Non-custodial"],
              ["Transparency", "Fully on-chain"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-5 py-3 card">
                <span className="text-sm" style={{color: "var(--muted)"}}>{label}</span>
                <span className="text-sm font-semibold" style={{color: "var(--accent)"}}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20" style={{borderTop: "1px solid var(--border)"}}>
        <div className="max-w-5xl mx-auto">
          <p className="tag mb-4 w-fit">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-12" style={{letterSpacing: "-0.02em"}}>
            Everything you need.<br />Nothing you don't.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card p-6">
                <span className="text-2xl mb-4 block" style={{color: "var(--accent)"}}>{f.icon}</span>
                <h3 className="font-semibold mb-2 text-base">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{color: "var(--muted)"}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20" style={{borderTop: "1px solid var(--border)"}}>
        <div className="max-w-5xl mx-auto">
          <p className="tag mb-4 w-fit">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-12" style={{letterSpacing: "-0.02em"}}>
            Live in three steps.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.n}>
                <p className="text-5xl font-bold mb-4" style={{color: "var(--accent)", opacity: 0.4}}>{s.n}</p>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{color: "var(--muted)"}}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-6 py-20" style={{borderTop: "1px solid var(--border)"}}>
        <div className="max-w-5xl mx-auto">
          <p className="tag mb-4 w-fit">Use cases</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-12" style={{letterSpacing: "-0.02em"}}>
            Built for builders.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {usecases.map((u) => (
              <div key={u.title} className="card p-6 flex gap-4">
                <span style={{color: "var(--accent)", fontSize: "20px", marginTop: "2px"}}>→</span>
                <div>
                  <h3 className="font-semibold mb-1">{u.title}</h3>
                  <p className="text-sm leading-relaxed" style={{color: "var(--muted)"}}>{u.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="px-6 py-20" style={{borderTop: "1px solid var(--border)"}}>
        <div className="max-w-5xl mx-auto">
          <p className="tag mb-4 w-fit">Architecture</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{letterSpacing: "-0.02em"}}>
            Three contracts. One protocol.
          </h2>
          <p className="mb-10 max-w-2xl" style={{color: "var(--muted)", lineHeight: "1.8"}}>
            StellarVault is composed of three auditable Soroban smart contracts that work together
            to handle subscriptions, revenue distribution, and token rewards.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "SubscriptionManager", role: "Core contract", desc: "Handles tier creation, subscribe/renew/cancel logic, and TTL-aware subscription records." },
              { name: "RevenueRouter", role: "Payment splits", desc: "Distributes incoming payments to multiple recipients using configurable basis points." },
              { name: "VaultToken", role: "SEP-41 Token", desc: "Mints VAULT reward tokens to subscribers on every payment. Fully compliant fungible token." },
            ].map((c) => (
              <div key={c.name} className="card p-6">
                <p className="text-xs mb-1" style={{color: "var(--accent)"}}>{c.role}</p>
                <h3 className="font-mono font-semibold mb-3 text-sm">{c.name}</h3>
                <p className="text-sm leading-relaxed" style={{color: "var(--muted)"}}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24" style={{borderTop: "1px solid var(--border)"}}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{letterSpacing: "-0.02em"}}>
            Ready to get started?
          </h2>
          <p className="mb-8" style={{color: "var(--muted)", lineHeight: "1.8"}}>
            Connect your Freighter wallet, create your first tier, and start accepting
            on-chain subscriptions in under 5 minutes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/dashboard" className="btn-primary">Open Dashboard →</Link>
            <Link href="/subscribe" className="btn-outline">View Live Tiers</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
