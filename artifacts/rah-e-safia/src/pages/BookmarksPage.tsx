import { memo, useMemo, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark, Trash2, ExternalLink, BookOpen, HandHeart,
  Play, Pause, Loader2,
} from "lucide-react";
import { useBookmarks, type Bookmark as BookmarkType } from "@/lib/bookmarks";
import { useDuaBookmarks, type DuaBookmark } from "@/lib/dua-bookmarks";
import { useQuranPlayer } from "@/context/QuranPlayerContext";
import { surahs } from "@/lib/quran-data";
import { cn } from "@/lib/utils";
import SoundBars from "@/components/quran/SoundBars";

// ─── Types ────────────────────────────────────────────────────────────────────

type HandlePlayFn = (
  surahNumber: number,
  ayahNumber: number,
  surahName: string,
  surahArabicName: string,
) => void;

// ─── Ayah bookmark card ───────────────────────────────────────────────────────
// Memoized so only the card whose `isCurrentlyPlaying` changes re-renders when
// the player state updates — all other cards are skipped entirely.

const AyahBookmarkCard = memo(function AyahBookmarkCard({
  bookmark,
  isCurrentlyPlaying,
  globalIsPlaying,
  globalIsLoading,
  onPlay,
  onNavigate,
  onRemove,
  idx,
}: {
  bookmark: BookmarkType;
  isCurrentlyPlaying: boolean;
  globalIsPlaying: boolean;
  globalIsLoading: boolean;
  onPlay: HandlePlayFn;
  onNavigate: (surahNumber: number) => void;
  onRemove: (id: string) => void;
  idx: number;
}) {
  const thisIsPlaying = isCurrentlyPlaying && globalIsPlaying;
  const thisIsLoading = isCurrentlyPlaying && globalIsLoading;

  // Stable per-card callbacks — bookmark data is a stable reference (same object
  // from state array unless this card is added/removed), and the parent handlers
  // are stable via useCallback + useRef, so these only recreate when bookmark changes.
  const handlePlay = useCallback(
    () => onPlay(bookmark.surahNumber, bookmark.ayahNumber, bookmark.surahName, bookmark.surahArabicName),
    [onPlay, bookmark.surahNumber, bookmark.ayahNumber, bookmark.surahName, bookmark.surahArabicName],
  );
  const handleNavigate = useCallback(
    () => onNavigate(bookmark.surahNumber),
    [onNavigate, bookmark.surahNumber],
  );
  const handleRemove = useCallback(
    () => onRemove(bookmark.id),
    [onRemove, bookmark.id],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, delay: idx * 0.03 }}
      layout
      className={cn(
        "rounded-2xl border shadow-sm overflow-hidden transition-all duration-400",
        isCurrentlyPlaying
          ? "border-primary/50 bg-card ring-1 ring-primary/20"
          : "border-primary/12 bg-card"
      )}
    >
      {/* Playing indicator strip */}
      <AnimatePresence>
        {isCurrentlyPlaying && (
          <motion.div
            key="playing-strip"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 origin-left"
          />
        )}
      </AnimatePresence>

      {/* Card header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-all duration-300",
            "gradient-primary"
          )}>
            {thisIsPlaying ? (
              <SoundBars className="text-white" />
            ) : (
              <span className="text-white text-xs font-bold">{bookmark.ayahNumber}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-foreground leading-tight truncate">
                {bookmark.surahName}
              </p>
              {isCurrentlyPlaying && (
                <span className="shrink-0 text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full uppercase tracking-wide border border-primary/20">
                  Now playing
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-tight">
              Surah {bookmark.surahNumber} · Ayah {bookmark.ayahNumber}
            </p>
          </div>
        </div>
        <p className="font-arabic text-base text-primary/70 shrink-0 ml-2" dir="rtl">
          {bookmark.surahArabicName}
        </p>
      </div>

      {/* Arabic preview */}
      <div className="px-4 pb-3">
        <p
          className="font-arabic text-xl text-foreground leading-[2] text-right line-clamp-2"
          dir="rtl"
          lang="ar"
        >
          {bookmark.arabicText}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 pb-4">
        {/* Play from here */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          onClick={handlePlay}
          className={cn(
            "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0",
            isCurrentlyPlaying
              ? "gradient-primary text-white shadow-sm"
              : "bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-primary"
          )}
          aria-label={thisIsPlaying ? "Pause" : "Play from this ayah"}
        >
          {thisIsLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
          ) : thisIsPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 ml-0.5" strokeWidth={2.5} />
              <span>Play here</span>
            </>
          )}
        </motion.button>

        {/* Open Surah */}
        <button
          onClick={handleNavigate}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/8 hover:bg-primary/14 text-primary text-xs font-semibold transition-colors duration-200"
        >
          <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
          Open Surah
        </button>

        {/* Remove */}
        <button
          onClick={handleRemove}
          className="w-9 h-9 rounded-xl bg-destructive/8 hover:bg-destructive/16 flex items-center justify-center transition-colors duration-200 shrink-0"
          aria-label="Remove bookmark"
        >
          <Trash2 className="w-3.5 h-3.5 text-destructive" strokeWidth={2} />
        </button>
      </div>
    </motion.div>
  );
});

