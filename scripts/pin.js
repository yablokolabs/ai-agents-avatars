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
const JWT = process.env.PINATA_JWT;

async function pinDirectory(files, label) {
  const form = new FormData();
  for (const { name, body } of files) {
    form.append("file", new Blob([body]), `${label}/${name}`);
  }
  form.append("pinataMetadata", JSON.stringify({ name: `ai-agents-avatars-${label}` }));
  form.append("pinataOptions", JSON.stringify({ cidVersion: 1, wrapWithDirectory: false }));

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${JWT}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Pinata rejected ${label}: ${res.status} ${await res.text()}`);
  return (await res.json()).IpfsHash;
}

async function main() {
  if (!JWT) throw new Error("Set PINATA_JWT in .env — see .env.example");

  const artDir = path.join(ROOT, "avatars");
  const art = fs
    .readdirSync(artDir)
    .filter((f) => f.endsWith(".svg"))
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
    const doc = { ...entry, image: `ipfs://${imagesCid}/${entry.image.split("/").pop()}` };
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

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
