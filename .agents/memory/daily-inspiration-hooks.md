---
name: DailyInspiration hooks fix
description: Rules of Hooks violation in DailyInspiration.tsx caused blank page on first Home→Quran navigation
---

## Rule
All hooks in `DailyInspiration.tsx` must be called unconditionally before any early return.

**Why:** `useSaved` ×2, `useCallback` ×2, and `useActions` ×2 were originally called AFTER a conditional `if (!ayah || !hadith || !dua) return` at the old line 460. React development mode detects the hook-count mismatch when the conditional is taken on one render and not the next, throwing "Rendered fewer hooks than expected." This manifested as a blank page when navigating from Home to Quran via click (SPA navigation), because AnimatePresence mode="wait" would trigger re-renders during the exit animation.

**How to apply:**
- Compute `ayahKey`/`hadithKey` unconditionally with empty-string fallbacks when data is null.
- Keep `useSaved`, `useCallback` for text getters, and `useActions` before the early return.
- `useActions` uses a `useRef` pattern to always call the latest `getText` (avoids stale closures while keeping stable callback references for ActionBar memoization).
- `useSaved` syncs state via `useEffect` on key change (handles "" → real key on retry).
