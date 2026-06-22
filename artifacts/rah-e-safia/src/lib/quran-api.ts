const BASE_URL = "https://api.alquran.cloud/v1";

/* Editions fetched in a single multi-edition request */
const EDITIONS = "quran-uthmani,en.sahih,ur.jalandhry";

export interface AyahWithTranslations {
  number: number;
  numberInSurah: number;
  arabic: string;
  english: string;
  urdu: string;
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

const cache = new Map<number, SurahData>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEditions(data: any[]): SurahData {
  const [arabic, english, urdu] = data;

  const ayahs: AyahWithTranslations[] = arabic.ayahs.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ayah: any, i: number) => ({
      number: ayah.number,
      numberInSurah: ayah.numberInSurah,
      arabic: ayah.text as string,
      english: (english.ayahs[i]?.text as string) ?? "",
      urdu: (urdu.ayahs[i]?.text as string) ?? "",
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

export async function fetchSurah(number: number): Promise<SurahData> {
  if (cache.has(number)) return cache.get(number)!;

  const res = await fetch(`${BASE_URL}/surah/${number}/editions/${EDITIONS}`);

  if (!res.ok) {
    throw new Error(`Network error ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();

  if (json.code !== 200) {
    throw new Error(json.status ?? `Unexpected API response for surah ${number}`);
  }

  const surah = parseEditions(json.data as unknown[]);
  cache.set(number, surah);
  return surah;
}

export function isSajda(ayah: AyahWithTranslations): boolean {
  return typeof ayah.sajda === "object" && ayah.sajda !== null;
}
