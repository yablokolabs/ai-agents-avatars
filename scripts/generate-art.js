#!/usr/bin/env node
/**
 * Renders the 100 avatar SVGs from traits.json. Art is a pure function of the
 * five traits, so a token's appearance is reproducible from its metadata.
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const SIZE = 512;

const PALETTES = {
  Monochrome: { bg: "#1c1c1f", bgAlt: "#2b2b30", shell: "#d8d8dc", dark: "#8a8a90", accent: "#ffffff", glow: "#b0b0b8" },
  Pastel:     { bg: "#f5e6f7", bgAlt: "#e4d3f0", shell: "#fbc7d4", dark: "#d99bb0", accent: "#9ad0ec", glow: "#ffe8a3" },
  Cyberpunk:  { bg: "#12002e", bgAlt: "#26004d", shell: "#2de2e6", dark: "#0b7f85", accent: "#ff2a6d", glow: "#f9f871" },
  Earthy:     { bg: "#2f261c", bgAlt: "#463726", shell: "#c9a227", dark: "#8a6d1f", accent: "#7f9c5a", glow: "#e0c98f" },
  Oceanic:    { bg: "#04212f", bgAlt: "#07374d", shell: "#4dd0e1", dark: "#1f7a8c", accent: "#8ef6e4", glow: "#c2f5ff" },
  Sunset:     { bg: "#2b0f2b", bgAlt: "#5a1a3a", shell: "#ff8c42", dark: "#c25a2a", accent: "#ffd166", glow: "#ff5f6d" },
  Neon:       { bg: "#0a0a12", bgAlt: "#141428", shell: "#39ff14", dark: "#1f9c0c", accent: "#ff00ff", glow: "#00ffff" },
  Minimal:    { bg: "#fafafa", bgAlt: "#ededed", shell: "#2f2f2f", dark: "#9e9e9e", accent: "#4a4a4a", glow: "#d4d4d4" },
  Vintage:    { bg: "#2a2118", bgAlt: "#3d3020", shell: "#e8d5a3", dark: "#a8905c", accent: "#b5533c", glow: "#d9b96a" },
  Gradient:   { bg: "#141e30", bgAlt: "#243b55", shell: "#8fd3f4", dark: "#3f7fa6", accent: "#c471ed", glow: "#f7797d" },
};

const rect = (x, y, w, h, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra}/>`;
const line = (x1, y1, x2, y2, s, w, o = 1) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${s}" stroke-width="${w}" stroke-opacity="${o}" stroke-linecap="round"/>`;
const circle = (cx, cy, r, fill, extra = "") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${extra}/>`;
const pathEl = (d, fill, extra = "") => `<path d="${d}" fill="${fill}"${extra}/>`;
const stroke = (d, s, w, o = 1) => `<path d="${d}" fill="none" stroke="${s}" stroke-width="${w}" stroke-opacity="${o}" stroke-linecap="round"/>`;

const BACKGROUNDS = {
  "Neon Grid": (p) => {
    const out = [];
    for (let i = 32; i < SIZE; i += 32) {
      out.push(line(i, 0, i, SIZE, p.glow, 1, 0.18), line(0, i, SIZE, i, p.glow, 1, 0.18));
    }
    return out.join("");
  },
  "Data Stream": (p) => {
    const out = [];
    for (let i = 0; i < 16; i++) {
      const x = 16 + i * 32;
      const len = 40 + ((i * 53) % 120);
      const y = (i * 71) % 300;
      out.push(line(x, y, x, y + len, p.glow, 3, 0.22), line(x, y + len + 24, x, y + len + 24 + len / 2, p.accent, 3, 0.15));
    }
    return out.join("");
  },
  Void: (p) => [3, 2.2, 1.5].map((m, i) => circle(256, 256, 90 * m, "none", ` stroke="${p.glow}" stroke-width="1.5" stroke-opacity="${0.1 + i * 0.04}"`)).join(""),
  "Circuit Board": (p) => {
    const out = [];
    for (let i = 0; i < 8; i++) {
      const y = 30 + i * 60;
      const bend = 90 + ((i * 47) % 260);
      out.push(stroke(`M0 ${y} H${bend} V${y + 40}`, p.glow, 2, 0.2));
      out.push(circle(bend, y + 40, 4, p.accent, ` fill-opacity="0.35"`));
    }
    return out.join("");
  },
  "Cloud Matrix": (p) => {
    const out = [];
    for (let i = 0; i < 9; i++) {
      const cx = 40 + ((i * 97) % 440);
      const cy = 40 + ((i * 61) % 430);
      out.push(circle(cx, cy, 34 + ((i * 13) % 30), p.bgAlt, ` fill-opacity="0.55"`));
    }
    return out.join("");
  },
  "Dark Mode": (p) => rect(0, 300, SIZE, 212, p.bgAlt, ` fill-opacity="0.6"`),
  "Solar Flare": (p) => {
    const out = [circle(470, 40, 120, p.glow, ` fill-opacity="0.16"`)];
    for (let i = 0; i < 10; i++) out.push(line(470, 40, 470 - i * 58, 40 + (i + 2) * 46, p.accent, 2, 0.14));
    return out.join("");
  },
  "Ocean Depth": (p) => {
    const out = [];
    for (let i = 0; i < 7; i++) {
      const y = 70 + i * 62;
      out.push(stroke(`M0 ${y} Q128 ${y - 22} 256 ${y} T512 ${y}`, p.glow, 2.5, 0.16));
    }
    return out.join("");
  },
  "Forest Code": (p) => {
    const out = [];
    for (let i = 0; i < 12; i++) {
      const x = 20 + i * 42;
      const h = 120 + ((i * 83) % 300);
      out.push(line(x, SIZE, x, SIZE - h, p.glow, 2, 0.16));
      out.push(line(x, SIZE - h, x + 16, SIZE - h - 18, p.accent, 2, 0.14));
    }
    return out.join("");
  },
  "City Lights": (p) => {
    const out = [];
    for (let i = 0; i < 60; i++) {
      const x = ((i * 89) % 30) * 17 + 8;
      const y = ((i * 137) % 29) * 17 + 8;
      out.push(rect(x, y, 7, 9, i % 3 ? p.glow : p.accent, ` fill-opacity="0.2"`));
    }
    return out.join("");
  },
};

/** Head silhouette per agent type. Returns { d, eyeY, top } */
const HEADS = {
  Coder:      { d: "M156 150 H356 V320 Q356 344 332 344 H180 Q156 344 156 320 Z", eyeY: 232, top: 150 },
  Designer:   { d: "M256 138 Q368 138 368 246 Q368 348 256 348 Q144 348 144 246 Q144 138 256 138 Z", eyeY: 238, top: 138 },
  Analyst:    { d: "M256 134 L358 190 L358 296 L256 352 L154 296 L154 190 Z", eyeY: 238, top: 134 },
  Operator:   { d: "M164 152 H348 V342 H164 Z", eyeY: 234, top: 152 },
  Architect:  { d: "M196 138 H316 L354 344 H158 Z", eyeY: 244, top: 138 },
  Researcher: { d: "M144 268 Q144 140 256 140 Q368 140 368 268 V344 H144 Z", eyeY: 240, top: 140 },
  Builder:    { d: "M150 156 H362 V300 Q362 348 300 348 H212 Q150 348 150 300 Z", eyeY: 232, top: 156 },
  Scout:      { d: "M186 146 H326 Q346 146 346 172 V318 Q346 346 316 346 H196 Q166 346 166 318 V172 Q166 146 186 146 Z", eyeY: 234, top: 146 },
  Guardian:   { d: "M154 148 H358 V262 Q358 336 256 356 Q154 336 154 262 Z", eyeY: 232, top: 148 },
  Pilot:      { d: "M148 262 Q148 142 256 142 Q364 142 364 262 V330 Q364 348 340 348 H172 Q148 348 148 330 Z", eyeY: 244, top: 142 },
};

