"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import WalletConnect from "./WalletConnect";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/subscribe", label: "Subscribe" },
  { href: "/admin", label: "Admin" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col" style={{background: "var(--background)"}}>
      {/* Top nav */}
      <header style={{borderBottom: "1px solid var(--border)", background: "rgba(6,11,20,0.92)", backdropFilter: "blur(12px)"}}
        className="sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight" style={{color: "var(--text)"}}>
              ✦ <span style={{color: "var(--accent)"}}>Stellar</span>Vault
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}
                className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{
                  color: pathname === item.href ? "var(--text)" : "var(--muted)",
                  background: pathname === item.href ? "var(--surface2)" : "transparent",
                }}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:block">
            <WalletConnect />
          </div>
          {/* Mobile menu placeholder */}
          <div className="md:hidden">
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>

      {/* Footer */}
      <footer style={{borderTop: "1px solid var(--border)"}} className="px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold" style={{color: "var(--accent)"}}>✦ StellarVault</span>
          <p className="text-xs" style={{color: "var(--muted)"}}>
            On-Chain Subscription Protocol · Built on Stellar/Soroban · Testnet
          </p>
          <div className="flex gap-4 text-xs" style={{color: "var(--muted)"}}>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/subscribe" className="hover:text-white transition-colors">Subscribe</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex"
        style={{background: "var(--surface)", borderTop: "1px solid var(--border)"}}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className="flex-1 flex flex-col items-center py-3 text-xs gap-0.5 transition-colors"
            style={{color: pathname === item.href ? "var(--accent)" : "var(--muted)"}}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
