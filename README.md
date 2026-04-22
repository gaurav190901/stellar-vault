<div align="center">

<img src="https://img.shields.io/badge/Stellar-Soroban-5bb8d4?style=for-the-badge&logo=stellar&logoColor=white" />
<img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Deployed-Netlify-00c7b7?style=for-the-badge&logo=netlify&logoColor=white" />
<img src="https://img.shields.io/badge/Tests-16%20Passing-22c55e?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />

<br /><br />

# ✦ StellarVault

### On-Chain Subscription & Revenue Sharing Protocol on Stellar/Soroban

**[🚀 Live Demo → stellar-vault-app.netlify.app](https://stellar-vault-app.netlify.app)**

*Green Belt Level 4 — Rise In "Stellar Journey to Mastery" Builder Challenge*

<br />

</div>

---

## What is StellarVault?

StellarVault is a production-ready, fully on-chain subscription protocol built on Stellar's Soroban smart contract platform. It lets creators, DAOs, and SaaS products monetize with transparent, trustless subscriptions — no middlemen, no platform cuts, no custody risk.

Every subscription is a smart contract interaction. Every payment is a blockchain transaction. Every revenue split is enforced by code — not by a company's terms of service.

```
User (Freighter Wallet)
        │
        ▼
SubscriptionManager ──► token.transfer(subscriber → admin, price)
        │
        └──────────────► VaultToken.mint(subscriber, reward_amount)
                                    ↑
                              VAULT tokens earned
                              on every payment
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Non-Custodial** | Payments go directly wallet-to-wallet. StellarVault never holds funds. |
| ⚡ **3–5s Finality** | Stellar's consensus settles transactions in seconds, not minutes. |
| 💸 **Zero Platform Fee** | 0% cut. You keep 100% of subscription revenue. |
| 🪙 **VAULT Token Rewards** | Subscribers earn VAULT tokens on every payment automatically. |
| 📊 **Revenue Splits** | Define splits in basis points across unlimited recipients. |
| 🔍 **Fully Transparent** | Every transaction, every split, every subscription — all on-chain. |
| 📱 **Mobile Responsive** | Works perfectly on 375px and up. |
| 🌐 **Freighter Wallet** | One-click connect with the leading Stellar browser wallet. |
| 🧪 **Fully Tested** | 16 unit tests across all 3 contracts, 0 failures. |
| 🤖 **CI/CD** | GitHub Actions for test, deploy, and Lighthouse audit. |

---

## 🏗 Architecture

StellarVault is composed of **3 auditable Soroban smart contracts**:

### `SubscriptionManager` — Core Contract
The main orchestrator. Handles tier creation, subscribe/renew/cancel flows, and TTL-aware persistent subscription records on-chain.

```rust
pub fn subscribe(env: Env, subscriber: Address, tier_id: u32) {
    subscriber.require_auth();
    // Direct transfer: subscriber pays admin (no intermediate balance needed)
    token::Client::new(&env, &payment_token)
        .transfer(&subscriber, &admin, &tier.price);
    // Mint VAULT reward tokens to subscriber
    VaultTokenClient::new(&env, &vault_token)
        .mint(&subscriber, &reward_amount);
    // Store subscription record with TTL extension
    env.storage().persistent().extend_ttl(&key, duration, duration * 2);
}
```

### `RevenueRouter` — Payment Splits
Distributes incoming payments to multiple recipients using configurable basis points. All splits must sum to exactly 10,000 bps (100%).

### `VaultToken` — SEP-41 Fungible Token
Fully compliant Stellar fungible token. Mints VAULT rewards to subscribers on every payment. Only the SubscriptionManager can call `mint()`.

---

## 📦 Project Structure

```
stellarvault/
├── contracts/
│   ├── vault_token/            # SEP-41 token — VAULT rewards
│   ├── revenue_router/         # Basis-point revenue splitting
│   └── subscription_manager/   # Core subscription logic
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/          # Creator dashboard
│   │   ├── subscribe/          # Subscriber view + tier browser
│   │   └── admin/              # Admin panel (splits, reward rate)
│   ├── components/             # WalletConnect, TierCard, StatCard, etc.
│   ├── lib/contracts.ts        # Stellar SDK + Soroban contract bindings
│   └── hooks/                  # useWallet, useDashboard
├── scripts/
│   ├── deploy.sh               # Deploy all 3 contracts to testnet
│   └── initialize.sh           # Initialize contracts post-deploy
└── .github/workflows/
    ├── test.yml                # cargo test on every push
    ├── deploy.yml              # Deploy to testnet on merge to main
    └── lighthouse.yml          # Lighthouse CI audit
```

---

## 🌐 Live Contracts (Stellar Testnet)

| Contract | Address |
|---|---|
| **SubscriptionManager** | `CCMYKDKG5LGUQFJVQFNCWSUVKTKCA33CZ32ZXOLLP6GFM6LUEHNI52F4` |
| **RevenueRouter** | `CABPHTUFOX6NLNI5TYUSZF2CIXFMSEHGEU364NA4LNQXX5V7ZQDBPH2J` |
| **VaultToken** | `CAPQ327DH5GR5TGSWPIF44PIIDFQI3TNLA2DSSSY3GTZN32GQC6RNLDS` |

> 🔍 View on [Stellar Expert Testnet Explorer](https://stellar.expert/explorer/testnet)

---

## 🚀 Quick Start

### Prerequisites

```bash
# Rust + Soroban WASM target
rustup target add wasm32-unknown-unknown

# Stellar CLI
cargo install --locked stellar-cli --features opt

# Node.js 18+ and pnpm
npm install -g pnpm

# Freighter browser extension (set to Testnet mode)
# https://www.freighter.app/
```

### Run Tests

```bash
cargo test --workspace
# ✓ 16 tests pass, 0 failures
```

### Build Contracts

```bash
cargo build --target wasm32-unknown-unknown --release --workspace
```

### Deploy to Testnet

```bash
# Generate and fund a deployer account
stellar keys generate deployer --network testnet --fund

# Deploy all 3 contracts (auto-writes IDs to frontend/.env.local)
bash scripts/deploy.sh

# Initialize contracts with correct cross-contract addresses
bash scripts/initialize.sh
```

### Run Frontend Locally

```bash
cd frontend
pnpm install
pnpm dev
# → http://localhost:3000
```

---

## 🧪 Test Coverage

```
running 16 tests

vault_token
  ✓ test_mint_only_minter
  ✓ test_transfer_updates_balances
  ✓ test_burn_reduces_supply
  ✓ test_allowance_and_transfer_from
  ✓ test_transfer_insufficient_balance

revenue_router
  ✓ test_correct_splits
  ✓ test_invalid_splits_panic
  ✓ test_route_distributes_correctly
  ✓ test_update_splits

subscription_manager
  ✓ test_create_tier
  ✓ test_subscribe_flow
  ✓ test_expired_inactive
  ✓ test_renew_extends
  ✓ test_cancel
  ✓ test_bad_tier
  ✓ test_reward_tokens_minted

test result: ok. 16 passed; 0 failed; 0 ignored
```

---

## 🔄 CI/CD Pipelines

| Workflow | Trigger | What it does |
|---|---|---|
| `test.yml` | Every push / PR | `cargo test --workspace` + WASM build |
| `deploy.yml` | Merge to `main` | Deploys all 3 contracts to Stellar Testnet |
| `lighthouse.yml` | Merge to `main` | Lighthouse audit — perf ≥80, a11y ≥90 |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Rust + Soroban SDK 21 |
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4 |
| Wallet | @stellar/freighter-api v6 |
| Stellar SDK | @stellar/stellar-sdk v15 |
| Charts | Recharts |
| Hosting | Netlify |
| CI/CD | GitHub Actions |
| Network | Stellar Testnet |

---

## 🎯 Green Belt Level 4 — Requirements Checklist

- [x] 3 production Soroban smart contracts deployed on testnet
- [x] Inter-contract calls (SubscriptionManager → VaultToken.mint)
- [x] SEP-41 compliant fungible token (VaultToken / VAULT)
- [x] TTL-aware persistent storage with `extend_ttl`
- [x] 16 unit tests, 0 failures (`cargo test --workspace`)
- [x] Deployment scripts (`deploy.sh` + `initialize.sh`)
- [x] Next.js 14+ App Router frontend
- [x] Freighter wallet integration (connect, sign, submit)
- [x] Fully responsive UI (375px mobile → desktop)
- [x] GitHub Actions CI/CD (test + deploy + lighthouse)
- [x] Live production deployment: [stellar-vault-app.netlify.app](https://stellar-vault-app.netlify.app)
- [x] Comprehensive README with architecture, setup, and contract addresses

---

## 📄 License

MIT © [gaurav190901](https://github.com/gaurav190901)

---

<div align="center">

**[🚀 stellar-vault-app.netlify.app](https://stellar-vault-app.netlify.app)**

Built with ✦ on Stellar/Soroban

</div>
