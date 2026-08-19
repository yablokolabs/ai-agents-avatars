#!/usr/bin/env node
/**
 * Publishes the collection into the Next.js app: metadata becomes the data the
 * grid renders, and the artwork is copied under public/ so the static export
 * serves it. Run from predev/prebuild so the site cannot drift from the source.
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const metadata = JSON.parse(fs.readFileSync(path.join(ROOT, "metadata.json"), "utf8"));

const collection = metadata.map((entry, id) => ({
  id,
  name: entry.name,
  imageUrl: `/avatars/${entry.image.split("/").pop()}`,
  traits: entry.attributes.map((a) => ({ key: a.trait_type, value: String(a.value) })),
}));

fs.mkdirSync(path.join(ROOT, "frontend", "lib"), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, "frontend", "lib", "collection.json"),
  JSON.stringify(collection, null, 2) + "\n"
);

const dest = path.join(ROOT, "frontend", "public", "avatars");
fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
for (const file of fs.readdirSync(path.join(ROOT, "avatars"))) {
  fs.copyFileSync(path.join(ROOT, "avatars", file), path.join(dest, file));
}

// The ABI comes straight from the compiled artifact so the site and the
// deployed contract cannot drift apart.
const artifact = path.join(ROOT, "artifacts", "contracts", "AIAgentsAvatars.sol", "AIAgentsAvatars.json");
if (!fs.existsSync(artifact)) {
  console.error("Missing contract artifact. Run `npx hardhat compile` first.");
  process.exit(1);
}
fs.writeFileSync(
  path.join(ROOT, "frontend", "lib", "abi.json"),
  JSON.stringify(JSON.parse(fs.readFileSync(artifact, "utf8")).abi, null, 2) + "\n"
);

console.log(`Synced ${collection.length} avatars and the contract ABI into frontend/`);
