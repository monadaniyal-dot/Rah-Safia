/**
 * Quranic Word Study API
 *
 * Data sources (all free, no auth required):
 *   - api.quran.com/api/v4     → word-by-word data per verse (English gloss, audio)
 *   - audio.qurancdn.com       → word-level pronunciation audio
 *   - /data/qac-morphology.json → per-word morphological data (generated from QAC)
 *   - /data/qac-roots.json      → root occurrence index (generated from QAC)
 *
 * ─── Attribution (required by QAC data license) ──────────────────────────────
 * Quranic Arabic Corpus v0.4  (corpus.quran.com)
 * Copyright © 2011 Kais Dukes, GNU General Public License
 * "This annotation can be used in any website or application, provided its
 *  source (the Quranic Arabic Corpus) is clearly indicated, and a link is
 *  made to http://corpus.quran.com."
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Caching: module-level Maps / singletons, keyed by "surah:ayah".
 */

import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

// ─── Base URLs ─────────────────────────────────────────────────────────────────
const QURANCOM   = "https://api.quran.com/api/v4";
export const WORD_AUDIO_BASE = "https://audio.qurancdn.com/";

// ─── Verse word type (from Quran.com) ─────────────────────────────────────────

export interface VerseWord {
  id: number;
  position: number;         // 1-based position among "word" tokens
  audioUrl: string;         // relative, prepend WORD_AUDIO_BASE
  textUthmani: string;      // Arabic Uthmani text
  charType: string;         // "word" | "end" | "pause" | "sajdah" | "rub-el-hizb"
  translation: string;      // English meaning
  transliteration: string;  // Romanised transliteration
}

// ─── QAC morphological entry ───────────────────────────────────────────────────
// Fields match the compact keys written by scripts/generate-qac.mjs.

export interface QACEntry {
  r?: string;           // Root (Arabic Unicode, e.g. "رحم")
  l?: string;           // Lemma (Arabic Unicode)
  p?: string;           // Part-of-speech tag (N, V, ADJ, PN, PRON, P, CONJ, …)
  g?: "M" | "F";        // Gender
  n?: "S" | "D" | "P";  // Number (singular / dual / plural)
  c?: "N" | "A" | "G";  // Case (nominative / accusative / genitive)
  i?: "1";              // Indefinite marker
  t?: "PRF" | "IMPF" | "IMP"; // Verb aspect (perfect / imperfect / imperative)
  ps?: string;          // Person (e.g. "3MS", "1P", "2FS")
  vn?: "A" | "P";       // Voice (active / passive)
  md?: "J" | "S";       // Mood (jussive / subjunctive)
}

// ─── QAC root occurrence index entry ──────────────────────────────────────────

export interface QACRootEntry {
  c: number;                        // Total token count across the Quran
  w: Array<[number, number, number]>; // [surahNum, ayahNum, wordPos] (1-based)
}

// ─── Tafseer result ────────────────────────────────────────────────────────────

export interface TafseerResult {
  text: string;
  isHtml: boolean;
}

// ─── Diacritics strip ─────────────────────────────────────────────────────────

export function stripDiacritics(text: string): string {
  return text
    .replace(/\uFEFF/g, "")
    .replace(/\u0670/g, "\u0627")
    .replace(/[\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E4\u06E5\u06E6\u06E7\u06E8\u06EA-\u06ED]/g, "")
    .replace(/\u0640/g, "")
    .replace(/[ٱإأآا]/g, "\u0627")
    .replace(/\u0649/g, "\u064A")
    .replace(/\u0629/g, "\u0647")
    .trim();
}

// ─── QAC data loaders (lazy, cached, fire-once) ────────────────────────────────

type MorphMap = Record<string, QACEntry>;
type RootsMap = Record<string, QACRootEntry>;

let _morphCache: MorphMap | null = null;
let _rootsCache: RootsMap | null = null;
let _morphPromise: Promise<MorphMap> | null = null;
let _rootsPromise: Promise<RootsMap> | null = null;

function loadMorphology(): Promise<MorphMap> {
  if (_morphCache) return Promise.resolve(_morphCache);
  if (_morphPromise) return _morphPromise;
  _morphPromise = fetch("/data/qac-morphology.json")
    .then((r) => {
      if (!r.ok) throw new Error(`QAC morph HTTP ${r.status}`);
      return r.json() as Promise<MorphMap>;
    })
    .then((d) => { _morphCache = d; _morphPromise = null; return d; })
    .catch((e) => { _morphPromise = null; throw e; });
  return _morphPromise;
}

