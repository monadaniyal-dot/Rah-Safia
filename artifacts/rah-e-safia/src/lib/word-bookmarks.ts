// Quranic Word Study bookmarks — localStorage persistence.
// Key: rah-e-safia:word-study-bookmarks

import { useState, useEffect, useCallback } from "react";

export interface WordBookmark {
  id: string;             // e.g. "2:255:1"  (surah:ayah:position)
  arabic: string;
  transliteration: string;
  englishMeaning: string;
  surahNum: number;
  surahName: string;
  ayahNum: number;
  wordPosition: number;
  timestamp: number;
}

const STORAGE_KEY = "rah-e-safia:word-study-bookmarks";

function load(): WordBookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WordBookmark[]) : [];
  } catch {
    return [];
  }
}

function save(items: WordBookmark[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // fail silently
  }
}

export function useWordBookmarks() {
  const [bookmarks, setBookmarks] = useState<WordBookmark[]>(load);

  useEffect(() => {
    save(bookmarks);
  }, [bookmarks]);

  const toggleBookmark = useCallback((item: Omit<WordBookmark, "timestamp">) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.id === item.id)) {
        return prev.filter((b) => b.id !== item.id);
      }
      return [{ ...item, timestamp: Date.now() }, ...prev];
    });
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const isBookmarked = useCallback(
    (id: string): boolean => bookmarks.some((b) => b.id === id),
    [bookmarks]
  );

  return { bookmarks, toggleBookmark, removeBookmark, isBookmarked };
}
