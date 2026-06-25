// ─── Tafseer Registry & Fetching Architecture ─────────────────────────────────
//
// Design principles:
//  1. Each TafseerSource declares its API availability up front.
//  2. Available sources are fetched from AlQuran.cloud using their edition string.
//  3. Coming-soon sources return a structured "unavailable" result with guidance.
//  4. Results are cached per (surahNum:ayahNum:sourceId) to avoid re-fetching.
//  5. Adding a new source = one entry in TAFSEER_SOURCES. Nothing else changes.

export type TafseerStatus = "available" | "coming-soon";
export type TafseerLang = "urdu" | "english" | "arabic";

export interface TafseerSource {
  id: string;
  name: string;
  urduName: string;
  author: string;
  authorUrdu: string;
  lang: TafseerLang;
  description: string;
  /** AlQuran.cloud edition identifier, or null if no public API exists */
  apiEdition: string | null;
  status: TafseerStatus;
  /** Explains what dataset / work is needed to make this source live */
  dataNote: string;
}

// ─── Source registry ──────────────────────────────────────────────────────────

export const TAFSEER_SOURCES: TafseerSource[] = [
  {
    id: "maarif",
    name: "Maarif-ul-Quran",
    urduName: "معارف القرآن",
    author: "Mufti Muhammad Shafi",
    authorUrdu: "مفتی محمد شفیع",
    lang: "urdu",
    description: "The definitive 8-volume Urdu Tafseer — the standard scholarly reference across South Asia.",
    apiEdition: null,
    status: "coming-soon",
    dataNote:
      "No public API currently exposes Maarif-ul-Quran. Requires a digitized Urdu plaintext dataset of all 8 volumes, then a local JSON lookup or a custom backend endpoint.",
  },
  {
    id: "tafhim",
    name: "Tafhim-ul-Quran",
    urduName: "تفہیم القرآن",
    author: "Syed Abul Ala Maududi",
    authorUrdu: "سید ابوالاعلیٰ مودودی",
    lang: "english",
    description: "Maududi's landmark modern Tafseer — available in English via AlQuran.cloud.",
    apiEdition: "en.maududi",
    status: "available",
    dataNote: "",
  },
  {
    id: "usmani",
    name: "Tafsir Usmani",
    urduName: "تفسیر عثمانی",
    author: "Shabbir Ahmad Usmani",
    authorUrdu: "شبیر احمد عثمانی",
    lang: "urdu",
    description: "Concise yet profound Urdu Tafseer widely used in South Asian madrasas.",
    apiEdition: null,
    status: "coming-soon",
    dataNote:
      "Available only in print. Requires a digitized Urdu plaintext dataset of Tafsir Usmani and a serving endpoint.",
  },
  {
    id: "mazhari",
    name: "Tafsir Mazhari",
    urduName: "تفسیر مظہری",
    author: "Qadi Sanaullah Panipati",
    authorUrdu: "قاضی ثناء اللہ پانی پتی",
    lang: "urdu",
    description: "Classical 13-volume Tafseer written in Arabic, with renowned Urdu translations available.",
    apiEdition: null,
    status: "coming-soon",
    dataNote:
      "No API available. Requires digitized Arabic or Urdu text of Tafsir Mazhari (13 volumes) and a custom backend.",
  },
  {
    id: "ziaul",
    name: "Tafsir Zia-ul-Quran",
    urduName: "تفسیر ضیاء القرآن",
    author: "Pir Muhammad Karam Shah Al-Azhari",
    authorUrdu: "پیر محمد کرم شاہ الازہری",
    lang: "urdu",
    description: "A 5-volume modern Urdu Tafseer renowned for its eloquent style and breadth.",
    apiEdition: null,
    status: "coming-soon",
    dataNote:
      "No public API. Requires a digitized Urdu plaintext of Tafsir Zia-ul-Quran (5 volumes) and a backend lookup.",
  },
  {
    id: "khazain",
    name: "Khazain-ul-Irfan",
    urduName: "خزائن العرفان",
    author: "Imam Ahmad Raza Khan",
    authorUrdu: "امام احمد رضا خان",
    lang: "urdu",
    description: "Urdu Tafseer notes on Kanz-ul-Iman — widely respected in the Barelvi tradition.",
    apiEdition: null,
    status: "coming-soon",
    dataNote:
      "No standalone API. Requires digitized Urdu text of Khazain-ul-Irfan and a custom serving endpoint.",
  },
];

export const TAFSEER_SOURCE_MAP = Object.fromEntries(
  TAFSEER_SOURCES.map((s) => [s.id, s])
) as Record<string, TafseerSource>;

// ─── Result types ─────────────────────────────────────────────────────────────

export type TafseerResult =
  | { kind: "text"; text: string; source: TafseerSource }
  | { kind: "unavailable"; source: TafseerSource }
  | { kind: "error"; message: string; source: TafseerSource };

// ─── Cache ────────────────────────────────────────────────────────────────────

const cache = new Map<string, TafseerResult>();

// ─── Fetch ────────────────────────────────────────────────────────────────────

/**
 * Fetch Tafseer text for a single ayah from the configured source.
 *
 * @param surahNum  1–114
 * @param ayahNum   1-indexed ayah within the surah
 * @param sourceId  key from TAFSEER_SOURCES
 */
export async function fetchTafseer(
  surahNum: number,
  ayahNum: number,
  sourceId: string
): Promise<TafseerResult> {
  const source = TAFSEER_SOURCE_MAP[sourceId];
  if (!source) {
    return { kind: "error", message: `Unknown tafseer source "${sourceId}"`, source: TAFSEER_SOURCES[0] };
  }

  // Not yet wired to an API
  if (!source.apiEdition) {
    return { kind: "unavailable", source };
  }

  const cacheKey = `${surahNum}:${ayahNum}:${sourceId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/${source.apiEdition}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.code !== 200 || !json.data?.text) {
      throw new Error(json.status ?? "Unexpected API response");
    }
    const result: TafseerResult = { kind: "text", text: json.data.text as string, source };
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "error", message, source };
  }
}
