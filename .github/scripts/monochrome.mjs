// Recolours a generated stats card to the README's monochrome palette.
//
// github-readme-stats has no option to override per-language colours, so the
// top-languages card ships GitHub's brand colours (yellow JS, orange HTML...)
// which clash with the grey/white terminal theme. This rewrites any fill that
// isn't already part of the theme onto a grey ramp, in order of first
// appearance, so the languages stay distinguishable without any colour.
//
// Deliberately generic: it maps whatever colours it finds, so it keeps working
// as the language breakdown changes rather than hardcoding today's set.

import { readFile, writeFile } from "node:fs/promises";

// Theme colours that must survive untouched (background, title, body text).
const KEEP = new Set(["#0d1117", "#ffffff", "#8b949e"]);

// Light -> dark. Ordered so the largest language reads brightest.
const RAMP = ["#f0f6fc", "#c9d1d9", "#8b949e", "#6e7681", "#484f58", "#30363d"];

const file = process.argv[2];
if (!file) {
  console.error("usage: monochrome.mjs <file.svg>");
  process.exit(1);
}

const original = await readFile(file, "utf8");
const assigned = new Map();

const recoloured = original.replace(
  /fill="(#[0-9a-fA-F]{3,6})"/g,
  (match, colour) => {
    const key = colour.toLowerCase();
    if (KEEP.has(key)) {
      return match;
    }
    if (!assigned.has(key)) {
      assigned.set(key, RAMP[assigned.size % RAMP.length]);
    }
    return `fill="${assigned.get(key)}"`;
  },
);

if (recoloured === original) {
  console.log(`${file}: already monochrome, nothing to do`);
} else {
  await writeFile(file, recoloured);
  console.log(`${file}: recoloured ${assigned.size} colour(s) to greyscale`);
}
