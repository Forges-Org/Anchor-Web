# ⚓️ AnchorFlow

**Real-time fiat corridor health monitoring and smart routing for Stellar anchors.**

AnchorFlow continuously probes anchors across every registered corridor, aggregates live fee and reliability data, and exposes a routing API that always returns the best available anchor for a given asset pair and destination country. A Soroban smart contract acts as the on-chain source of truth — health attestations are written every epoch and queryable by any contract on Stellar, with no trust in AnchorFlow's server required.

> Organization: **StellarForge** — forging the infrastructure layer of the Stellar ecosystem.  
> License: MIT · Built on Stellar

---

## The Problem

Stellar's anchor network enables fiat settlement across 60+ countries, but it is largely unmonitored. Developers often hardcode one anchor per corridor and have little visibility when a service degrades. SEP-24 flows can silently fail, fee estimates drift over time, and there is no public infrastructure that tells developers or end users:

- Whether a corridor is operational
- Which anchor currently offers the best route
- What the real cost of a transfer is
- How reliable a corridor has been historically
- Which fallback route should be used when an anchor is unavailable

AnchorFlow solves this visibility gap.

---

## What AnchorFlow Does

| Without AnchorFlow | With AnchorFlow |
|-------------------|-----------------|
| HTTP 503 errors with no fallback | Automatic rerouting to the healthiest anchor |
| Fee data becomes outdated | Live normalized fee monitoring |
| One hardcoded anchor per corridor | Dynamic routing based on health scores |
| No reliability history | On-chain audit trail of anchor performance |
| Corridor outages discovered by users | Continuous proactive monitoring |

---

## Key Features

* **API Key Management**: generate, rotate, and revoke keys
* **Wallet/Account Tracking**: monitor accounts created via the SDK
* **Activity Metrics**: view transaction volumes and status
* **Requests over time**: visualize API request traffic trends
* **Wallet creation analytics**: monitor daily wallet creation volume
* **Network Switching**: testnet vs mainnet tracking
* **Usage Monitoring**: see platform-sponsored actions and account health

---

## Quick Start

### Prerequisites

- Rust
- Stellar CLI
- Node.js 20+
- PostgreSQL

### Clone Repository

```bash
git clone https://github.com/stellarforge/anchorflow
cd anchorflow
```

### Auth and API client behavior

This repo now includes a minimal auth flow and API client support for dev mode:

* `src/lib/api.js` adds request header support with `x-request-id` and automatic session refresh on `401`
* `src/lib/session.js` persists auth state in `localStorage` and clears stale sessions gracefully
* `src/hooks/useWallets.ts` adds a wallet query hook that loads wallets from `/api/wallets`
* `src/app/api/auth/refresh/route.ts`, `/api/wallets/route.ts`, and `/api/wallets/[id]/route.ts` simulate auth-protected backend behavior for local testing

### Smoke tests

Run full smokes tests with:

```bash
npm test
```

---

## License

MIT License

---

### Built by StellarForge ⚒️

Forging the infrastructure layer of the Stellar ecosystem.
