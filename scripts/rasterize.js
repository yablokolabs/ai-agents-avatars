#!/usr/bin/env node
/**
 * Renders the SVG artwork to 512x512 PNG. Wallets and link unfurlers largely
 * refuse SVG, so the PNGs are what gets pinned and what metadata points at.
 * The SVGs stay the source of truth — edit the generator, then re-run this.
 */
const fs = require("node:fs");
const path = require("node:path");
const { Resvg } = require("@resvg/resvg-js");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "avatars");
const OUT = path.join(ROOT, "avatars-png");
const SIZE = 512;

function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const svgs = fs.readdirSync(SRC).filter((f) => f.endsWith(".svg")).sort();
  for (const file of svgs) {
    const svg = fs.readFileSync(path.join(SRC, file));
    const png = new Resvg(svg, { fitTo: { mode: "width", value: SIZE } }).render().asPng();
    fs.writeFileSync(path.join(OUT, file.replace(/\.svg$/, ".png")), png);
  }

  console.log(`Rendered ${svgs.length} PNGs at ${SIZE}x${SIZE} to avatars-png/`);
}

if (require.main === module) main();
