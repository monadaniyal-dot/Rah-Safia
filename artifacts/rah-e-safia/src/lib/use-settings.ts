import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "rah-e-safia:settings";

export interface AppSettings {
  arabicFontSize: number;
  translationFontSize: number;
  showTransliteration: boolean;
  rememberLastPosition: boolean;
  defaultTranslation: string;
  defaultTafseer: string;
  prayerNotifications: boolean;
  prayerReminderMinutes: 5 | 10 | 15;
  calculationMethod: string;
  madhab: string;
  autoLocation: boolean;
  appLanguage: string;
  translationLanguage: string;
  dailyReflectionNotification: boolean;
  dailyDuaNotification: boolean;
  dailyInspirationReminder: boolean;
  reminderTime: string;
  resumeLastRead: boolean;
  keepScreenAwake: boolean;
  smoothScrolling: boolean;
  highlightLastReadVerse: boolean;
  compactMode: boolean;
}

export const SETTINGS_DEFAULTS: AppSettings = {
  arabicFontSize: 20,
  translationFontSize: 14,
  showTransliteration: false,
  rememberLastPosition: true,
  defaultTranslation: "en.sahih",
  defaultTafseer: "maarif",
  prayerNotifications: false,
  prayerReminderMinutes: 10,
  calculationMethod: "MWL",
  madhab: "shafi",
  autoLocation: true,
  appLanguage: "en",
  translationLanguage: "en",
  dailyReflectionNotification: false,
  dailyDuaNotification: false,
  dailyInspirationReminder: false,
  reminderTime: "07:00",
  resumeLastRead: true,
  keepScreenAwake: false,
  smoothScrolling: true,
  highlightLastReadVerse: false,
  compactMode: false,
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SETTINGS_DEFAULTS;
    return { ...SETTINGS_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return SETTINGS_DEFAULTS;
  }
}

function saveSettings(s: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const update = useCallback(<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    saveSettings(SETTINGS_DEFAULTS);
    setSettings(SETTINGS_DEFAULTS);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--arabic-reading-size",
      `${settings.arabicFontSize}px`
    );
    document.documentElement.style.setProperty(
      "--translation-reading-size",
      `${settings.translationFontSize}px`
    );
  }, [settings.arabicFontSize, settings.translationFontSize]);

  return { settings, update, reset };
}

export type SettingKey = keyof AppSettings;
