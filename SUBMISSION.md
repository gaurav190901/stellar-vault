# StellarVault Submission

## Required Links

- Project: StellarVault
- Public GitHub repository: https://github.com/gaurav190901/stellar-vault
- Live demo: https://stellar-vault-app.netlify.app
- Demo video: **Human recording and upload required**
- Feedback form: https://docs.google.com/forms/d/1etiCOf1ZtK_5LS3Re1RSLpIK6nK8cF7zJ_Q2XKOpzHs/viewform

## Stellar Testnet Contracts

| Contract | Address |
|---|---|
| SubscriptionManager | `CCWWFT7W3GPFC23QQDWZKTKTACFMBA6ZREIEFRHFIX5EGOX4KZUMCGCZ` |
| RevenueRouter | `CARIU43DRKA3UZIEVRTRI5GY5QUX2OGIHWCCJ4GKHNNCQO27QPZOFI22` |
| VaultToken | `CBB3LIJZJ7CSPKVVFHVFQ2E2UPFSVKWSSZI2WC34NTL32UJPCIWZFTWA` |

## Checklist

| Requirement | Status | Evidence |
|---|---|---|
| Production-ready MVP | Ready locally | Smart contracts, frontend, wallet flow, telemetry, health endpoint |
| Stable frontend and contract architecture | Ready locally | 3-contract architecture and typed frontend integration |
| Mobile responsive UI | Ready locally | Responsive layout and mobile navigation; screenshots generated during verification |
| Loading states and error handling | Ready locally | Route loading/error boundaries and transaction-level states |
| User onboarding | Ready locally | `/onboarding` guided flow |
| 10 real users | **Human action required** | Follow [`docs/USER_TESTING.md`](./docs/USER_TESTING.md) |
| Proof of wallet interactions | Test evidence complete | [`evidence/testnet-wallet-interactions.csv`](./evidence/testnet-wallet-interactions.csv) |
| Basic feedback collection | Ready | Feedback form and [`docs/USER_FEEDBACK.md`](./docs/USER_FEEDBACK.md) |
| Production deployment | Existing deployment; update required | https://stellar-vault-app.netlify.app |
| Monitoring and analytics | Ready locally | `/status`, `/api/health`, `/api/telemetry`, Web Vitals and client error reporting |
| Project structure and documentation | Ready locally | Root README, deployment guide, evidence, and demo script |
| Stellar testnet deployment | Complete | 3 contract addresses above |
| 15+ meaningful commits | Complete | Public repository contains more than 15 commits |
| Public GitHub repository | Complete | Repository is public |
| Demo video | **Human action required** | Record with [`docs/DEMO_SCRIPT.md`](./docs/DEMO_SCRIPT.md) |
| Screenshots | Generated during final verification | Desktop, mobile, onboarding, and monitoring views |

## Traction Classification

- Mainnet transactions: 0
- Mainnet contract address: Not deployed
- Testnet transactions: 18 verified transactions in the latest automated validation run
- Testnet unique test wallets: 18
- Real human users: Do not claim until the 10-person runbook is complete

This distinction is intentional: automated wallets prove technical behavior, while the submission’s “real users” requirement needs human participation and consent.
