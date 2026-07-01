---
name: Player progress context split
description: Why currentTime/duration are in a separate PlayerProgressContext, not the main QuranPlayerContext.
---

The `timeupdate` audio event fires ~4 times/second during playback. Before the split, every `useQuranPlayer()` consumer (SurahPage with up to 286 AyahCards, QuranPage with 114 rows, Sidebar, BottomNav, etc.) re-rendered at that rate — hundreds of wasted renders per second.

**Fix**: Split the context into two:
- `QuranPlayerContext` — stable playback state (surahNumber, ayahNumber, isPlaying, isLoading, hasError, speed, repeat, reciter, fullPlayerOpen). Changes only on meaningful events: play, pause, ayah navigation, error, settings change.
- `PlayerProgressContext` — `{ currentTime: number; duration: number }`. Updated on `timeupdate` and `durationchange` only.

**Hooks**:
- `useQuranPlayer()` — the full player context (controls, state). Used everywhere.
- `usePlayerProgress()` — progress only. Used ONLY by `MiniPlayer` and `FullPlayer`.

**Why**: Consumers of `useQuranPlayer()` are now only re-rendered when meaningful state changes (play/pause, ayah change), not 4× per second.

**How to apply**: Any new component that only needs currentTime/duration (e.g. a waveform visualizer) should call `usePlayerProgress()`. Any new component that adds player controls calls `useQuranPlayer()`. Never add currentTime/duration back to the main QuranPlayerState.
