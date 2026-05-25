#!/usr/bin/env node
/**
 * Scans the built dist/ for known tracker signatures and external resource URLs.
 * Run after `npm run build`.
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");

if (!existsSync(distDir)) {
  console.error("dist/ not found — run npm run build first");
  process.exit(1);
}

let failures = 0;

function fail(msg) {
  console.error(`FAIL  ${msg}`);
  failures++;
}

// Known analytics / marketing trackers and cookie-writing patterns
const TRACKER_PATTERNS = [
  { re: /google-analytics\.com/, label: "Google Analytics" },
  { re: /googletagmanager\.com/, label: "Google Tag Manager" },
  { re: /gtag\s*\(/, label: "gtag()" },
  { re: /fbq\s*\(/, label: "Facebook Pixel" },
  { re: /mixpanel/i, label: "Mixpanel" },
  { re: /segment\.com/, label: "Segment" },
  { re: /amplitude\.com/, label: "Amplitude" },
  { re: /heap\.io/, label: "Heap Analytics" },
  { re: /hotjar\.com/, label: "Hotjar" },
  { re: /intercom\.com/, label: "Intercom" },
  { re: /crisp\.chat/, label: "Crisp Chat" },
  { re: /document\.cookie\s*=/, label: "cookie write (document.cookie =)" },
];

// Scan JS bundles
const assetsDir = join(distDir, "assets");
const jsFiles = existsSync(assetsDir)
  ? readdirSync(assetsDir).filter((f) => f.endsWith(".js"))
  : [];

for (const file of jsFiles) {
  const content = readFileSync(join(assetsDir, file), "utf-8");
  for (const { re, label } of TRACKER_PATTERNS) {
    if (re.test(content)) {
      fail(`${label} found in bundle: ${file}`);
    }
  }
}

// Scan HTML for external src/href attributes
const html = readFileSync(join(distDir, "index.html"), "utf-8");
const extUrl = /(?:src|href)=["'](https?:\/\/[^"']+)["']/g;
let match;
while ((match = extUrl.exec(html)) !== null) {
  fail(`External URL in HTML: ${match[1]}`);
}

if (failures === 0) {
  process.stdout.write(
    `Privacy check passed — ${jsFiles.length} JS bundle(s) scanned, HTML checked.\n`,
  );
} else {
  console.error(`\n${failures} privacy violation(s) found.`);
  process.exit(1);
}
