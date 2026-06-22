const BASE_URL = "https://api.alquran.cloud/v1";

export interface ApiAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

export interface ApiSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: ApiAyah[];
}

const cache = new Map<number, ApiSurah>();

export async function fetchSurah(number: number): Promise<ApiSurah> {
  if (cache.has(number)) {
    return cache.get(number)!;
  }

  const res = await fetch(`${BASE_URL}/surah/${number}/quran-uthmani`);

  if (!res.ok) {
    throw new Error(`Network error ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();

  if (json.code !== 200) {
    throw new Error(json.status ?? `Unexpected API response for surah ${number}`);
  }

  const surah = json.data as ApiSurah;
  cache.set(number, surah);
  return surah;
}

export function isSajda(ayah: ApiAyah): boolean {
  return typeof ayah.sajda === "object" && ayah.sajda !== null;
}