const ANTENNA = {
  Coder: (p, t) => line(256, t, 256, t - 34, p.dark, 6) + circle(256, t - 42, 10, p.accent),
  Scout: (p, t) => line(300, t + 4, 330, t - 40, p.dark, 5) + circle(332, t - 46, 9, p.accent),
  Operator: (p, t) => line(196, t, 196, t - 26, p.dark, 5) + line(316, t, 316, t - 26, p.dark, 5) + circle(196, t - 32, 7, p.accent) + circle(316, t - 32, 7, p.accent),
  Researcher: (p, t) => line(256, t - 2, 256, t - 40, p.dark, 5) + circle(256, t - 50, 12, p.glow, ` fill-opacity="0.75"`),
  Architect: (p, t) => line(226, t, 226, t - 28, p.dark, 5) + line(286, t, 286, t - 20, p.dark, 5) + circle(226, t - 34, 7, p.accent),
  Pilot: (p, t) => line(148, t + 80, 120, t + 60, p.dark, 6) + line(364, t + 80, 392, t + 60, p.dark, 6),
  Guardian: (p, t) => pathEl(`M256 ${t - 40} L272 ${t - 8} H240 Z`, p.accent),
  Builder: (p, t) => rect(232, t - 22, 48, 22, p.dark, ` rx="6"`),
  Analyst: (p, t) => circle(256, t - 18, 9, p.accent, ` fill-opacity="0.9"`),
  Designer: (p, t) => circle(200, t + 4, 8, p.accent) + circle(312, t + 4, 8, p.accent),
};

