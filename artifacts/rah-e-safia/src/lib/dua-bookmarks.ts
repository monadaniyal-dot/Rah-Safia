// Daily Dua bookmarks — used by DailyInspiration component and BookmarksPage.
// Separate from Supplications bookmarks (see supplications-bookmarks.ts).

import { useState, useEffect, useCallback } from "react";

export interface DuaBookmark {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  source: string;
  timestamp: number;
}

const STORAGE_KEY = "rah-e-safia:dua-bookmarks";

function loadBookmarks(): DuaBookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DuaBookmark[];
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks: DuaBookmark[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // Storage unavailable — fail silently
  }
}

export function useDuaBookmarks() {
  const [duaBookmarks, setDuaBookmarks] = useState<DuaBookmark[]>(loadBookmarks);

  useEffect(() => {
    saveBookmarks(duaBookmarks);
  }, [duaBookmarks]);

  const toggleDuaBookmark = useCallback(
    (item: Omit<DuaBookmark, "timestamp">) => {
      setDuaBookmarks((prev) => {
        if (prev.some((b) => b.id === item.id)) {
          return prev.filter((b) => b.id !== item.id);
        }
        return [{ ...item, timestamp: Date.now() }, ...prev];
      });
    },
    []
  );

  const removeDuaBookmark = useCallback((id: string) => {
    setDuaBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const isDuaBookmarked = useCallback(
    (id: string): boolean => duaBookmarks.some((b) => b.id === id),
    [duaBookmarks]
  );

  return { duaBookmarks, toggleDuaBookmark, removeDuaBookmark, isDuaBookmarked };
}
