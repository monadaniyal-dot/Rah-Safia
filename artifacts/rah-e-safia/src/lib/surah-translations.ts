export type TranslationMode =
  | "arabic"
  | "arabic+urdu"
  | "arabic+english"
  | "arabic+urdu+english";

export const TRANSLATION_MODES: {
  id: TranslationMode;
  label: string;
}[] = [
  { id: "arabic",              label: "Arabic Only"             },
  { id: "arabic+english",      label: "Arabic + English"        },
  { id: "arabic+urdu",         label: "Arabic + Urdu"           },
  { id: "arabic+urdu+english", label: "Arabic + English + Urdu" },
];

export function showUrdu(mode: TranslationMode): boolean {
  return mode === "arabic+urdu" || mode === "arabic+urdu+english";
}

export function showEnglish(mode: TranslationMode): boolean {
  return mode === "arabic+english" || mode === "arabic+urdu+english";
}
