import type { Metadata, Viewport } from "next";
import "./globals.css";
import Layout from "@/components/Layout";
import { WalletProvider } from "@/hooks/useWallet";
import WebVitals from "@/components/WebVitals";

export const metadata: Metadata = {
  title: "StellarVault — On-Chain Subscriptions",
  description: "Decentralized subscription & revenue sharing protocol on Stellar/Soroban",
  metadataBase: new URL("https://stellar-vault-app.netlify.app"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "StellarVault — On-Chain Subscriptions",
    description: "Create, manage, and verify subscription payments on Stellar Testnet.",
    type: "website",
    url: "/",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#060b14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <WebVitals />
          <Layout>{children}</Layout>
        </WalletProvider>
      </body>
    </html>
  );
}
