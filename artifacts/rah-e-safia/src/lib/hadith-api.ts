// ─── Hadith API ─────────────────────────────────────────────────────────────
// Source: fawazahmed0/hadith-api (GitHub → jsDelivr CDN)
// No authentication required. Pinned to the @1 release tag.

import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

export type CollectionId =
  | "bukhari"
  | "muslim"
  | "tirmidhi"
  | "abudawud"
  | "nasai"
  | "ibnmajah";

export interface HadithGrade {
  name: string;
  grade: string;
}

export interface HadithEntry {
  hadithnumber: number;
  arabicnumber?: number;
  text: string;
  arabicText: string;
  narrator: string;
  grades: HadithGrade[];
  reference: { book?: number; hadith?: number };
}

export interface CollectionMeta {
  id: CollectionId;
  label: string;
  shortLabel: string;
  arabic: string;
  editionEng: string;
  editionAra: string;
  description: string;
  compiler: string;
  died: string;
}

export const COLLECTIONS: CollectionMeta[] = [
  {
    id: "bukhari",
    label: "Sahih Bukhari",
    shortLabel: "Bukhari",
    arabic: "صحيح البخاري",
    editionEng: "eng-bukhari",
    editionAra: "ara-bukhari",
    compiler: "Imam al-Bukhari",
    died: "d. 870 CE",
    description:
      "The most rigorously authenticated hadith collection. Imam Bukhari spent 16 years selecting these 7,589 hadiths from 600,000.",
  },
  {
    id: "muslim",
    label: "Sahih Muslim",
    shortLabel: "Muslim",
    arabic: "صحيح مسلم",
    editionEng: "eng-muslim",
    editionAra: "ara-muslim",
    compiler: "Imam Muslim",
    died: "d. 875 CE",
    description:
      "The second most authentic collection, distinguished by its arrangement and consistent chains of narration.",
  },
  {
    id: "tirmidhi",
    label: "Jami at-Tirmidhi",
    shortLabel: "Tirmidhi",
    arabic: "جامع الترمذي",
    editionEng: "eng-tirmidhi",
    editionAra: "ara-tirmidhi",
    compiler: "Imam at-Tirmidhi",
    died: "d. 892 CE",
    description:
      "Notable for its grading of each hadith by authenticity, and for including scholarly opinions on legal rulings.",
  },
  {
    id: "abudawud",
    label: "Sunan Abu Dawud",
    shortLabel: "Abu Dawud",
    arabic: "سنن أبي داود",
    editionEng: "eng-abudawud",
    editionAra: "ara-abudawud",
    compiler: "Imam Abu Dawud",
    died: "d. 889 CE",
    description:
      "Selected 4,800 hadiths from 500,000, focusing on legal matters and jurisprudential guidance.",
  },
  {
    id: "nasai",
    label: "Sunan an-Nasa'i",
    shortLabel: "Nasa'i",
    arabic: "سنن النسائي",
    editionEng: "eng-nasai",
    editionAra: "ara-nasai",
    compiler: "Imam an-Nasa'i",
    died: "d. 915 CE",
    description:
      "Known for its exceptionally strict standards in evaluating narrators, resulting in fewer weak hadiths.",
  },
  {
    id: "ibnmajah",
    label: "Sunan Ibn Majah",
    shortLabel: "Ibn Majah",
    arabic: "سنن ابن ماجه",
    editionEng: "eng-ibnmajah",
    editionAra: "ara-ibnmajah",
    compiler: "Imam Ibn Majah",
    died: "d. 887 CE",
    description:
      "The sixth of the six major hadith collections. Contains many unique hadiths not found in the other five books.",
  },
];

// ─── Smart categories (keyword-based preset filters) ──────────────────────
export interface SmartCategory {
  label: string;
  keywords: string[];
}

export const SMART_CATEGORIES: SmartCategory[] = [
  { label: "Faith",      keywords: ["faith","belief","iman","believer","hypocrite","paradise","hereafter","allah","messenger"] },
  { label: "Prayer",     keywords: ["prayer","salah","salat","ablution","wudu","prostration","mosque","adhan"] },
  { label: "Fasting",    keywords: ["fast","fasting","ramadan","iftar","suhoor","sawm"] },
  { label: "Charity",    keywords: ["charity","sadaqah","zakah","zakat","spend","give","poor","needy"] },
  { label: "Pilgrimage", keywords: ["hajj","pilgrimage","mecca","ihram","tawaf","ka'bah","kaaba","umrah"] },
  { label: "Manners",    keywords: ["manner","kind","anger","patient","honest","truth","neighbour","neighbor","mercy"] },
  { label: "Knowledge",  keywords: ["knowledge","learn","teach","scholar","wisdom","seek","education"] },
  { label: "Dhikr",      keywords: ["remembrance","dhikr","praise","glorify","subhan","alhamdulillah","name of allah","supplication","dua"] },
];

// ─── Grade helpers ────────────────────────────────────────────────────────
export type GradeLevel = "sahih" | "hasan" | "daif" | "mawdu" | "unknown";

export function classifyGrade(grade: string): GradeLevel {
  const g = grade.toLowerCase();
  if (g.includes("sahih") || g.includes("صحيح")) return "sahih";
  if (g.includes("hasan") || g.includes("حسن")) return "hasan";
  if (g.includes("da") || g.includes("weak") || g.includes("ضعيف")) return "daif";
  if (g.includes("mawdu") || g.includes("fabricat") || g.includes("موضوع")) return "mawdu";
  return "unknown";
}

