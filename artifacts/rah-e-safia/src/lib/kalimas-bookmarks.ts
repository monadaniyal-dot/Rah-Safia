// Kalimas & Shahadah bookmarks — localStorage persistence.
// Storage key: rah-e-safia:kalimas-bookmarks

import { useState, useEffect, useCallback } from "react";

export interface KalimaBookmark {
  id: string;           // Kalima id, e.g. "kalima-1"
  number: number;
  name: string;
  nameUrdu: string;
  subtitle: string;
  arabic: string;
  transliteration: string;
  english: string;
  color: string;
  timestamp: number;
}

const STORAGE_KEY = "rah-e-safia:kalimas-bookmarks";

function load(): KalimaBookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as KalimaBookmark[]) : [];
  } catch {
    return [];
  }
}

function save(items: KalimaBookmark[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable — fail silently
  }
}

// Memorisation progress: { [id]: count } — how many times the user completed practice
const PROGRESS_KEY = "rah-e-safia:kalimas-progress";

export function loadProgress(): Record<string, number> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: Record<string, number>): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // fail silently
  }
}

export function useKalimaBookmarks() {
  const [bookmarks, setBookmarks] = useState<KalimaBookmark[]>(load);

  useEffect(() => {
    save(bookmarks);
  }, [bookmarks]);

  const toggleBookmark = useCallback((item: Omit<KalimaBookmark, "timestamp">) => {
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
