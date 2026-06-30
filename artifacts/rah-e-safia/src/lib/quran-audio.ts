export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  folder: string;
}

export const RECITERS: Reciter[] = [
  {
    id: "alafasy",
    name: "Mishary Rashid Alafasy",
    arabicName: "مشاري راشد العفاسي",
    folder: "Alafasy_128kbps",
  },
  {
    id: "abdul_basit",
    name: "Abdul Basit Abdus Samad",
    arabicName: "عبد الباسط عبد الصمد",
    folder: "Abdul_Basit_Murattal_192kbps",
  },
  {
    id: "maher",
    name: "Maher Al-Muaiqly",
    arabicName: "ماهر المعيقلي",
    folder: "MaherAlMuaiqly128",
  },
  {
    id: "saad",
    name: "Saad Al-Ghamdi",
    arabicName: "سعد الغامدي",
    folder: "Saad_Al-Ghamdee_128kbps",
  },
  {
    id: "sudais",
    name: "Abdul Rahman Al-Sudais",
    arabicName: "عبد الرحمن السديس",
    folder: "Abdurrahmaan_As-Sudais_192kbps",
  },
];

export const DEFAULT_RECITER = RECITERS[0];

/** Build a direct CDN URL for a single ayah audio file. */
export function buildAudioUrl(folder: string, surah: number, ayah: number): string {
  const s = String(surah).padStart(3, "0");
  const a = String(ayah).padStart(3, "0");
  return `https://everyayah.com/data/${folder}/${s}${a}.mp3`;
}

export function getReciterById(id: string): Reciter {
  return RECITERS.find((r) => r.id === id) ?? DEFAULT_RECITER;
}

export function formatPlayerTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const RECITER_KEY = "rah-e-safia:player:reciter";

export function loadSavedReciter(): Reciter {
  try {
    const id = localStorage.getItem(RECITER_KEY);
    if (id) return getReciterById(id);
  } catch {}
  return DEFAULT_RECITER;
}

export function saveReciter(reciter: Reciter): void {
  try {
    localStorage.setItem(RECITER_KEY, reciter.id);
  } catch {}
}
