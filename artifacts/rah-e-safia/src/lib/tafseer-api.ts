// ─── Tafseer Registry & Fetching Architecture ─────────────────────────────────
//
// Design principles:
//  1. Each TafseerSource declares its data provider up front.
//  2. "qurancom" sources fetch from api.quran.com/api/v4 using a numeric tafsir ID.
//  3. Coming-soon sources return a structured "unavailable" result with guidance.
//  4. Results are cached per (surahNum:ayahNum:sourceId) to avoid re-fetching.
//  5. Adding a new source = one entry in TAFSEER_SOURCES. Nothing else changes.
//  6. Text from quran.com is HTML (<p>, <h2>). The UI layer handles rendering.

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
  /** quran.com v4 tafsir ID, or null if not available via any free API */
  qurancomId: number | null;
  status: TafseerStatus;
  /** Explains what dataset / work is needed to make this source live */
  dataNote: string;
}

// ─── Source registry ──────────────────────────────────────────────────────────
// To add a new source: add one entry here. No other code changes needed.

export const TAFSEER_SOURCES: TafseerSource[] = [
  {
    id: "maarif",
    name: "Maarif-ul-Quran",
    urduName: "معارف القرآن",
    author: "Mufti Muhammad Shafi",
    authorUrdu: "مفتی محمد شفیع",
    lang: "english",
    description:
      "The authoritative 8-volume Tafseer by Mufti Muhammad Shafi — available in English via Quran.com.",
    qurancomId: 168,
    status: "available",
    dataNote: "",
  },
  {
    id: "ibnkathir",
    name: "Tafsir Ibn Kathir",
    urduName: "تفسیر ابن کثیر",
    author: "Hafiz Ibn Kathir",
    authorUrdu: "حافظ ابن کثیر",
    lang: "english",
    description:
      "The world's most widely read classical Sunni Tafseer — comprehensive abridged English edition, covering every ayah with hadith, context, and scholarly commentary.",
    qurancomId: 169,
    status: "available",
    dataNote: "",
  },
  {
    id: "tazkirul",
    name: "Tazkirul Quran",
    urduName: "تذکیر القرآن",
    author: "Maulana Wahiduddin Khan",
    authorUrdu: "مولانا وحید الدین خان",
    lang: "english",
    description:
      "A contemporary English Tafseer offering reflective, thematic commentary — each verse is explained in light of its spiritual, rational, and universal significance.",
    qurancomId: 817,
    status: "available",
    dataNote: "",
  },
  {
    id: "saddi",
    name: "Tafsir Al-Sa'di",
    urduName: "تفسیر السعدی",
    author: "Sheikh Abd ar-Rahman al-Sa'di",
    authorUrdu: "عبد الرحمن السعدی",
    lang: "english",
    description:
      "A celebrated modern Tafseer by Sheikh al-Sa'di — clear, accessible, verse-by-verse commentary covering linguistic, theological, and spiritual dimensions of every ayah.",
    qurancomId: null,
    status: "coming-soon",
    dataNote:
      "The English translation of Tafsir Al-Sa'di ('Taysir al-Karim al-Rahman', translated by Abu Khaliyl, published by Darussalam) exists in print but is not available via any free public API. The Arabic original is on Quran.com (ID 91) but does not qualify as an English source. Integration requires a licensed English dataset or a digitized plaintext of the Darussalam edition with API access.",
  },
  {
    id: "tafhim",
    name: "Tafhim-ul-Quran",
    urduName: "تفہیم القرآن",
    author: "Syed Abul Ala Maududi",
    authorUrdu: "سید ابوالاعلیٰ مودودی",
    lang: "urdu",
    description: "Maududi's landmark 6-volume modern Tafseer in Urdu.",
    qurancomId: null,
    status: "coming-soon",
    dataNote:
      "The AlQuran.cloud 'en.maududi' edition is only a short English translation, not Maududi's tafseer commentary. The actual Tafhim-ul-Quran requires a dedicated digitized Urdu/English dataset — no free API currently provides it.",
  },
  {
    id: "usmani",
    name: "Tafsir Usmani",
    urduName: "تفسیر عثمانی",
    author: "Shabbir Ahmad Usmani",
    authorUrdu: "شبیر احمد عثمانی",
    lang: "urdu",
    description: "Concise yet profound Urdu Tafseer widely used in South Asian madrasas.",
    qurancomId: null,
    status: "coming-soon",
    dataNote:
      "Available in print only. Requires a digitized Urdu plaintext dataset and a serving endpoint. No free API currently available.",
  },
  {
    id: "mazhari",
    name: "Tafsir Mazhari",
    urduName: "تفسیر مظہری",
    author: "Qadi Sanaullah Panipati",
    authorUrdu: "قاضی ثناء اللہ پانی پتی",
    lang: "urdu",
    description: "Classical 13-volume Tafseer with renowned Urdu translations available.",
    qurancomId: null,
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
    description: "Modern 5-volume Urdu Tafseer renowned for its eloquent style.",
    qurancomId: null,
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
    qurancomId: null,
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
  | { kind: "text"; text: string; isHtml: boolean; source: TafseerSource }
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
    return {
      kind: "error",
      message: `Unknown tafseer source "${sourceId}"`,
      source: TAFSEER_SOURCES[0],
    };
  }

  // Source not yet wired to any API
  if (!source.qurancomId) {
    return { kind: "unavailable", source };
  }

  const cacheKey = `${surahNum}:${ayahNum}:${sourceId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/tafsirs/${source.qurancomId}/by_ayah/${surahNum}:${ayahNum}?language=en`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const text: string = json?.tafsir?.text;
    if (!text) throw new Error("No tafseer text returned from API");

    const result: TafseerResult = { kind: "text", text, isHtml: true, source };
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "error", message, source };
  }
}