/** Eyes and mouth. eyeY is the pupil line; mouth sits 62px below. */
const EXPRESSIONS = {
  Focused: (p, y) => rect(198, y - 6, 44, 13, p.accent, ` rx="6"`) + rect(270, y - 6, 44, 13, p.accent, ` rx="6"`) + stroke(`M216 ${y + 62} H296`, p.dark, 7),
  Curious: (p, y) => circle(216, y, 23, p.accent) + circle(296, y, 13, p.accent) + circle(256, y + 62, 12, "none", ` stroke="${p.dark}" stroke-width="6"`),
  Confident: (p, y) => stroke(`M194 ${y} Q216 ${y - 20} 240 ${y}`, p.accent, 9) + stroke(`M272 ${y} Q294 ${y - 20} 318 ${y}`, p.accent, 9) + stroke(`M212 ${y + 58} Q256 ${y + 82} 300 ${y + 50}`, p.dark, 7),
  Calm: (p, y) => stroke(`M192 ${y + 6} Q216 ${y - 14} 240 ${y + 6}`, p.accent, 8) + stroke(`M272 ${y + 6} Q296 ${y - 14} 320 ${y + 6}`, p.accent, 8) + stroke(`M216 ${y + 58} Q256 ${y + 76} 296 ${y + 58}`, p.dark, 7),
  Intense: (p, y) => pathEl(`M190 ${y - 16} L244 ${y - 2} L244 ${y + 12} L190 ${y + 2} Z`, p.accent) + pathEl(`M322 ${y - 16} L268 ${y - 2} L268 ${y + 12} L322 ${y + 2} Z`, p.accent) + stroke(`M214 ${y + 62} H298`, p.dark, 8),
  Playful: (p, y) => circle(214, y, 20, p.accent) + stroke(`M274 ${y} Q296 ${y - 18} 318 ${y}`, p.accent, 9) + stroke(`M210 ${y + 52} Q256 ${y + 88} 302 ${y + 52}`, p.dark, 7),
  Serious: (p, y) => circle(216, y, 18, p.accent) + circle(296, y, 18, p.accent) + stroke(`M208 ${y + 62} H304`, p.dark, 8),
  Surprised: (p, y) => circle(214, y, 26, p.accent) + circle(298, y, 26, p.accent) + circle(256, y + 66, 17, "none", ` stroke="${p.dark}" stroke-width="7"`),
  Sleepy: (p, y) => stroke(`M190 ${y} Q216 ${y + 18} 242 ${y}`, p.accent, 8) + stroke(`M270 ${y} Q296 ${y + 18} 322 ${y}`, p.accent, 8) + circle(256, y + 62, 10, p.dark),
  Determined: (p, y) => pathEl(`M192 ${y - 12} L242 ${y - 2} L242 ${y + 10} L192 ${y} Z`, p.accent) + pathEl(`M320 ${y - 12} L270 ${y - 2} L270 ${y + 10} L320 ${y} Z`, p.accent) + rect(212, y + 54, 88, 12, p.dark, ` rx="6"`),
};

