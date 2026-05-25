import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname, basename } from "path";

const FORBIDDEN = "nonogram";
const SEARCH_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".html",
  ".css",
  ".md",
  ".json",
  ".yml",
  ".yaml",
]);
const EXCLUDE_DIRS = new Set([
  "node_modules",
  "dist",
  "coverage",
  ".git",
  "playwright-report",
]);
// Instruction files that define the rule are excluded from the check
const EXCLUDE_FILES = new Set([
  "p-xing-js-coding-agent-instructions.md",
  "CLAUDE.md",
  "check-forbidden-terms.mjs",
]);

let found = false;

function scan(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      scan(full);
    } else if (
      SEARCH_EXTENSIONS.has(extname(entry)) &&
      !EXCLUDE_FILES.has(basename(entry))
    ) {
      let content;
      try {
        content = readFileSync(full, "utf8");
      } catch {
        continue;
      }
      if (content.toLowerCase().includes(FORBIDDEN)) {
        console.error(`Forbidden term found in: ${full}`);
        found = true;
      }
    }
  }
}

scan(".");

if (found) {
  process.exit(1);
} else {
  console.warn("check:terms passed — no forbidden terms found.");
}
