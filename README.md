# AI Agents Avatars — NFT Collection

A 100-piece generative NFT collection of AI agent avatars.

## Traits

| Trait | Options | Rarest |
|-------|---------|--------|
| Background | Neon Grid, Data Stream, Void, Circuit Board, Cloud Matrix, Dark Mode, Solar Flare, Ocean Depth, Forest Code, City Lights | Data Stream (4%) |
| Agent Type | Coder, Designer, Analyst, Operator, Architect, Researcher, Builder, Scout, Guardian, Pilot | Coder (5%) |
| Accessory | Glasses, Headset, Badge, Cape, Helmet, Gloves, Boots, Backpack, Watch, None | Boots (4%) |
| Expression | Focused, Curious, Confident, Calm, Intense, Playful, Serious, Surprised, Sleepy, Determined | Curious (6%) |
| Palette | Monochrome, Pastel, Cyberpunk, Earthy, Oceanic, Sunset, Neon, Minimal, Vintage, Gradient | Minimal (6%) |

## Files

- `avatars/` — 100 SVG images (512x512)
- `traits.csv` — Trait combinations for all 100
- `traits.json` — Machine-readable traits
- `metadata.json` — EIP-721 metadata (ready for IPFS)
- `contracts/AIAgentsAvatars.sol` — ERC-721 contract
- `scripts/deploy.js` — Hardhat deployment script
- `frontend/` — Next.js minting page (Cloudflare Pages)

## How to Mint

1. Deploy contract to Polygon Mumbai testnet:
   ```bash
   npx hardhat run scripts/deploy.js --network mumbai
   ```
2. Pin metadata to IPFS (NFT.Storage free tier):
   ```bash
   npm install -g nft.storage-cli
   nft storage upload metadata.json --output ipfs://
   ```
3. Update `baseIpfsCid` in constructor when deploying.
4. Deploy to Cloudflare Pages:
   ```bash
   cd frontend
   npm install
   npm run build
   # Push to GitHub, import to Cloudflare Pages
   ```

## Royalty

2.5% on secondary sales (enforced via ERC-721Royalties).

## License

MIT
