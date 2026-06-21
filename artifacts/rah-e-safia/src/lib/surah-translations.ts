export type TranslationMode =
  | "arabic"
  | "arabic+urdu"
  | "arabic+english"
  | "arabic+urdu+english";

export const TRANSLATION_MODES: {
  id: TranslationMode;
  label: string;
  shortLabel: string;
}[] = [
  { id: "arabic",              label: "Arabic Only",         shortLabel: "AR"       },
  { id: "arabic+urdu",         label: "Arabic + Urdu",       shortLabel: "AR+UR"    },
  { id: "arabic+english",      label: "Arabic + English",    shortLabel: "AR+EN"    },
  { id: "arabic+urdu+english", label: "Arabic + Urdu + English", shortLabel: "All"  },
];

export interface AyahTranslation {
  number: number;
  urdu: string;
  english: string;
}

/* ── Al-Fatihah (1) — real, authentic translations ── */
const FATIHAH_TRANSLATIONS: AyahTranslation[] = [
  {
    number: 1,
    urdu:    "اللہ کے نام سے (شروع کرتا ہوں) جو بڑا مہربان، نہایت رحم والا ہے",
    english: "In the name of Allah, the Most Gracious, the Most Merciful.",
  },
  {
    number: 2,
    urdu:    "سب تعریفیں اللہ ہی کے لیے ہیں جو تمام جہانوں کا پروردگار ہے",
    english: "All praise is for Allah, Lord of all worlds.",
  },
  {
    number: 3,
    urdu:    "بڑا مہربان، نہایت رحم والا",
    english: "The Most Gracious, the Most Merciful.",
  },
  {
    number: 4,
    urdu:    "جزا کے دن کا مالک",
    english: "Master of the Day of Judgment.",
  },
  {
    number: 5,
    urdu:    "ہم تیری ہی عبادت کرتے ہیں اور تجھی سے مدد مانگتے ہیں",
    english: "You alone we worship, and You alone we ask for help.",
  },
  {
    number: 6,
    urdu:    "ہمیں سیدھا راستہ دکھا",
    english: "Guide us to the straight path.",
  },
  {
    number: 7,
    urdu:    "ان لوگوں کا راستہ جن پر تو نے انعام فرمایا، نہ ان کا جن پر غضب ہوا اور نہ گمراہوں کا",
    english:
      "The path of those upon whom You have bestowed favor — not of those who have evoked Your anger, nor of those who are astray.",
  },
];

/* ── Placeholder translations for all other surahs ── */
function makePlaceholder(verseCount: number): AyahTranslation[] {
  return Array.from({ length: Math.min(verseCount, 5) }, (_, i) => ({
    number: i + 1,
    urdu:    `یہ آیت نمبر ${i + 1} کا عارضی ترجمہ ہے۔ مکمل قرآنی ترجمہ جلد دستیاب ہوگا جب API سے کنکشن قائم ہو جائے۔`,
    english: `This is a placeholder English translation for verse ${
      i + 1
    }. The complete Qur'an translation will be available once the Quran API is connected.`,
  }));
}

export function getTranslations(surahNumber: number, verseCount: number): AyahTranslation[] {
  if (surahNumber === 1) return FATIHAH_TRANSLATIONS;
  return makePlaceholder(verseCount);
}

export function showUrdu(mode: TranslationMode): boolean {
  return mode === "arabic+urdu" || mode === "arabic+urdu+english";
}

export function showEnglish(mode: TranslationMode): boolean {
  return mode === "arabic+english" || mode === "arabic+urdu+english";
}
