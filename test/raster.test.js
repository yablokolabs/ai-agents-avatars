const { test, describe, before } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const PNG_DIR = path.join(ROOT, "avatars-png");
const svgs = fs.readdirSync(path.join(ROOT, "avatars")).filter((f) => f.endsWith(".svg")).sort();

describe("rasterised artwork", () => {
  before(() => {
    execFileSync("node", [path.join(ROOT, "scripts", "rasterize.js")], { stdio: "pipe" });
  });

  test("renders one PNG for every SVG", () => {
    const pngs = fs.readdirSync(PNG_DIR).filter((f) => f.endsWith(".png")).sort();
    assert.deepEqual(pngs, svgs.map((f) => f.replace(/\.svg$/, ".png")));
  });

  test("writes real PNG data, not empty or truncated files", () => {
    const MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    for (const file of fs.readdirSync(PNG_DIR)) {
      const buf = fs.readFileSync(path.join(PNG_DIR, file));
      assert.ok(buf.subarray(0, 8).equals(MAGIC), `${file} is not a PNG`);
      assert.ok(buf.length > 1000, `${file} is only ${buf.length} bytes — likely a blank render`);
    }
  });

  test("renders at the 512x512 the collection advertises", () => {
    for (const file of fs.readdirSync(PNG_DIR)) {
      const buf = fs.readFileSync(path.join(PNG_DIR, file));
      assert.equal(buf.readUInt32BE(16), 512, `${file} width`);
      assert.equal(buf.readUInt32BE(20), 512, `${file} height`);
    }
  });

  test("does not render every avatar identically", () => {
    const hashes = fs
      .readdirSync(PNG_DIR)
      .map((f) => require("node:crypto").createHash("sha256").update(fs.readFileSync(path.join(PNG_DIR, f))).digest("hex"));
    assert.equal(new Set(hashes).size, hashes.length, "duplicate renders mean traits are not reaching the raster");
  });
});
