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

<br />

</div>

---
## 📝 Feedback & Response Tracking

Help us improve StellarVault by submitting feedback through the form below. Responses are collected automatically in the linked spreadsheet.

- **[Open the feedback form](https://docs.google.com/forms/d/1etiCOf1ZtK_5LS3Re1RSLpIK6nK8cF7zJ_Q2XKOpzHs/edit)**
- **[View form responses](https://docs.google.com/spreadsheets/d/1VissBglqhCp7ngxRe3ml3al75DFscWhk8YFX3Dx0ADc/edit?resourcekey=&gid=1340063404#gid=1340063404)**

### Feedback addressed

The latest user responses highlighted three issues:

- **“The UI was lagging a bit.”** Dashboard reads now share a short-lived snapshot cache and deduplicate in-flight requests, reducing repeated Soroban RPC calls during navigation and refreshes.
- **“The wallet sometimes doesn’t recognize the Freighter wallet.”** Connection now retries detection, uses Freighter’s explicit access flow, watches for account changes, and reports network or extension state clearly.
- **“My wallet wasn’t connecting.”** The connect control now has a retry path, validates the returned address, checks the active network, and surfaces actionable error text instead of failing silently.

## 🏗️ Key Features & Architecture

StellarVault is a production-ready, fully on-chain subscription and payment splits protocol built on Stellar's Soroban smart contract platform. It enables SaaS platforms, DAOs, and content creators to monetize without middlemen, charge transparently, and route revenue splits instantly on-chain.

### 1. ⚙️ Advanced Smart Contract Development
Built in Rust using the Soroban SDK v21. State is managed via persistent storage with automated TTL extension to ensure subscription record durability. 
- **Subscription Lifecycle**: Handled via `subscribe()`, `renew()`, and `cancel()` flows in the [SubscriptionManager](file:///Users/neelsubhashpote/garry/stellar-vault/contracts/subscription_manager/src/lib.rs).
- **Stated Variables**: Holds admin mappings, vault token rewards metadata, and structured pricing tier configurations (`TierConfig`).

### 2. 🔗 Inter-Contract Communication
The protocol divides concerns among 3 independent contracts interacting atomically:
- **SubscriptionManager** acts as the core orchestrator. When a payment is made, it performs a cross-contract token transfer, routing the funds to the `RevenueRouter` address.
- **RevenueRouter** immediately runs split logic, dividing the fee among configured recipients.
- **VaultToken** is an SEP-41 compliant token. The manager performs a cross-contract `mint()` call to distribute loyalty reward tokens directly to the subscriber.

```
User (Freighter Wallet)
        │
        ▼
SubscriptionManager ──► RevenueRouter ──► Split Recipients (70/20/10)
        │
        └──────────────► VaultToken.mint(subscriber, reward_amount)
                                    ↑
                              VAULT tokens earned
                              on every payment
```

### 3. 📡 Event Streaming & Live Protocol Logs
Every ledger state change publishes standard Soroban events, allowing web application indexers and frontends to stream transactions in real-time.
- `subbed(subscriber, tier_id, expiry_ledger)`: Emitted on new subscription.
- `renewed(subscriber, tier_id, new_expiry)`: Emitted when renewing.
- `cancelled(subscriber, tier_id)`: Emitted on cancellation.
- `routed(token_address, splits)`: Emitted by the router on revenue split execution.

The dashboard integrates a **Live Protocol Activity Feed** that displays these real-time events for creator monitoring.

### 4. 🧪 Comprehensive Testing Suite
16 unit tests are implemented across all contract crates, verifying edge cases, authentication restrictions, splits calculations, and token distribution rules.
- Run tests: `cargo test --workspace`

### 5. 🤖 Automated CI/CD Pipelines
GitHub Actions are configured under `.github/workflows/` to ensure production-level code quality:
- **Contract Tests & WASM Build** (`test.yml`): Compiles Rust files under 1.85.0 toolchain, validates WASM targets, and runs unit tests.
- **Testnet Deployment** (`deploy.yml`): Automates contract uploads and deployments to Stellar Testnet.
- **Performance & Audits** (`lighthouse.yml`): Runs Google Lighthouse audits to enforce high performance and accessibility standards.

### 6. 📱 Responsive UI & Wallet Integration
- Built with **Next.js 16**, **TypeScript**, and **Tailwind CSS v4** styling.
- Works seamlessly on mobile viewports down to 375px.
- Connects securely with the **Freighter Wallet** to sign ledger transactions.
- Implements transaction locking/mutexes to prevent duplicate freighter wallet popups.
- Implements thorough error-handling and disabled inputs during transactions.

---

## 🌐 Live Contracts (Stellar Testnet)

| Contract | Address |
|---|---|
| **SubscriptionManager** | `CCMYKDKG5LGUQFJVQFNCWSUVKTKCA33CZ32ZXOLLP6GFM6LUEHNI52F4` |
| **RevenueRouter** | `CABPHTUFOX6NLNI5TYUSZF2CIXFMSEHGEU364NA4LNQVOXX5V7ZQDBPH2J` |
| **VaultToken** | `CAPQ327DH5GR5TGSWPIF44PIIDFQI3TNLA2DSSSY3GTZN32GQC6RNLDS` |

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
│   │   ├── dashboard/          # Creator dashboard (live splits, stats, activity feed)
│   │   ├── subscribe/          # Subscriber tier explorer & cancellation
│   │   └── admin/              # On-chain admin settings (splits & reward rate config)
│   ├── components/             # Freighter connection, modals, tables, and charts
│   ├── lib/contracts.ts        # Soroban client integration & SDK wrapper
│   └── hooks/                  # useWallet & useDashboard
├── scripts/
│   ├── deploy.sh               # Compile & deploy scripts
│   └── initialize.sh           # Configure parameters on-chain
└── .github/workflows/          # CI/CD validation actions
```

---

## 🚀 Quick Start & Development

### Run Tests
```bash
cargo test --workspace
```

### Build Frontend
```bash
cd frontend
pnpm install
pnpm dev
# → http://localhost:3000
```

---

## 📸 Screenshots

<img width="1260" height="870" alt="Screenshot 2026-04-23 at 10 10 33 PM" src="https://github.com/user-attachments/assets/a781d35a-50ad-40bc-b2e6-393746c092e9" />


<img width="1440" height="851" alt="Screenshot 2026-04-23 at 10 10 59 PM" src="https://github.com/user-attachments/assets/02c39694-31b8-4f7a-8691-8eea0ea766d7" />


<img width="1443" height="859" alt="Screenshot 2026-04-23 at 10 11 21 PM" src="https://github.com/user-attachments/assets/849b5d9c-aa9f-4d31-aba3-75c870c3855f" />


### Mobile view

<img width="353" height="770" alt="Screenshot 2026-04-23 at 10 12 24 PM" src="https://github.com/user-attachments/assets/5ff834c5-b0e1-411b-a0c4-18cce756173f" />


<img width="349" height="682" alt="Screenshot 2026-04-23 at 10 12 10 PM" src="https://github.com/user-attachments/assets/b8a6c097-2804-4051-a25c-f0c5f28798b1" />

---

## 📄 License

MIT © [Atharvashind](https://github.com/Atharvashind)

## Contributors

- [Atharvashind](https://github.com/Atharvashind)
