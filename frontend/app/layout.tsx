import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/Layout";
import { WalletProvider } from "@/hooks/useWallet";

export const metadata: Metadata = {
  title: "StellarVault — On-Chain Subscriptions",
  description: "Decentralized subscription & revenue sharing protocol on Stellar/Soroban",
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
          <Layout>{children}</Layout>
        </WalletProvider>
      </body>
    </html>
  );
}
