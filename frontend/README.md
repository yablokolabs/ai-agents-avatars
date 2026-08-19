# AI Agents Avatars — Mint Frontend

A minimal minting frontend for the **AI Agents Avatars** NFT collection (100 supply, Polygon).

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- ethers.js + wagmi (wallet connect + contract interaction)
- WalletConnect (MetaMask / mobile wallets)

## Prerequisites

- Node.js 18+
- A Polygon RPC endpoint (free: `https://polygon-rpc.com`)
- (Optional) WalletConnect project ID for mobile wallet support

## Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

> Replace `0xYOUR_CONTRACT_ADDRESS` with your deployed Polygon NFT contract address.

## Scripts

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build
npm start        # Serve production build
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_RPC_URL` | No | `https://polygon-rpc.com` | Polygon JSON-RPC endpoint |
| `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` | No | `0x000...0000` | Deployed NFT contract address |
| `WALLETCONNECT_PROJECT_ID` | No | `""` | WalletConnect project ID for mobile wallets |

## Deployment

### Cloudflare Pages (recommended)

1. Push this repo to GitHub.
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/) and click **Create a project**.
3. Connect your GitHub repository.
4. Under **Build settings**, set:
   - **Framework preset:** Next.js
   - **Build command:** `npm run build`
   - **Output directory:** `.next/standalone` (optional; if using the default output, leave as is)
5. Add the environment variables in **Settings → Environment variables**:
   - `NEXT_PUBLIC_RPC_URL` = `https://polygon-rpc.com`
   - `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` = `0xYOUR_CONTRACT_ADDRESS`
   - `WALLETCONNECT_PROJECT_ID` = (optional) your WalletConnect project ID
6. Click **Save and Deploy**.

### Netlify

1. Connect your Git repository in [Netlify](https://app.netlify.com/drop).
2. Add the environment variables in Site settings → Build & deploy → Environment.
3. Deploy.

### Self-hosted (Node.js)

```bash
npm run build
npm start
```

Serve the `.next/standalone` output with any static-capable server (e.g., `npx serve .next/standalone`).

## Features

- **Wallet Connect** — MetaMask (browser) and WalletConnect (mobile) via Wagmi.
- **Avatar Grid** — 100 procedurally generated avatars with trait metadata.
- **Mint Button** — Gas estimation in MATIC before confirming a mint transaction.
- **Admin Dashboard** — Simple protected-looking UI to trigger admin mints (placeholder flow).
- **Trait Info** — Each avatar displays Background, Eyes, Hat, and Expression traits.

## Notes

- This frontend uses placeholder avatar images from Picsum. Replace `imageUrl` in `lib/avatars.ts` with your IPFS CID or hosted image URLs.
- The contract ABI and `mint` function are minimal. Update `CONTRACT_ABI` and `CONTRACT_ADDRESS` in `components/MintButton.tsx` to match your deployed contract.
- IPFS metadata base URI is not yet wired in; add it to your contract or extend `getTokenURI` logic as needed.
