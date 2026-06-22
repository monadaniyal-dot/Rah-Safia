import { useState, useEffect, useCallback } from "react";

export interface Bookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  surahArabicName: string;
  ayahNumber: number;
  arabicText: string;
  timestamp: number;
}

const STORAGE_KEY = "rah-e-safia:bookmarks";

function loadBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Bookmark[];
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks: Bookmark[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // Storage unavailable or full — fail silently
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks);

  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  const toggleBookmark = useCallback(
    (item: Omit<Bookmark, "id" | "timestamp">) => {
      const id = `${item.surahNumber}:${item.ayahNumber}`;
      setBookmarks((prev) => {
        if (prev.some((b) => b.id === id)) return prev.filter((b) => b.id !== id);
        return [{ ...item, id, timestamp: Date.now() }, ...prev];
      });
    },
    []
  );

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const isBookmarked = useCallback(
    (surahNumber: number, ayahNumber: number): boolean =>
      bookmarks.some((b) => b.id === `${surahNumber}:${ayahNumber}`),
    [bookmarks]
  );

  return { bookmarks, toggleBookmark, removeBookmark, isBookmarked };
}
