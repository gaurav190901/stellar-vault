# StellarVault frontend

This Next.js application is StellarVault's Soroban integration layer. It connects to Freighter, simulates contract reads through Soroban RPC, asks the wallet to sign assembled transactions, and submits the signed transaction to Stellar Testnet.

## Contract coverage

`lib/contracts.ts` maps the UI directly to the deployed Soroban contracts:

- `SubscriptionManager`: create and update tiers; subscribe, renew, cancel; query tier and subscription state.
- `RevenueRouter`: query and update basis-point revenue splits.
- `VaultToken`: query the connected wallet's VAULT balance.

## Configure and run

Copy `.env.example` to `.env.local` and fill in the three contract IDs. `../scripts/deploy.sh` writes this file automatically after deployment; run `../scripts/initialize.sh` before creating tiers.

```bash
pnpm install
pnpm dev
```

Build a production bundle with:

```bash
pnpm build
```

## Wallet requirements

Install and unlock the Freighter extension on the same network configured in `NEXT_PUBLIC_NETWORK`. The wallet signs every state-changing request; contract reads use the connected account only as the simulation source and never request a signature.