function loadRoots(): Promise<RootsMap> {
  if (_rootsCache) return Promise.resolve(_rootsCache);
  if (_rootsPromise) return _rootsPromise;
  _rootsPromise = fetch("/data/qac-roots.json")
    .then((r) => {
      if (!r.ok) throw new Error(`QAC roots HTTP ${r.status}`);
      return r.json() as Promise<RootsMap>;
    })
    .then((d) => { _rootsCache = d; _rootsPromise = null; return d; })
    .catch((e) => { _rootsPromise = null; throw e; });
  return _rootsPromise;
}

/**
 * Start fetching both QAC data files in the background.
 * Call on mount of pages that contain interactive words so data is warm
 * by the time the user long-presses.
 */
export function preloadQACData(): void {
  loadMorphology().catch(() => { /* silently ignored */ });
  loadRoots().catch(() => { /* silently ignored */ });
}

/**
 * Look up morphological data for a single word token.
 *
 * Always use the canonical word position from the Quran.com match
 * (`wordData.position`) rather than the raw rendered index, because
 * basmala-stripped first-ayah display can shift rendered indices.
 *
 * Throws if the QAC data file cannot be loaded (network failure, etc.).
 * Returns null if the word is present but has no STEM segment (e.g. ayah
 * markers, pause signs) or if the position is simply not in the corpus.
 *
 * @param surah   1-based surah number
 * @param ayah    1-based ayah number
 * @param wordPos Canonical 1-based word position (from Quran.com tokenization)
 */
export async function lookupWordMorphology(
  surah: number,
  ayah: number,
  wordPos: number,
): Promise<QACEntry | null> {
  const morph = await loadMorphology(); // throws on fetch/parse failure
  return morph[`${surah}:${ayah}:${wordPos}`] ?? null;
}

/**
 * Look up all corpus occurrences of an Arabic root.
 *
 * Throws if the QAC root data file cannot be loaded.
 * Returns null if the root is not in the index (e.g. pure particles).
 *
 * @param root Arabic Unicode root string (e.g. "رحم")
 */
export async function lookupRootOccurrences(root: string): Promise<QACRootEntry | null> {
  if (!root) return null;
  const roots = await loadRoots(); // throws on fetch/parse failure
  return roots[root] ?? null;
}

// ─── Morphology formatting ─────────────────────────────────────────────────────

// Exported so WordStudySheet can use the full label set for the POS pill.
export const POS_LABELS: Record<string, string> = {
  // Content-word classes
  N:    "Noun",
  V:    "Verb",
  ADJ:  "Adjective",
  PN:   "Proper Noun",
  // Pronoun / demonstrative / relative
  PRON: "Pronoun",
  DEM:  "Demonstrative",
  REL:  "Relative Pronoun",
  // Particles — functional
  ACC:  "Accusative Particle",   // sisters of inna: إنَّ أنَّ لعلَّ كأنَّ لكنَّ
  P:    "Preposition",
  CONJ: "Conjunction",
  SUB:  "Subordinating Conjunction",
  NEG:  "Negative Particle",
  PRO:  "Prohibition Particle",
  PREV: "Preventive Particle",
  FUT:  "Future Particle",
  CERT: "Certainty Particle",
  COND: "Conditional Particle",
  EXP:  "Exceptive Particle",
  INC:  "Inceptive Particle",
  INT:  "Interpretation Particle",
  INTG: "Interrogative Particle",
  AMD:  "Amendment Particle",
  ANS:  "Answer Particle",
  AVR:  "Aversion Particle",
  EXH:  "Exhortation Particle",  // لولا (why not)
  EXL:  "Presentative Particle", // أما (as for, indeed)
  RES:  "Response Particle",
  RET:  "Retraction Particle",
  SUP:  "Supplemental Particle",
  SUR:  "Surprise Particle",
  // Adverbs / initials
  LOC:  "Locative Adverb",
  T:    "Time Adverb",
  INL:  "Quranic Initial",       // huroof al-muqatta'at — no root by design
  IMPN: "Imperative Nominal",
};

