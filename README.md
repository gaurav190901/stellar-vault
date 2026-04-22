# ✦ StellarVault

> On-Chain Subscription & Revenue Sharing Protocol on Stellar/Soroban

[![Contract Tests](https://github.com/your-org/stellarvault/actions/workflows/test.yml/badge.svg)](https://github.com/your-org/stellarvault/actions/workflows/test.yml)
[![Deploy](https://github.com/your-org/stellarvault/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-org/stellarvault/actions/workflows/deploy.yml)

**Green Belt Level 4 — Rise In "Stellar Journey to Mastery"**

StellarVault lets creators monetize with transparent, trustless subscriptions on Stellar. Revenue splits automatically to any number of recipients. Subscribers earn VAULT tokens on every payment.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                   │
│              Freighter Wallet + Stellar SDK              │
└────────────────────────┬────────────────────────────────┘
                         │ invoke
                         ▼
┌─────────────────────────────────────────────────────────┐
│              SubscriptionManager Contract                │
│  subscribe() → transfer_from → route() → mint()         │
└──────────┬──────────────────────────┬───────────────────┘
           │ inter-contract call #1   │ inter-contract call #2
           ▼                          ▼
┌──────────────────────┐   ┌──────────────────────────────┐
│   RevenueRouter      │   │       VaultToken (SEP-41)    │
│  Splits XLM to N     │   │  Mints VAULT rewards to      │
│  recipients by bp    │   │  subscriber on each payment  │
└──────────────────────┘   └──────────────────────────────┘
```

### Contract Call Chain (subscribe)
1. `subscriber` calls `SubscriptionManager.subscribe(tier_id)`
2. Manager calls `payment_token.transfer_from(subscriber → self, price)`
3. Manager calls `RevenueRouter.route(payment_token, price)` → splits to recipients
4. Manager calls `VaultToken.mint(subscriber, reward_amount)` → reward tokens
5. Stores `SubscriptionRecord` with TTL extension

---

## Project Structure

```
stellarvault/
├── contracts/
│   ├── vault_token/          # SEP-41 fungible token (VAULT)
│   ├── revenue_router/       # Revenue splitting contract
│   └── subscription_manager/ # Main subscription logic
├── frontend/                 # Next.js 14 App Router UI
│   ├── app/                  # Pages: /, /dashboard, /subscribe, /admin
│   ├── components/           # UI components
│   ├── lib/                  # Stellar SDK helpers
│   └── hooks/                # React hooks
├── scripts/
│   ├── deploy.sh             # Deploy all 3 contracts
│   └── initialize.sh         # Initialize contracts post-deploy
└── .github/workflows/        # CI/CD pipelines
```

---

## Prerequisites

- Rust + `rustup target add wasm32-unknown-unknown`
- `cargo install --locked stellar-cli --features opt`
- Node.js 18+ and pnpm (`npm i -g pnpm`)
- [Freighter](https://www.freighter.app/) browser extension (set to Testnet)

---

## Run Tests

```bash
cargo test --workspace
```

Expected: **16 tests pass, 0 failures**

---

## Build Contracts

```bash
cargo build --target wasm32-unknown-unknown --release --workspace
```

---

## Deploy to Testnet

```bash
# Add your deployer key
stellar keys generate deployer --network testnet --fund

# Deploy all 3 contracts
bash scripts/deploy.sh

# Initialize contracts
bash scripts/initialize.sh
```

Contract IDs are written to `frontend/.env.local` automatically.

---

## Run Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Contract Addresses (Testnet)

| Contract | Address |
|---|---|
| VaultToken | *(fill after deploy)* |
| RevenueRouter | *(fill after deploy)* |
| SubscriptionManager | *(fill after deploy)* |

---

## Green Belt Requirements Checklist

- [x] 3 Soroban smart contracts (vault_token, revenue_router, subscription_manager)
- [x] Inter-contract calls (subscribe → route → mint)
- [x] SEP-41 compliant token (VaultToken)
- [x] Revenue splitting with basis points validation
- [x] TTL-aware persistent storage with `extend_ttl`
- [x] Unit tests for all contracts (16 tests, 0 failures)
- [x] Deployment scripts for testnet
- [x] Next.js 14 App Router frontend
- [x] Freighter wallet integration
- [x] Responsive UI (375px+)
- [x] GitHub Actions CI/CD (test + deploy + lighthouse)
- [x] Lighthouse score targets (perf 80, a11y 90, best-practices 90)

---

## Tech Stack

- **Contracts**: Rust + Soroban SDK 21
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Wallet**: @stellar/freighter-api
- **SDK**: @stellar/stellar-sdk
- **Charts**: Recharts
- **CI/CD**: GitHub Actions