/** Accessories draw in two layers so capes and packs sit behind the body. */
const ACCESSORIES = {
  Glasses: { front: (p, y) => circle(216, y, 34, p.glow, ` fill-opacity="0.22" stroke="${p.dark}" stroke-width="7"`) + circle(296, y, 34, p.glow, ` fill-opacity="0.22" stroke="${p.dark}" stroke-width="7"`) + line(250, y, 262, y, p.dark, 7) },
  Headset: { front: (p, y, t) => rect(126, y - 34, 34, 76, p.dark, ` rx="14"`) + rect(352, y - 34, 34, 76, p.dark, ` rx="14"`) + stroke(`M143 ${y - 30} Q256 ${t - 56} 369 ${y - 30}`, p.dark, 12) + stroke(`M143 ${y + 40} Q168 ${y + 96} 214 ${y + 92}`, p.dark, 8) + circle(220, y + 92, 9, p.accent) },
  Badge: { front: (p) => circle(322, 424, 26, p.accent) + circle(322, 424, 13, p.bg, ` fill-opacity="0.5"`) },
  Cape: { back: (p) => pathEl("M146 356 Q64 452 84 512 H428 Q448 452 366 356 Z", p.accent, ` fill-opacity="0.85"`) },
  Helmet: { front: (p, y, t) => pathEl(`M138 ${t + 96} Q138 ${t - 34} 256 ${t - 34} Q374 ${t - 34} 374 ${t + 96} Z`, p.dark, ` fill-opacity="0.92"`) + rect(138, t + 88, 236, 18, p.accent, ` rx="9"`) },
  Gloves: { front: (p) => circle(146, 486, 27, p.accent) + circle(366, 486, 27, p.accent) },
  Boots: { front: (p) => rect(178, 474, 72, 38, p.accent, ` rx="12"`) + rect(262, 474, 72, 38, p.accent, ` rx="12"`) },
  Backpack: {
    back: (p) => rect(96, 384, 40, 106, p.dark, ` rx="18"`) + rect(376, 384, 40, 106, p.dark, ` rx="18"`),
    front: (p) => stroke("M212 398 L232 512", p.accent, 15) + stroke("M300 398 L280 512", p.accent, 15),
  },
  Watch: { front: (p) => rect(120, 438, 52, 36, p.accent, ` rx="10"`) + rect(130, 446, 32, 20, p.bg, ` rx="5"`) },
  None: {},
};

function render(t) {
  const p = PALETTES[t.palette];
  const head = HEADS[t.agentType];
  const acc = ACCESSORIES[t.accessory] || {};
  const y = head.eyeY;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="${t.agentType} agent avatar">`,
    rect(0, 0, SIZE, SIZE, p.bg),
    BACKGROUNDS[t.background](p),
    acc.back ? acc.back(p, y, head.top) : "",
    // arms, then torso over them
    rect(124, 402, 44, 110, p.dark, ` rx="22" stroke="${p.bg}" stroke-width="5"`),
    rect(344, 402, 44, 110, p.dark, ` rx="22" stroke="${p.bg}" stroke-width="5"`),
    pathEl("M158 512 Q158 392 256 392 Q354 392 354 512 Z", p.dark),
    rect(232, 344, 48, 56, p.dark),
    ANTENNA[t.agentType](p, head.top),
    pathEl(head.d, p.shell),
    EXPRESSIONS[t.expression](p, y),
    acc.front ? acc.front(p, y, head.top) : "",
    "</svg>",
  ].join("\n");
}

const traits = JSON.parse(fs.readFileSync(path.join(ROOT, "traits.json"), "utf8"));
const outDir = path.join(ROOT, "avatars");
fs.mkdirSync(outDir, { recursive: true });

for (const t of traits) {
  const file = `avatar_${String(t.tokenId).padStart(3, "0")}.svg`;
  fs.writeFileSync(path.join(outDir, file), render(t) + "\n");
}
console.log(`Rendered ${traits.length} avatars to avatars/`);
