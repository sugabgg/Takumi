# 匠 TAKUMI

**Social Reputation on Canopy Network**

TAKUMI is a decentralized SocialFi application where every social interaction — every post, like, comment, follow, and repost — is signed locally by your wallet and recorded on-chain through Canopy Network. There is no centralized database: your identity, your content, and your reputation all live on the chain.

The name (匠) means "master craftsman." Reputation in TAKUMI is framed as a craftsman's standing — built post by post, certified by a hanko-style seal rather than a follower-count vanity metric.

---

## Overview

TAKUMI is a standalone TypeScript/React client. It does not modify or vendor the [Canopy Network protocol repository](https://github.com/canopy-network/canopy) (which is the Go consensus/FSM implementation) — instead it talks to a running Canopy node purely over RPC, the same way any external client would. All on-chain writes (profile edits, posts, likes, comments, follows, reposts) are encoded as signed transactions and submitted to the node's `/v1/tx` endpoint; all reads come from the node's `/v1/query/*` endpoints.

> **A note on the RPC contract.** Canopy is a generic, application-defined blockchain framework — the exact `/v1/query/*` and `/v1/tx` paths a given node exposes depend on the FSM module deployed on it. This client is built against a documented, internally-consistent contract (see [Canopy RPC Configuration](#canopy-rpc-configuration) below) for a `takumi.*` transaction module. If your node exposes different paths, update `src/services/*.service.ts` and `src/lib/canopyClient.ts` accordingly — that's the only place network shape lives.

## Features

- **Wallet Login** — self-custodial keystore (WebCrypto ECDSA P-256), generated and persisted locally in IndexedDB; no browser extension required
- **Create / Edit Profile** — on-chain profile record (username, display name, bio, avatar seed)
- **Follow / Unfollow** — on-chain social graph
- **Create On-chain Posts** — 280-character posts, signed and submitted as transactions
- **Like / Repost / Comment** — every interaction is a signed transaction, applied optimistically in the UI and reconciled with the chain result
- **Feed** — personalized home feed from followed accounts
- **User Timeline** — full post history for any address
- **Trending Posts** — network-wide ranking by recent engagement
- **Search Users / Search Posts** — on-chain indexed search
- **Notifications** — on-chain-derived activity feed (likes, comments, follows, reposts received)
- **Reputation Score** — a craftsman's seal, computed on-chain from weighted social actions
- **Responsive, mobile-first UI** — dark mode by default, optimistic updates, local feed cache, infinite scroll, loading skeletons, error boundaries, toast notifications

## Reputation weighting

| Action received      | Points |
| --------------------- | ------ |
| Post created          | +2     |
| Like received         | +1     |
| Comment received      | +3     |
| Follow received       | +5     |
| Repost received       | +4     |

The score itself is computed and stored on-chain by the node; the client only reads it and documents the weights (`src/types/domain.ts`) so the UI can explain itself.

## Installation

Requires Node.js 18+.

```bash
git clone <this-repository-url> takumi
cd takumi
npm install
cp .env.example .env
```

## Environment Variables

Set in `.env` (see `.env.example`):

| Variable               | Required | Default                  | Description                                              |
| ---------------------- | -------- | ------------------------- | ---------------------------------------------------------- |
| `RPC_PRIMARY`           | No       | `http://127.0.0.1:50002`  | Primary Canopy node RPC endpoint                          |
| `RPC_SECONDARY`         | No       | `http://127.0.0.1:50003`  | Secondary/fallback Canopy node RPC endpoint                |
| `VITE_CHAIN_ID`         | No       | unset (check skipped)     | Expected chain id, for a sanity check against the node     |
| `VITE_RPC_MAX_RETRIES`  | No       | `2`                       | Retry attempts per endpoint before failing over            |
| `VITE_RPC_TIMEOUT_MS`   | No       | `8000`                    | Per-request timeout before an attempt is considered failed |

## Project Structure

```
takumi/
├── .env.example
├── index.html
├── src/
│   ├── config/
│   │   └── network.ts          # RPC endpoints, retry policy, network config
│   ├── lib/
│   │   ├── canopyClient.ts     # Primary/secondary failover + retry HTTP client
│   │   ├── txBuilder.ts        # Builds, signs, and submits typed on-chain txs
│   │   ├── walletKeystore.ts   # Local WebCrypto keystore (sign/verify)
│   │   └── localCache.ts       # localStorage-backed read-through cache
│   ├── services/                # One module per on-chain capability
│   │   ├── wallet.service.ts
│   │   ├── profile.service.ts
│   │   ├── post.service.ts
│   │   ├── feed.service.ts
│   │   ├── follow.service.ts
│   │   ├── notification.service.ts
│   │   ├── search.service.ts
│   │   └── reputation.service.ts
│   ├── context/                 # Wallet / Toast / Theme providers
│   ├── hooks/                    # useFeed, useProfile, useNotifications, ...
│   ├── components/                # Navbar, Sidebar, PostCard, ProfileHeader, ...
│   ├── pages/                     # Feed, Profile, Create, Search, Notifications, Settings
│   ├── types/                     # Domain + transaction envelope types
│   └── utils/                     # Formatting, deterministic avatar derivation
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

## Canopy RPC Configuration

TAKUMI talks to exactly two endpoints, configured via `.env` and exported from `src/config/network.ts`:

- `RPC_PRIMARY` (default `http://127.0.0.1:50002`)
- `RPC_SECONDARY` (default `http://127.0.0.1:50003`)

**Failover policy** (`src/lib/canopyClient.ts`): every call is attempted against the primary endpoint first. On failure (network error, timeout, or 5xx) it retries against the same endpoint with exponential backoff up to `VITE_RPC_MAX_RETRIES` times, then automatically fails over to the secondary endpoint before the call is reported as failed to the caller. No service module talks to `fetch` directly — they all go through this one client, so the retry/failover behavior is consistent everywhere.

**Reads vs. writes:**

- Reads: `GET /v1/query/...` (profiles, posts, feeds, search, notifications, reputation)
- Writes: `POST /v1/tx` with a signed `{ unsigned, signature, publicKey }` envelope (see `src/types/transaction.ts`)

## Development

```bash
npm run dev
```

Starts Vite's dev server (default `http://localhost:5173`). Requires a Canopy node reachable at `RPC_PRIMARY` (or `RPC_SECONDARY`) exposing the contract described above.

## Build

```bash
npm run typecheck   # tsc -b --noEmit
npm run lint         # eslint .
npm run build        # tsc -b && vite build
```

Build output is written to `dist/`.

## Deployment

`dist/` is a static bundle and can be deployed to any static host (Vercel, Netlify, Cloudflare Pages, S3 + CDN, etc.). Set `RPC_PRIMARY` / `RPC_SECONDARY` (and the optional `VITE_*` variables) in the hosting provider's environment configuration before building, since Vite inlines them at build time. Point them at your production Canopy node(s) — for resilience, the primary and secondary should be different physical nodes, not two ports on the same machine.

## License

MIT