const GENDER_LABELS: Record<string, string>  = { M: "masculine", F: "feminine" };
const NUMBER_LABELS: Record<string, string>  = { S: "singular", D: "dual", P: "plural" };
const CASE_LABELS:   Record<string, string>  = { N: "nominative", A: "accusative", G: "genitive" };
const ASPECT_LABELS: Record<string, string>  = { PRF: "perfect", IMPF: "imperfect", IMP: "imperative" };
const VOICE_LABELS:  Record<string, string>  = { A: "active", P: "passive" };
const MOOD_LABELS:   Record<string, string>  = { J: "jussive", S: "subjunctive" };
const PERSON_LABELS: Record<string, string>  = {
  "1S":  "1st person singular",
  "1P":  "1st person plural",
  "2MS": "2nd person masculine singular",
  "2FS": "2nd person feminine singular",
  "2MD": "2nd person masculine dual",
  "2FD": "2nd person feminine dual",
  "2MP": "2nd person masculine plural",
  "2FP": "2nd person feminine plural",
  "2D":  "2nd person dual",
  "3MS": "3rd person masculine singular",
  "3FS": "3rd person feminine singular",
  "3MD": "3rd person masculine dual",
  "3FD": "3rd person feminine dual",
  "3MP": "3rd person masculine plural",
  "3FP": "3rd person feminine plural",
  "3D":  "3rd person dual",
};

/**
 * Convert a QACEntry into a human-readable morphological description.
 * Examples:
 *   "Noun, masculine singular genitive"
 *   "Verb, perfect active, 3rd person masculine singular"
 *   "Preposition"
 */
export function formatMorphology(entry: QACEntry): string {
  const parts: string[] = [];
  const posLabel = entry.p ? (POS_LABELS[entry.p] ?? entry.p) : null;
  if (posLabel) parts.push(posLabel);

  if (entry.p === "V") {
    if (entry.t)  parts.push(ASPECT_LABELS[entry.t]  ?? entry.t);
    if (entry.vn) parts.push(VOICE_LABELS[entry.vn]  ?? entry.vn);
    if (entry.ps) parts.push(PERSON_LABELS[entry.ps] ?? entry.ps);
    if (entry.md) parts.push(`${MOOD_LABELS[entry.md] ?? entry.md} mood`);
  } else {
    if (entry.g)  parts.push(GENDER_LABELS[entry.g]  ?? entry.g);
    if (entry.n)  parts.push(NUMBER_LABELS[entry.n]  ?? entry.n);
    if (entry.c)  parts.push(CASE_LABELS[entry.c]    ?? entry.c);
    if (entry.i)  parts.push("indefinite");
  }

  return parts.length ? parts.join(", ") : "Grammatical particle";
}

// ─── Verse word data (Quran.com) ───────────────────────────────────────────────

const verseWordsCache = new Map<string, VerseWord[]>();

export async function fetchVerseWords(
  surah: number,
  ayah: number,
): Promise<VerseWord[]> {
  const key = `${surah}:${ayah}`;
  if (verseWordsCache.has(key)) return verseWordsCache.get(key)!;

  const url = `${QURANCOM}/verses/by_key/${surah}:${ayah}?words=true&word_fields=text_uthmani,transliteration&translation_id=131`;
  const res = await fetchWithTimeout(url, { timeoutMs: 8000 });
  const data = await res.json() as { verse: { words: Array<{
    id: number; position: number; audio: { url: string } | null;
    text_uthmani: string; char_type_name: string;
    translation: { text: string }; transliteration: { text: string } | null;
  }> } };
  const verse = data.verse;

  const words: VerseWord[] = verse.words.map((w) => ({
    id: w.id,
    position: w.position,
    audioUrl: w.audio?.url ?? "",
    textUthmani: w.text_uthmani ?? "",
    charType: w.char_type_name ?? "word",
    translation: w.translation?.text ?? "",
    transliteration: w.transliteration?.text ?? "",
  }));

  verseWordsCache.set(key, words);
  return words;
}

// ─── Tafseer (Ibn Kathir via quran.com) ───────────────────────────────────────

const tafseerCache = new Map<string, TafseerResult>();

export async function fetchTafseer(
  surah: number,
  ayah: number,
): Promise<TafseerResult> {
  const key = `${surah}:${ayah}`;
  if (tafseerCache.has(key)) return tafseerCache.get(key)!;

  const url = `${QURANCOM}/tafsirs/169/by_ayah/${surah}:${ayah}?language=en`;
  const res = await fetchWithTimeout(url, { timeoutMs: 10000 });
  const data = await res.json() as {
    tafsir?: { text?: string; body?: string }
  };
  const raw = data.tafsir?.text ?? data.tafsir?.body ?? "";
  const result: TafseerResult = {
    text: raw,
    isHtml: /<[a-z][\s\S]*>/i.test(raw),
  };
  tafseerCache.set(key, result);
  return result;
}
