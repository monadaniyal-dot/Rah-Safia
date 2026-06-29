import { useState, useEffect } from "react";

export type SupportedLang = "en" | "ar" | "ur" | "fr" | "id";

const SETTINGS_KEY = "rah-e-safia:settings";

export const RTL_LANGS = new Set<SupportedLang>(["ar", "ur"]);

export function isRTLLang(lang: SupportedLang): boolean {
  return RTL_LANGS.has(lang);
}

function readLang(): SupportedLang {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return "en";
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return (parsed.appLanguage as SupportedLang) ?? "en";
  } catch {
    return "en";
  }
}

/**
 * Reactive hook: returns the current app language.
 * Updates instantly when settings are changed via the useSettings hook,
 * even in always-mounted components like Sidebar / BottomNav.
 */
export function useAppLanguage(): SupportedLang {
  const [lang, setLang] = useState<SupportedLang>(readLang);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (detail?.appLanguage) setLang(detail.appLanguage as SupportedLang);
    };
    window.addEventListener("rah-e-safia:settings-changed", handler);
    return () => window.removeEventListener("rah-e-safia:settings-changed", handler);
  }, []);

  return lang;
}
