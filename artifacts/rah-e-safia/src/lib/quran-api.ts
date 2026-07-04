import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

const BASE_URL = "https://api.alquran.cloud/v1";

export interface AyahWithTranslations {
  number: number;
  numberInSurah: number;
  arabic: string;
  english: string;
  urdu: string;
  transliteration?: string;
  juz: number;
  page: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

export interface SurahData {
  number: number;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: AyahWithTranslations[];
}

export interface FetchSurahOptions {
  edition?: string;
  transliteration?: boolean;
}

const cache = new Map<string, SurahData>();
const inflight = new Map<string, Promise<SurahData>>();

function cacheKey(number: number, edition: string, transliteration: boolean): string {
  return `${number}:${edition}:${transliteration ? "t" : "f"}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEditions(data: any[], transliteration: boolean): SurahData {
  const [arabic, english, urdu, translit] = data;

  // Arabic is the structural foundation — ayah numbers, juz, page, and sajda
  // all come from it. Both a missing edition and an empty ayahs array make the
  // surah unrenderable, so surface a clear error in both cases rather than
  // crashing later with a TypeError.
  if (!arabic?.ayahs?.length) {
    throw new Error("Arabic Quran text unavailable or empty in API response — cannot render surah.");
  }

  const ayahs: AyahWithTranslations[] = arabic.ayahs.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ayah: any, i: number) => ({
      number: ayah.number,
      numberInSurah: ayah.numberInSurah,
      arabic: ayah.text as string,
      // English, Urdu, and transliteration editions are optional — guard the
      // edition object itself in addition to the individual ayah so a missing
      // or malformed edition falls back gracefully rather than throwing.
      english: (english?.ayahs?.[i]?.text as string) ?? "",
      urdu: (urdu?.ayahs?.[i]?.text as string) ?? "",
      transliteration: transliteration ? ((translit?.ayahs?.[i]?.text as string) ?? undefined) : undefined,
      juz: ayah.juz as number,
      page: ayah.page as number,
      sajda: ayah.sajda,
    })
  );

  return {
    number: arabic.number,
    englishName: arabic.englishName,
    englishNameTranslation: arabic.englishNameTranslation,
    numberOfAyahs: arabic.numberOfAyahs,
    revelationType: arabic.revelationType,
    ayahs,
  };
}

export async function fetchSurah(
  number: number,
  options: FetchSurahOptions = {}
): Promise<SurahData> {
  const edition = options.edition ?? "en.sahih";
  const withTranslit = options.transliteration ?? false;
  const key = cacheKey(number, edition, withTranslit);

  if (cache.has(key)) return cache.get(key)!;

  if (inflight.has(key)) return inflight.get(key)!;

  const editions = withTranslit
    ? `quran-uthmani,${edition},ur.jalandhry,en.transliteration`
    : `quran-uthmani,${edition},ur.jalandhry`;

  const promise = fetchWithTimeout(`${BASE_URL}/surah/${number}/editions/${editions}`)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`Network error ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      if (json.code !== 200) {
        throw new Error(json.status ?? `Unexpected API response for surah ${number}`);
      }
      const surah = parseEditions(json.data as unknown[], withTranslit);
      cache.set(key, surah);
      return surah;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

export function isSajda(ayah: AyahWithTranslations): boolean {
  return typeof ayah.sajda === "object" && ayah.sajda !== null;
}

export function prefetchSurah(
  number: number,
  options: FetchSurahOptions = {}
): void {
  const edition = options.edition ?? "en.sahih";
  const withTranslit = options.transliteration ?? false;
  const key = cacheKey(number, edition, withTranslit);
  if (!cache.has(key) && !inflight.has(key)) {
    fetchSurah(number, options).catch(() => {});
  }
}
