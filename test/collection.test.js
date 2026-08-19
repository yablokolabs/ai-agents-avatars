const { test, describe, before } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const metadata = JSON.parse(fs.readFileSync(path.join(ROOT, "metadata.json"), "utf8"));

const svgText = (file) =>
  [...fs.readFileSync(file, "utf8").matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1].trim());

const traitValues = new Set(
  metadata.flatMap((entry) => entry.attributes.map((a) => String(a.value)))
);

describe("collection source data", () => {
  test("describes exactly the hundred avatars the contract can mint", () => {
    assert.equal(metadata.length, 100);
    assert.equal(new Set(metadata.map((e) => e.name)).size, 100);
  });

  test("points every entry at an artwork file that exists", () => {
    for (const entry of metadata) {
      const file = entry.image.split("/").pop();
      assert.ok(
        fs.existsSync(path.join(ROOT, "avatars", file)),
        `${entry.name} references missing artwork ${file}`
      );
    }
  });

  test("produces artwork that a renderer can actually parse", () => {
    const script =
      "import sys,glob,xml.etree.ElementTree as ET\n" +
      "bad=[]\n" +
      "for f in sorted(glob.glob(sys.argv[1]+'/*.svg')):\n" +
      "  try: ET.parse(f)\n" +
      "  except ET.ParseError as e: bad.append(f.split('/')[-1]+': '+str(e))\n" +
      "print('\\n'.join(bad))";
    const out = execFileSync("python3", ["-c", script, path.join(ROOT, "avatars")], {
      encoding: "utf8",
    }).trim();

    assert.equal(out, "", `unparseable artwork would show as a broken image in wallets`);
  });

  test("never renders a clipped trait word in the artwork", () => {
    const offenders = [];
    for (const file of fs.readdirSync(path.join(ROOT, "avatars"))) {
      for (const label of svgText(path.join(ROOT, "avatars", file))) {
        if (label && !traitValues.has(label)) offenders.push(`${file}: "${label}"`);
      }
    }
    assert.deepEqual(offenders, [], `artwork shows text that is not a real trait value`);
  });

});

describe("what the site actually shows", () => {
  before(() => {
    execFileSync("node", [path.join(ROOT, "scripts", "sync-frontend.js")], { stdio: "pipe" });
  });

  test("serves the real collection, not stand-in artwork", () => {
    const shown = JSON.parse(
      fs.readFileSync(path.join(ROOT, "frontend", "lib", "collection.json"), "utf8")
    );

    assert.equal(shown.length, metadata.length);
    shown.forEach((avatar, i) => {
      assert.equal(avatar.name, metadata[i].name);
      assert.deepEqual(
        avatar.traits.map((t) => [t.key, t.value]),
        metadata[i].attributes.map((a) => [a.trait_type, a.value])
      );
    });
  });

  test("can load every image it links to from its own public directory", () => {
    const shown = JSON.parse(
      fs.readFileSync(path.join(ROOT, "frontend", "lib", "collection.json"), "utf8")
    );

    for (const avatar of shown) {
      assert.ok(avatar.imageUrl.startsWith("/avatars/"), `${avatar.name}: ${avatar.imageUrl}`);
      assert.ok(
        fs.existsSync(path.join(ROOT, "frontend", "public", avatar.imageUrl.slice(1))),
        `${avatar.name} links to ${avatar.imageUrl} which is not published`
      );
    }
  });
});
