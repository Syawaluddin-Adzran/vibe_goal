# ⚽ VibeGoal — On-Chain Football Predictions

Predict football match scores on Solana. Results are verified trustlessly on-chain — no backend, no middleman.

## Live Demo

[Deploy to Vercel](#deploy-to-vercel)

## Program

- **Network:** Solana Devnet
- **Program ID:** `9VfRKuNCy8mNHnWYq8N3C9a4sPaJ98szckyf3vVHRzGu`
- **Explorer:** [View on Solana Explorer](https://explorer.solana.com/address/9VfRKuNCy8mNHnWYq8N3C9a4sPaJ98szckyf3vVHRzGu?cluster=devnet)

## How It Works

1. **Admin creates a match** — stores a `MatchAccount` on-chain with a unique match ID
2. **Users submit predictions** — each prediction is stored in a PDA seeded by `[pred, user_pubkey, match_id]`
3. **Admin sets the final score** — writes `home_score` and `away_score` to the match account
4. **Users verify** — call `check_prediction` to mark their prediction as correct/incorrect on-chain

## Tech Stack

- **Smart Contract:** Anchor (Rust) on Solana
- **Frontend:** Next.js 14, TypeScript
- **Wallet:** Phantom / Solflare via `@solana/wallet-adapter`
- **On-chain client:** `@coral-xyz/anchor`

## Local Development

### Prerequisites
- [Rust](https://rustup.rs/)
- [Solana CLI](https://docs.solanalabs.com/cli/install)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation)
- [Node.js 18+](https://nodejs.org/)

### Run the frontend locally

```bash
cd app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build the Anchor program

```bash
anchor build
```

### Deploy to devnet

```bash
anchor deploy --provider.cluster devnet
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Set **Root Directory** to `app`
4. Leave all other settings as default
5. Click **Deploy**

That's it — Vercel auto-detects Next.js.

## Project Structure

```
vibe_goal/
├── programs/vibe_goal/src/
│   └── lib.rs          # Anchor program (all instructions)
├── app/
│   ├── src/
│   │   ├── app/        # Next.js app router
│   │   ├── components/ # PredictTab, AdminTab, ResultsTab
│   │   ├── context/    # WalletProvider
│   │   ├── hooks/      # useVibeGoal (on-chain interactions)
│   │   └── idl/        # Program IDL
│   └── next.config.js
└── Anchor.toml
```
