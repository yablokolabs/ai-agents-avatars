#!/usr/bin/env node
/**
 * Pins the collection to IPFS via Pinata in the order the metadata requires:
 * artwork first, then metadata that points at the artwork's CID. Prints the
 * collection CID to put in COLLECTION_CID before deploying.
 */
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

const ROOT = path.join(__dirname, "..");

/** Pinata takes either a JWT bearer token or the older key/secret header pair. */
function authHeaders(env) {
  if (env.PINATA_JWT) return { Authorization: `Bearer ${env.PINATA_JWT}` };
  if (env.PINATA_API_KEY && env.PINATA_API_SECRET) {
    return { pinata_api_key: env.PINATA_API_KEY, pinata_secret_api_key: env.PINATA_API_SECRET };
  }
  throw new Error("Set PINATA_JWT, or PINATA_API_KEY and PINATA_API_SECRET — see .env.example");
}

async function pinDirectory(files, label) {
  const form = new FormData();
  for (const { name, body } of files) {
    form.append("file", new Blob([body]), `${label}/${name}`);
  }
  form.append("pinataMetadata", JSON.stringify({ name: `ai-agents-avatars-${label}` }));
  form.append("pinataOptions", JSON.stringify({ cidVersion: 1, wrapWithDirectory: false }));

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: authHeaders(process.env),
    body: form,
  });
  if (!res.ok) throw new Error(`Pinata rejected ${label}: ${res.status} ${await res.text()}`);
  return (await res.json()).IpfsHash;
}

async function main() {
  authHeaders(process.env);

  // PNG, not the source SVG — most wallets will not render SVG from IPFS.
  const artDir = path.join(ROOT, "avatars-png");
  if (!fs.existsSync(artDir)) throw new Error("No PNGs — run `npm run art:png` first");
  const art = fs
    .readdirSync(artDir)
    .filter((f) => f.endsWith(".png"))
    .sort()
    .map((name) => ({ name, body: fs.readFileSync(path.join(artDir, name)) }));

  console.log(`Pinning ${art.length} images…`);
  const imagesCid = await pinDirectory(art, "images");
  console.log(`  images: ipfs://${imagesCid}`);

  // Token id is the array index, so tokenURI(n) resolves to n.json.
  const metadata = JSON.parse(fs.readFileSync(path.join(ROOT, "metadata.json"), "utf8"));
  const outDir = path.join(ROOT, "ipfs", "metadata");
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const docs = metadata.map((entry, id) => {
    const file = entry.image.split("/").pop().replace(/\.svg$/, ".png");
    const doc = { ...entry, image: `ipfs://${imagesCid}/${file}` };
    const body = JSON.stringify(doc, null, 2) + "\n";
    fs.writeFileSync(path.join(outDir, `${id}.json`), body);
    return { name: `${id}.json`, body };
  });

  console.log(`Pinning ${docs.length} metadata documents…`);
  const collectionCid = await pinDirectory(docs, "metadata");

  console.log(`\nCOLLECTION_CID=${collectionCid}`);
  console.log(`tokenURI(0) will resolve to ipfs://${collectionCid}/0.json`);
  console.log("Put that CID in .env, then run: npm run deploy:amoy");
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}

module.exports = { authHeaders };
