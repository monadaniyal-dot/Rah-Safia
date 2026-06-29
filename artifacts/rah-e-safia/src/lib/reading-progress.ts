import { useState, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProgressEntry {
  surahNum: number;
  surahName: string;
  surahArabicName: string;
  ayahNum: number;
  timestamp: number;
  path: string;
  sourceName?: string;
  translationMode?: string;
  tafseerSource?: string;
}

export interface ReadingProgress {
  quran?: ProgressEntry;
  tafseer?: ProgressEntry;
}

// ─── Storage ─────────────────────────────────────────────────────────────────

const LS_KEY = "rah_e_safia:reading_progress";

function readRaw(): ReadingProgress {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as ReadingProgress) : {};
  } catch {
    return {};
  }
}

function writeRaw(data: ReadingProgress): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    // Notify same-tab listeners (different from cross-tab "storage" events)
    window.dispatchEvent(new CustomEvent("reading-progress-updated"));
  } catch {
    // localStorage unavailable or quota exceeded — fail silently
  }
}

// ─── Save helpers ─────────────────────────────────────────────────────────────

export function saveQuranProgress(
  surahNum: number,
  surahName: string,
  surahArabicName: string,
  ayahNum: number,
  extras?: { translationMode?: string; tafseerSource?: string }
): void {
  writeRaw({
    ...readRaw(),
    quran: {
      surahNum,
      surahName,
      surahArabicName,
      ayahNum,
      timestamp: Date.now(),
      path: `/quran/${surahNum}`,
      ...extras,
    },
  });
}

/** Read the saved Quran position without subscribing to updates. */
export function getQuranProgress(): ProgressEntry | undefined {
  return readRaw().quran;
}

export function saveTafseerProgress(
  surahNum: number,
  surahName: string,
  surahArabicName: string,
  ayahNum: number,
  sourceId: string,
  sourceName: string
): void {
  writeRaw({
    ...readRaw(),
    tafseer: {
      surahNum,
      surahName,
      surahArabicName,
      ayahNum,
      timestamp: Date.now(),
      path: `/tafseer/surah/${surahNum}?source=${sourceId}`,
      sourceName,
    },
  });
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useReadingProgress(): ReadingProgress {
  const [progress, setProgress] = useState<ReadingProgress>(readRaw);

  useEffect(() => {
    const refresh = () => setProgress(readRaw());
    // Same-tab updates
    window.addEventListener("reading-progress-updated", refresh);
    // Cross-tab updates
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("reading-progress-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return progress;
}

// ─── Relative time ───────────────────────────────────────────────────────────

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day !== 1 ? "s" : ""} ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
