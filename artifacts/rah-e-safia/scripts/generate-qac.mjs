#!/usr/bin/env node
/**
 * artifacts/rah-e-safia/scripts/generate-qac.mjs
 *
 * Runs automatically before `vite dev` / `vite build` via the package.json
 * "dev" and "build" scripts. Downloads the Quranic Arabic Corpus morphology
 * data and generates two compact JSON files that power the Word Study feature.
 *
 *   public/data/qac-morphology.json   — per-word morphological data keyed "S:A:W"
 *   public/data/qac-roots.json        — root occurrence index keyed by Arabic root
 *
 * Skips silently if both output files already exist (re-run by deleting them).
 *
 * ─── Attribution (required by the data license) ────────────────────────────
 * Quranic Arabic Corpus v0.4  (corpus.quran.com)
 * Copyright © 2011 Kais Dukes, GNU General Public License
 * "This annotation can be used in any website or application, provided its
 *  source (the Quranic Arabic Corpus) is clearly indicated, and a link is
 *  made to http://corpus.quran.com to enable users to keep track of changes."
 * ───────────────────────────────────────────────────────────────────────────
 */

import https from "https";
import { mkdirSync, writeFileSync, existsSync, createWriteStream } from "fs";
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = path.resolve(__dirname, "../public/data");
const MORPH_OUT = path.join(DATA_DIR, "qac-morphology.json");
const ROOTS_OUT = path.join(DATA_DIR, "qac-roots.json");
const TMP_ZIP   = "/tmp/qac_corpus.zip";

// ─── Skip if already generated ────────────────────────────────────────────────
if (existsSync(MORPH_OUT) && existsSync(ROOTS_OUT)) {
  console.log("[QAC] Data files present — skipping generation.");
  process.exit(0);
}

console.log("[QAC] Generating Quranic Arabic Corpus data files…");
console.log("[QAC] Data source: corpus.quran.com (used with attribution)");

// ─── Buckwalter → Arabic Unicode conversion ────────────────────────────────────
const BW = {
  A:"ا", b:"ب", t:"ت", v:"ث", j:"ج", H:"ح", x:"خ", d:"د", "*":"ذ",
  r:"ر", z:"ز", s:"س", $:"ش", S:"ص", D:"ض", T:"ط", Z:"ظ", E:"ع",
  g:"غ", f:"ف", q:"ق", k:"ك", l:"ل", m:"م", n:"ن", h:"ه", w:"و",
  y:"ي", p:"ة",
  "'":"ء", ">":"أ", "<":"إ", "{":"ا", "}":"ئ", "&":"ؤ", "`":"ء",
  Y:"ى", W:"ٱ", "|":"آ",
  // diacritics / phonological marks — discard for root/lemma display
  "~":"", o:"", a:"", i:"", u:"", F:"", K:"", N:"", I:"", "^":"",
};
const bw2ar = (s) => [...s].map((c) => BW[c] ?? c).join("").trim();

