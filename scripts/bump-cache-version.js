#!/usr/bin/env node
// Rewrites the ?v= cache-busting query string on assets/styles.css, assets/script.js
// and assets/i18n.js in every *.html file, using a short hash of each file's own
// content. Run manually with `node scripts/bump-cache-version.js`, or automatically
// via the pre-commit hook in .git/hooks/pre-commit.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const ASSET_PATHS = ["assets/styles.css", "assets/script.js", "assets/i18n.js"];

function shortHash(absPath) {
  const buf = fs.readFileSync(absPath);
  return crypto.createHash("sha1").update(buf).digest("hex").slice(0, 8);
}

const hashes = {};
for (const rel of ASSET_PATHS) {
  hashes[rel] = shortHash(path.join(ROOT, rel));
}

const htmlFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"));
const changed = [];

for (const file of htmlFiles) {
  const full = path.join(ROOT, file);
  const original = fs.readFileSync(full, "utf8");
  let content = original;
  for (const [rel, hash] of Object.entries(hashes)) {
    const escaped = rel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(${escaped})\\?v=[a-zA-Z0-9]+`, "g");
    content = content.replace(re, `$1?v=${hash}`);
  }
  if (content !== original) {
    fs.writeFileSync(full, content, "utf8");
    changed.push(file);
  }
}

if (changed.length) {
  console.log("Cache-busting versions updated in:", changed.join(", "));
} else {
  console.log("Cache-busting versions already up to date.");
}
