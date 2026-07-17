// Supplications (Dua Library) bookmarks — used by SupplicationsPage.
// Separate from Daily Dua bookmarks (see dua-bookmarks.ts).

import { useState, useEffect, useCallback } from "react";

export interface SupplicationBookmark {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  subcategoryId: string;
  categoryId: string;
  timestamp: number;
}

const STORAGE_KEY = "rah-e-safia:supplications-bookmarks";

function loadBookmarks(): SupplicationBookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SupplicationBookmark[];
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks: SupplicationBookmark[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // Storage unavailable — fail silently
  }
}

export function useSupplicationBookmarks() {
  const [bookmarks, setBookmarks] = useState<SupplicationBookmark[]>(loadBookmarks);

  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  const toggleBookmark = useCallback(
    (item: Omit<SupplicationBookmark, "timestamp">) => {
      setBookmarks((prev) => {
        if (prev.some((b) => b.id === item.id)) {
          return prev.filter((b) => b.id !== item.id);
        }
        return [{ ...item, timestamp: Date.now() }, ...prev];
      });
    },
    []
  );

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const isBookmarked = useCallback(
    (id: string): boolean => bookmarks.some((b) => b.id === id),
    [bookmarks]
  );

  return { bookmarks, toggleBookmark, removeBookmark, isBookmarked };
}