// ─── Download the QAC zip ──────────────────────────────────────────────────────
function download() {
  return new Promise((resolve, reject) => {
    const body = "downloadID=3&txtEmail=qac%40example.com&validEmail=null";
    const req  = https.request(
      {
        hostname: "corpus.quran.com",
        path    : "/download/default.jsp",
        method  : "POST",
        headers : {
          "Content-Type"  : "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
          "User-Agent"    : "qac-data-builder/1.0",
        },
      },
      (res) => {
        if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
        const out = createWriteStream(TMP_ZIP);
        res.pipe(out);
        out.on("finish", resolve);
        out.on("error", reject);
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ─── Parse morphology text → compact morphology map + root index ───────────────
function parse(text) {
  const morph = {};   // "S:A:W" → entry
  const roots = {};   // root_arabic → [[S,A,W], ...]

  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || line.startsWith("LOCATION")) continue;

    const parts = line.split("\t");
    if (parts.length < 4) continue;
    const [locStr, , , features] = parts;

    const m = locStr.match(/\((\d+):(\d+):(\d+):\d+\)/);
    if (!m) continue;
    const S = +m[1], A = +m[2], W = +m[3];
    const key = `${S}:${A}:${W}`;

    // Keep the first STEM segment per word token; skip PREFIX / SUFFIX
    if (!features.includes("STEM") || morph[key]) continue;

    const e = {};
    for (const fp of features.split("|")) {
      if      (fp.startsWith("POS:"))  e.p = fp.slice(4);
      else if (fp.startsWith("LEM:"))  e.l = bw2ar(fp.slice(4));
      else if (fp.startsWith("ROOT:")) e.r = bw2ar(fp.slice(5));
      else if (fp === "M")             e.g = "M";
      else if (fp === "F")             e.g = "F";
      else if (fp === "S" || fp === "MS" || fp === "FS") e.n = "S";
      else if (fp === "D" || fp === "MD" || fp === "FD") { if (!e.ps) e.n = "D"; }
      else if (fp === "P" || fp === "MP" || fp === "FP") { if (!e.ps) e.n = "P"; }
      else if (fp === "NOM")           e.c = "N";
      else if (fp === "ACC")           e.c = "A";
      else if (fp === "GEN")           e.c = "G";
      else if (fp === "INDEF")         e.i = "1";
      else if (fp === "PERF")          e.t = "PRF";
      else if (fp === "IMPF")          e.t = "IMPF";
      else if (fp === "IMPV")          e.t = "IMP";
      else if (fp === "ACT")           e.vn = "A";
      else if (fp === "PASS")          e.vn = "P";
      else if (/^[123][MF]?[SDP]$/.test(fp)) e.ps = fp;
      else if (fp === "MOOD:JUS")      e.md = "J";
      else if (fp === "MOOD:SUBJ")     e.md = "S";
    }

    morph[key] = e;
    if (e.r) (roots[e.r] ??= []).push([S, A, W]);
  }

  const rootsOut = {};
  for (const [r, positions] of Object.entries(roots)) {
    rootsOut[r] = { c: positions.length, w: positions };
  }

  return { morph, roots: rootsOut };
}

// ─── Main ──────────────────────────────────────────────────────────────────────
try {
  mkdirSync(DATA_DIR, { recursive: true });

  console.log("[QAC] Downloading morphology archive…");
  await download();
  console.log("[QAC] Download complete.");

  console.log("[QAC] Extracting morphology text…");
  const res = spawnSync(
    "unzip",
    ["-p", TMP_ZIP, "quranic-corpus-morphology-0.4.txt"],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  );
  if (res.status !== 0) throw new Error("unzip failed: " + res.stderr);
  const text = res.stdout;
  console.log(`[QAC] Lines: ${text.split(/\r?\n/).length.toLocaleString()}`);

  console.log("[QAC] Parsing…");
  const { morph, roots } = parse(text);
  console.log(`[QAC] Words: ${Object.keys(morph).length.toLocaleString()}`);
  console.log(`[QAC] Roots: ${Object.keys(roots).length.toLocaleString()}`);

  const morphJson = JSON.stringify(morph);
  const rootsJson = JSON.stringify(roots);

  writeFileSync(MORPH_OUT, morphJson, "utf8");
  writeFileSync(ROOTS_OUT, rootsJson, "utf8");

  const kb = (s) => (s.length / 1024).toFixed(0) + " KB";
  console.log(`[QAC] qac-morphology.json  ${kb(morphJson)}`);
  console.log(`[QAC] qac-roots.json       ${kb(rootsJson)}`);
  console.log("[QAC] Done. Required attribution: Quranic Arabic Corpus · corpus.quran.com");
} catch (err) {
  // Non-fatal: Vite starts normally; Word Study will show "loading" indefinitely
  // until the data files are generated on the next restart.
  console.warn("[QAC] Data generation failed:", err.message);
  console.warn("[QAC] Delete public/data/qac-*.json and restart to retry.");
}
