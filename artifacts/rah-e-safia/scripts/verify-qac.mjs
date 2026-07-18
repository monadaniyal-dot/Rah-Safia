#!/usr/bin/env node
/**
 * artifacts/rah-e-safia/scripts/verify-qac.mjs
 *
 * CI-style integrity check for the committed QAC data files.
 * Exits 0 if both files are present and meet minimum key counts.
 * Exits 1 with a descriptive error if anything looks wrong.
 *
 * Usage:
 *   node scripts/verify-qac.mjs
 *   pnpm --filter @workspace/rah-e-safia run verify-qac
 */

import { existsSync, readFileSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = path.resolve(__dirname, "../public/data");
const MORPH_OUT = path.join(DATA_DIR, "qac-morphology.json");
const ROOTS_OUT = path.join(DATA_DIR, "qac-roots.json");

// Minimum expected record counts (conservative — well below the ~77k / ~1.8k actuals)
const MIN_MORPH_ENTRIES = 70_000;
const MIN_ROOT_ENTRIES  = 1_600;

let ok = true;

function fail(msg) {
  console.error(`[verify-qac] FAIL — ${msg}`);
  ok = false;
}

function check(filePath, minEntries, label) {
  if (!existsSync(filePath)) {
    fail(`${label} is missing: ${filePath}`);
    return;
  }

  const size = statSync(filePath).size;
  if (size === 0) {
    fail(`${label} is empty (0 bytes): ${filePath}`);
    return;
  }

  let data;
  try {
    data = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (e) {
    fail(`${label} is not valid JSON: ${e.message}`);
    return;
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    fail(`${label} root value must be an object`);
    return;
  }

  const count = Object.keys(data).length;
  if (count < minEntries) {
    fail(
      `${label} has only ${count.toLocaleString()} entries — expected ≥ ${minEntries.toLocaleString()}. ` +
      `The upstream data may have changed or the file may be truncated.`
    );
    return;
  }

  const kb = (size / 1024).toFixed(0);
  console.log(`[verify-qac] OK  ${label}: ${count.toLocaleString()} entries, ${kb} KB`);
}

console.log("[verify-qac] Checking QAC data files…");
check(MORPH_OUT, MIN_MORPH_ENTRIES, "qac-morphology.json");
check(ROOTS_OUT, MIN_ROOT_ENTRIES,  "qac-roots.json");

if (ok) {
  console.log("[verify-qac] All checks passed.");
  process.exit(0);
} else {
  console.error(
    "[verify-qac] One or more checks failed.\n" +
    "[verify-qac] Run: pnpm --filter @workspace/rah-e-safia run generate-qac -- --force"
  );
  process.exit(1);
}