// ─── Dua bookmark card ────────────────────────────────────────────────────────
// Memoized: dua content is static after being bookmarked. Only re-renders when
// the user removes it (which triggers AnimatePresence exit, then unmounts).

const DuaBookmarkCard = memo(function DuaBookmarkCard({
  dua,
  onRemove,
  idx,
}: {
  dua: DuaBookmark;
  onRemove: (id: string) => void;
  idx: number;
}) {
  const handleRemove = useCallback(() => onRemove(dua.id), [onRemove, dua.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, delay: idx * 0.03 }}
      layout
      className="rounded-2xl border border-primary/12 bg-card shadow-sm overflow-hidden"
    >
      {/* Amber accent line at top */}
      <div className="h-0.5 bg-gradient-to-r from-amber-500/60 via-amber-400/40 to-transparent" />

      {/* Source badge */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
          <HandHeart className="w-2.5 h-2.5 text-amber-500 shrink-0" strokeWidth={2} />
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
            {dua.source}
          </span>
        </div>
      </div>

      {/* Arabic text */}
      <div className="px-4 pb-2">
        <p
          className="font-arabic text-xl text-foreground leading-[1.95] text-right line-clamp-3"
          dir="rtl"
          lang="ar"
        >
          {dua.arabic}
        </p>
      </div>

      {/* Transliteration */}
      <div className="px-4 pb-2">
        <p className="text-xs text-muted-foreground italic leading-relaxed line-clamp-2">
          {dua.transliteration}
        </p>
      </div>

      {/* English */}
      <div className="px-4 pb-3">
        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">
          "{dua.english}"
        </p>
      </div>

      {/* Remove action */}
      <div className="flex items-center gap-2 px-4 pb-4">
        <div className="flex-1" />
        <button
          onClick={handleRemove}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive/8 hover:bg-destructive/16 text-destructive text-xs font-medium transition-colors duration-200"
          aria-label="Remove dua bookmark"
        >
          <Trash2 className="w-3 h-3" strokeWidth={2} />
          Remove
        </button>
      </div>
    </motion.div>
  );
});

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BookmarksPage() {
  const [, navigate] = useLocation();
  const { bookmarks, removeBookmark } = useBookmarks();
  const { duaBookmarks, removeDuaBookmark } = useDuaBookmarks();
  const { state: playerState, playAyah, togglePlayPause } = useQuranPlayer();

  // Sort once per bookmarks change, not on every render.
  const sorted     = useMemo(() => [...bookmarks].sort((a, b) => b.timestamp - a.timestamp), [bookmarks]);
  const sortedDuas = useMemo(() => [...duaBookmarks].sort((a, b) => b.timestamp - a.timestamp), [duaBookmarks]);

  const hasAyahs   = sorted.length > 0;
  const hasDuas    = sortedDuas.length > 0;
  const hasAnything = hasAyahs || hasDuas;

  const headerSubtitle = useMemo(() => {
    const total = sorted.length + sortedDuas.length;
    if (total === 0) return "Nothing saved yet";
    const parts: string[] = [];
    if (sorted.length > 0) parts.push(`${sorted.length} ayah${sorted.length === 1 ? "" : "s"}`);
    if (sortedDuas.length > 0) parts.push(`${sortedDuas.length} dua${sortedDuas.length === 1 ? "" : "s"}`);
    return parts.join(" · ");
  }, [sorted.length, sortedDuas.length]);

  // Keep a ref to playerState so handlePlay never needs to be recreated when
  // the player changes — AyahBookmarkCard's onPlay stays stable across renders.
  const playerStateRef = useRef(playerState);
  useEffect(() => { playerStateRef.current = playerState; }, [playerState]);

  // Stable play handler — reads current player state from the ref so it never
  // closes over stale values, and never needs to change its reference.
  const handlePlay = useCallback<HandlePlayFn>(
    (surahNumber, ayahNumber, surahName, surahArabicName) => {
      const ps = playerStateRef.current;
      if (ps.surahNumber === surahNumber && ps.ayahNumber === ayahNumber) {
        togglePlayPause();
      } else {
        const meta = surahs.find((s) => s.number === surahNumber);
        const totalAyahs = meta?.verses ?? 0;
        playAyah(surahNumber, ayahNumber, surahName, surahArabicName, totalAyahs);
      }
    },
    [togglePlayPause, playAyah],
  );

  // Stable navigation handler (navigate from wouter is already stable).
  const handleNavigate = useCallback(
    (surahNumber: number) => navigate(`/quran/${surahNumber}`),
    [navigate],
  );

  return (
    <div className="min-h-full flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-4 lg:px-8 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm shrink-0">
            <Bookmark className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-foreground text-sm leading-tight">Bookmarks</h1>
            <p className="text-xs text-muted-foreground leading-tight">{headerSubtitle}</p>
          </div>
          <p className="font-arabic text-base text-muted-foreground shrink-0" dir="rtl">
            المحفوظات
          </p>
        </div>
      </header>

      <div className="flex-1 px-4 lg:px-8 py-6 max-w-2xl mx-auto w-full">

        {/* ── Empty state ── */}
        {!hasAnything && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38 }}
            className="flex flex-col items-center justify-center gap-6 py-20 text-center"
          >
            {/* Icon cluster */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-primary/8 border border-primary/12 flex items-center justify-center shadow-sm">
                <Bookmark className="w-10 h-10 text-primary/35" strokeWidth={1.3} />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-amber-400/12 border border-amber-400/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-amber-500/50" strokeWidth={1.6} />
              </div>
              <div className="absolute -bottom-2 -left-2 w-7 h-7 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
                <HandHeart className="w-3.5 h-3.5 text-primary/40" strokeWidth={1.6} />
              </div>
            </div>

            {/* Text */}
            <div className="space-y-2">
              <p className="font-arabic text-xl text-primary/50" dir="rtl">لا محفوظات بعد</p>
              <p className="font-semibold text-foreground text-base">Nothing saved yet</p>
              <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
                Bookmark ayahs while reading the Qur'an, or save the Daily Dua from the home screen.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <button
                onClick={() => navigate("/quran")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
              >
                <BookOpen className="w-4 h-4" strokeWidth={2} />
                Start Reading
              </button>
              <button
                onClick={() => navigate("/hadith")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                <HandHeart className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                Browse Hadith
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Qur'an Ayahs section ── */}
        {hasAyahs && (
          <div className="mb-8">
            {/* Section heading — only shown when both categories have items */}
            {hasDuas && (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <BookOpen className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground leading-tight">Qur'an Ayahs</h2>
                  <p className="text-[11px] text-muted-foreground">{sorted.length} saved</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {sorted.map((bookmark, idx) => (
                  <AyahBookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    idx={idx}
                    isCurrentlyPlaying={
                      playerState.surahNumber === bookmark.surahNumber &&
                      playerState.ayahNumber === bookmark.ayahNumber
                    }
                    globalIsPlaying={playerState.isPlaying}
                    globalIsLoading={playerState.isLoading}
                    onPlay={handlePlay}
                    onNavigate={handleNavigate}
                    onRemove={removeBookmark}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ── Daily Duas section ── */}
        {hasDuas && (
          <div className="mb-6">
            {/* Section heading */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                <HandHeart className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground leading-tight">Daily Duas</h2>
                <p className="text-[11px] text-muted-foreground">{sortedDuas.length} saved</p>
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {sortedDuas.map((dua, idx) => (
                  <DuaBookmarkCard
                    key={dua.id}
                    dua={dua}
                    idx={idx}
                    onRemove={removeDuaBookmark}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Footer hint */}
        {hasAnything && (
          <p className="text-center text-xs text-muted-foreground/60 pt-2 pb-4">
            Tap the trash icon to remove a bookmark
          </p>
        )}

        <div className="h-10" />
      </div>
    </div>
  );
}