export function bestGrade(grades: HadithGrade[]): HadithGrade | null {
  if (!grades.length) return null;
  const priority: GradeLevel[] = ["sahih", "hasan", "daif", "mawdu", "unknown"];
  let best: HadithGrade | null = null;
  let bestPriority = 99;
  for (const g of grades) {
    const level = classifyGrade(g.grade);
    const idx = priority.indexOf(level);
    if (idx < bestPriority) { best = g; bestPriority = idx; }
  }
  return best ?? grades[0];
}

// ─── Narrator parsing ─────────────────────────────────────────────────────
// Handles Bukhari-style ("Narrated X:"), Muslim-style ("X reported:", "It is
// reported on the authority of X that ..."), and shared patterns.
function parseNarrator(text: string): { narrator: string; body: string } {
  let m: RegExpMatchArray | null;

  // 1. "Narrated X: ..." — standard Bukhari format
  m = text.match(/^Narrated\s+(.+?):\s*([\s\S]+)/);
  if (m) return { narrator: m[1].trim(), body: m[2].trim() };

  // 2. "X narrated that ..." — shared format
  m = text.match(/^([A-Z][^,:]{2,60}?)\s+narrated\s+that\s+([\s\S]+)/);
  if (m) return { narrator: m[1].trim(), body: m[2].trim() };

  // 3. "X reported: ..." — Muslim format ("Abu Huraira reported:...")
  m = text.match(/^([A-Z][^,:]{2,60}?)\s+reported:([\s\S]+)/);
  if (m) return { narrator: m[1].trim(), body: m[2].trim() };

  // 4. "It is reported/narrated on the authority of X that ..."
  m = text.match(
    /^It is (?:reported|narrated) on the authority of\s+(.+?)\s+that\s+(?:(?:he|she|they) said[:\s]+)?([\s\S]+)/i
  );
  if (m) return { narrator: m[1].trim(), body: m[2].trim() };

  // 5. "It is reported by X that ..."
  m = text.match(/^It is (?:reported|narrated) by\s+(.+?)\s+that\s+([\s\S]+)/i);
  if (m) return { narrator: m[1].trim(), body: m[2].trim() };

  return { narrator: "", body: text };
}

// ─── In-memory cache + in-flight deduplication ───────────────────────────
// The inflight map prevents duplicate parallel network requests for the same
// collection (e.g. StrictMode double-invoke or rapid tab switching).
const cache = new Map<CollectionId, HadithEntry[]>();
const inflight = new Map<CollectionId, Promise<HadithEntry[]>>();

/** Clears the in-memory hadith cache so the next fetch re-downloads from CDN. */
export function clearHadithCache(): void {
  cache.clear();
  inflight.clear();
}

const CDN = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

export async function fetchCollection(id: CollectionId): Promise<HadithEntry[]> {
  const cached = cache.get(id);
  if (cached !== undefined) return cached;

  const pending = inflight.get(id);
  if (pending !== undefined) return pending;

  const meta = COLLECTIONS.find((c) => c.id === id);
  if (!meta) {
    throw new Error(`Unknown hadith collection: "${id}"`);
  }

  const promise = (async () => {
    const [engRes, araRes] = await Promise.all([
      fetchWithTimeout(`${CDN}/${meta.editionEng}.min.json`),
      fetchWithTimeout(`${CDN}/${meta.editionAra}.min.json`),
    ]);

    if (!engRes.ok) {
      throw new Error(`Could not load ${meta.label} (HTTP ${engRes.status})`);
    }

    const [engData, araData] = await Promise.all([
      engRes.json() as Promise<{ hadiths: Record<string, unknown>[] }>,
      araRes.ok
        ? (araRes.json() as Promise<{ hadiths: Record<string, unknown>[] }>)
        : Promise.resolve({ hadiths: [] }),
    ]);

    // Accept only entries whose text actually contains Arabic script (U+0600–U+06FF).
    // This guards against the CDN occasionally serving the English file under the
    // Arabic URL — if that happens, araMap stays empty and arabicText falls back to
    // "" (Arabic block hidden) rather than showing the English translation twice.
    const ARABIC_RE = /[\u0600-\u06FF]/;
    const araMap = new Map<number, string>();
    for (const h of araData.hadiths ?? []) {
      const txt = h.text as string | undefined;
      if (txt && typeof h.hadithnumber === "number" && ARABIC_RE.test(txt)) {
        araMap.set(h.hadithnumber as number, txt);
      }
    }

    const entries: HadithEntry[] = (engData.hadiths ?? [])
      .filter((h) => {
        const t = (h.text as string) ?? "";
        return t.trim().length > 0;
      })
      .map((h) => {
        const rawText = (h.text as string) ?? "";
        const { narrator, body } = parseNarrator(rawText);
        return {
          hadithnumber: h.hadithnumber as number,
          arabicnumber: h.arabicnumber as number | undefined,
          text: body || rawText,
          arabicText: araMap.get(h.hadithnumber as number) ?? "",
          narrator,
          grades: (h.grades as HadithGrade[]) ?? [],
          reference: (h.reference as { book?: number; hadith?: number }) ?? {},
        };
      });

    cache.set(id, entries);
    return entries;
  })().finally(() => {
    inflight.delete(id);
  });

  inflight.set(id, promise);
  return promise;
}
