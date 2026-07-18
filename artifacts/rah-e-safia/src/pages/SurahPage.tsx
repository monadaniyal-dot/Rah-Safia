import { memo, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  RefreshCw,
  AlertCircle,
  Loader2,
  Bookmark as BookmarkIcon,
  BookmarkCheck,
  BookMarked,
  Play,
  Pause,
  TextSearch,
} from "lucide-react";
import { surahs } from "@/lib/quran-data";
import { fetchSurah, isSajda, type AyahWithTranslations } from "@/lib/quran-api";
import { TRANSLATION_MODES, showUrdu, showEnglish, type TranslationMode } from "@/lib/surah-translations";
import { useBookmarks } from "@/lib/bookmarks";
import { useSettings } from "@/lib/use-settings";
import { useQuranPlayer } from "@/context/QuranPlayerContext";
import { cn } from "@/lib/utils";
import TafseerPanel from "@/components/ui/TafseerPanel";
import SoundBars from "@/components/quran/SoundBars";
import {
  saveQuranProgress,
  getQuranProgress,
} from "@/lib/reading-progress";
import { useLongPress } from "@/hooks/useLongPress";
import WordStudySheet, { type WordStudyTrigger } from "@/components/ui/WordStudySheet";
import { preloadQACData } from "@/lib/word-study-api";

function langToMode(lang: string): TranslationMode {
  switch (lang) {
    case "ur": return "arabic+urdu";
    case "en": return "arabic+english";
    default: return "arabic";
  }
}

// ── Module-level constant: compiled once, never recompiled on re-renders ─────
const D = "[\\u064B-\\u0652\\u0670]*";
const A = "[\\u0671\\u0627]";
const BISMILLAH_PREFIX_RE = new RegExp(
  "^\\u0628" + D + "\\u0633" + D + "\\u0645" + D + "\\s+" +
  A + D + "\\u0644" + D + "\\u0644" + D + "\\u0647" + D + "\\s+" +
  A + D + "\\u0644" + D + "\\u0631" + D + "\\u062D" + D + "\\u0645" + D + "\\u0646" + D + "\\s+" +
  A + D + "\\u0644" + D + "\\u0631" + D + "\\u062D" + D + "\\u064A" + D + "\\u0645" + D + "\\s*",
  "u"
);

/* ── Skeleton loader ── */
function AyahSkeleton({ index }: { index: number }) {
  return (
    <div
      className="rounded-2xl border border-border bg-secondary/30 p-4 animate-pulse"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-muted" />
        <div className="h-3 w-28 rounded-full bg-muted" />
      </div>
      <div className="space-y-2 text-right">
        <div className="h-5 w-full rounded-full bg-muted ml-auto" />
        <div className="h-5 w-4/5 rounded-full bg-muted ml-auto" />
        <div className="h-5 w-3/5 rounded-full bg-muted ml-auto" />
      </div>
    </div>
  );
}

// ─── Arabic word helpers ──────────────────────────────────────────────────────

/** True if the token contains at least one Arabic letter (not just punctuation / marks) */
function isArabicWord(token: string): boolean {
  return /[\u0621-\u064A\u066E\u066F\u0671-\u06D3\u06FA-\u06FF]/.test(token);
}

/**
 * A single Arabic word token rendered inside an AyahCard.
 * Uses useLongPress so the hook call is valid (not inside a conditional or .map callback).
 */
const WordToken = memo(function WordToken({
  word,
  index,
  onLongPress,
  interactive,
}: {
  word: string;
  index: number;
  onLongPress: (word: string, index: number) => void;
  interactive: boolean;
}) {
  const [pressed, setPressed] = useState(false);

  const cb = useCallback(
    () => onLongPress(word, index),
    [word, index, onLongPress]
  );

  const lpHandlers = useLongPress(cb, {
    delay: 450,
    onStart: () => { if (interactive) setPressed(true); },
    onCancel: () => setPressed(false),
  });

  // After the long-press fires the callback we still need to reset pressed
  // (the timer cleared inside useLongPress but setPressed(true) was called).
  // We detect this by seeing that the timer fired and the callback ran via a
  // short timeout reset.
  const resetPressed = useCallback(() => {
    const id = setTimeout(() => setPressed(false), 600);
    return () => clearTimeout(id);
  }, []);

  if (!interactive) {
    return <span className="select-none">{word} </span>;
  }

  return (
    <span
      {...lpHandlers}
      onMouseUp={() => setPressed(false)}
      className={cn(
        "rounded-md cursor-pointer select-none touch-none transition-colors duration-100 leading-[inherit]",
        pressed
          ? "bg-primary/25 text-primary"
          : "hover:bg-primary/12 hover:text-primary active:bg-primary/20"
      )}
      title="Long-press to study this word"
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
      onTouchEnd={() => { setPressed(false); resetPressed(); }}
    >
      {word}{" "}
    </span>
  );
});

/* ── Ayah card — memoized; calls hooks internally so callbacks are stable ── */
interface AyahCardProps {
  ayah: AyahWithTranslations;
  surahName: string;
  surahArabicName: string;
  surahNumber: number;
  totalAyahs: number;
  mode: TranslationMode;
  index: number;
  showTransliteration: boolean;
  isLastRead: boolean;
  highlightLastRead: boolean;
  /** Briefly flash/highlight this card (e.g. navigated-to from occurrence list) */
  isFlashed: boolean;
  /** Called when user long-presses a word in the Arabic text */
  onWordStudy: (word: string, wordIndex: number, surahNum: number, ayahNum: number) => void;
}

const AyahCard = memo(function AyahCard({
  ayah,
  surahName,
  surahArabicName,
  surahNumber,
  totalAyahs,
  mode,
  index,
  showTransliteration,
  isLastRead,
  highlightLastRead,
  isFlashed,
  onWordStudy,
}: AyahCardProps) {
  // Hooks inside the card — useQuranPlayer() no longer fires on timeupdate
  // because currentTime/duration were moved to PlayerProgressContext.
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { state: playerState, playAyah, togglePlayPause } = useQuranPlayer();

  // Flash state: true for ~2.4 s after this card is navigated to from the
  // word-study occurrence list. We use local state so only this one card
  // re-renders when the animation ends, not the whole ayah list.
  const [flashActive, setFlashActive] = useState(false);
  useEffect(() => {
    if (!isFlashed) return;
    setFlashActive(true);
    const t = setTimeout(() => setFlashActive(false), 2400);
    return () => clearTimeout(t);
  }, [isFlashed]);

  // Split arabic text into word tokens for long-press study
  const arabicWords = useMemo(
    () => ayah.arabic.split(/\s+/).filter(Boolean),
    [ayah.arabic]
  );

  const handleWordLongPress = useCallback(
    (word: string, wordIndex: number) => {
      onWordStudy(word, wordIndex, surahNumber, ayah.numberInSurah);
    },
    [onWordStudy, surahNumber, ayah.numberInSurah]
  );

  const isPlayingAyah =
    playerState.surahNumber === surahNumber &&
    playerState.ayahNumber === ayah.numberInSurah;
  const isPlayerPlaying = playerState.isPlaying;
  const isPlayerLoading = playerState.isLoading;

  const shouldHighlightLastRead = isLastRead && highlightLastRead && !isPlayingAyah;
  const bookmarked = isBookmarked(surahNumber, ayah.numberInSurah);
  const hasSajda = isSajda(ayah);
  const displayUrdu = showUrdu(mode);
  const displayEnglish = showEnglish(mode);

  const handlePlay = useCallback(() => {
    if (isPlayingAyah) {
      togglePlayPause();
    } else {
      playAyah(surahNumber, ayah.numberInSurah, surahName, surahArabicName, totalAyahs);
    }
  }, [isPlayingAyah, togglePlayPause, playAyah, surahNumber, ayah.numberInSurah, surahName, surahArabicName, totalAyahs]);

  const handleBookmark = useCallback(() => {
    toggleBookmark({
      surahNumber,
      surahName,
      surahArabicName,
      ayahNumber: ayah.numberInSurah,
      arabicText: ayah.arabic,
    });
  }, [toggleBookmark, surahNumber, surahName, surahArabicName, ayah.numberInSurah, ayah.arabic]);

  const cardBorder = isPlayingAyah
    ? "border-primary/50 bg-card ring-1 ring-primary/20"
    : shouldHighlightLastRead
    ? "border-gold/50 bg-card ring-1 ring-gold/25"
    : flashActive
    ? "border-emerald-400/60 bg-emerald-500/5 ring-2 ring-emerald-400/30"
    : "border-primary/12 bg-card";

  return (
    <motion.article
      id={`ayah-${surahNumber}-${ayah.numberInSurah}`}
      data-ayah={ayah.numberInSurah}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.035, 0.45) }}
      className={cn(
        "rounded-2xl border shadow-sm overflow-hidden transition-all duration-500",
        cardBorder
      )}
    >
      {/* Top indicator strip — playing (green) or last-read (gold) */}
      <AnimatePresence>
        {isPlayingAyah && (
          <motion.div
            key="playing-strip"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 origin-left"
          />
        )}
        {!isPlayingAyah && shouldHighlightLastRead && (
          <motion.div
            key="last-read-strip"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-0.5 w-full bg-gradient-to-r from-gold/40 via-gold to-gold/40 origin-left"
          />
        )}
        {!isPlayingAyah && !shouldHighlightLastRead && flashActive && (
          <motion.div
            key="flash-strip"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="h-0.5 w-full bg-gradient-to-r from-emerald-400/40 via-emerald-400 to-emerald-400/40 origin-left"
          />
        )}
      </AnimatePresence>

      {/* Ayah header row */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-colors duration-500",
              isPlayingAyah ? "gradient-primary" : shouldHighlightLastRead ? "bg-gold" : "gradient-primary"
            )}
          >
            {isPlayingAyah && isPlayerPlaying ? (
              <SoundBars className="text-white" />
            ) : (
              <span className="text-white text-xs font-bold">{ayah.numberInSurah}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">
                {surahName} {surahNumber}:{ayah.numberInSurah}
              </span>
              {isPlayingAyah && (
                <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full uppercase tracking-wide border border-primary/20 flex items-center gap-0.5">
                  Now playing
                </span>
              )}
              {!isPlayingAyah && shouldHighlightLastRead && (
                <span className="text-[9px] font-bold text-gold/80 bg-gold-muted px-1.5 py-0.5 rounded-full uppercase tracking-wide border border-gold/20 flex items-center gap-0.5">
                  <BookMarked className="w-2 h-2" strokeWidth={2.5} />
                  Last read
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground/60 ml-0">
              Juz {ayah.juz} · P.{ayah.page}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {hasSajda && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gold-muted text-gold border border-gold/20">
              ۩ Sajda
            </span>
          )}

          {/* Play / Pause button */}
          <motion.button
            onClick={handlePlay}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            aria-label={isPlayingAyah && isPlayerPlaying ? "Pause" : `Play ayah ${ayah.numberInSurah}`}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
              isPlayingAyah
                ? "gradient-primary text-white shadow-sm"
                : "bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-primary"
            )}
          >
            {isPlayingAyah && isPlayerLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
            ) : isPlayingAyah && isPlayerPlaying ? (
              <Pause className="w-3.5 h-3.5" strokeWidth={2.5} />
            ) : (
              <Play className="w-3.5 h-3.5 ml-0.5" strokeWidth={2.5} />
            )}
          </motion.button>

          <button
            onClick={handleBookmark}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark this ayah"}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
              bookmarked
                ? "bg-gold-muted hover:bg-gold/20"
                : "bg-secondary hover:bg-accent"
            )}
          >
            {bookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-gold fill-gold" strokeWidth={1.8} />
            ) : (
              <BookmarkIcon className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
            )}
          </button>
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* Arabic — split into interactive word tokens for long-press word study */}
        <p
          className="font-arabic leading-[2.2] text-right py-3 transition-colors duration-500 text-foreground"
          style={{ fontSize: "var(--arabic-reading-size)" }}
          dir="rtl"
          lang="ar"
        >
          {arabicWords.map((word, i) => (
            <WordToken
              key={i}
              word={word}
              index={i}
              onLongPress={handleWordLongPress}
              interactive={isArabicWord(word)}
            />
          ))}
        </p>

        {/* Transliteration — CSS fade-in; no Framer Motion instance per card */}
        {showTransliteration && ayah.transliteration && (
          <div className="animate-in fade-in duration-200 border-t border-border/40 pt-2 pb-1">
            <p className="text-[10px] font-semibold text-gold/70 uppercase tracking-wide mb-1">
              Transliteration
            </p>
            <p className="text-muted-foreground leading-relaxed italic" style={{ fontSize: "var(--translation-reading-size)" }}>
              {ayah.transliteration}
            </p>
          </div>
        )}

        {/* English translation — CSS fade-in; no Framer Motion instance per card */}
        {displayEnglish && ayah.english && (
          <div className="animate-in fade-in duration-200 border-t border-border/60 pt-3 pb-1">
            <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-wide mb-1.5">
              English — Sahih International
            </p>
            <p className="text-foreground/80 leading-relaxed" style={{ fontSize: "var(--translation-reading-size)" }}>
              {ayah.english}
            </p>
          </div>
        )}

        {/* Urdu translation — CSS fade-in; no Framer Motion instance per card */}
        {displayUrdu && ayah.urdu && (
          <div className="animate-in fade-in duration-200 border-t border-border/60 pt-3 pb-1">
            <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-wide mb-1.5">
              اردو — جالندھری
            </p>
            <p
              className="font-arabic text-foreground/85 leading-[2] text-right"
              style={{ fontSize: "var(--translation-reading-size)" }}
              dir="rtl"
              lang="ur"
            >
              {ayah.urdu}
            </p>
          </div>
        )}
      </div>

      {/* Tafseer — lazy-loaded, per-ayah */}
      <TafseerPanel surahNum={surahNumber} ayahNum={ayah.numberInSurah} />
    </motion.article>
  );
});

/* ── Main page ── */
export default function SurahPage() {
  const { number } = useParams<{ number: string }>();
  const [, navigate] = useLocation();
  const { settings } = useSettings();
  const [mode, setMode] = useState<TranslationMode>(() => langToMode(settings.translationLanguage));
  const [ayahs, setAyahs] = useState<AyahWithTranslations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Word Study state ─────────────────────────────────────────────────────
  const [studyTrigger, setStudyTrigger] = useState<WordStudyTrigger | null>(null);

  // ── Navigated-to-ayah flash highlight ────────────────────────────────────
  // Set to the target ayah number when navigating from word-study occurrences.
  // Cleared automatically after the animation completes.
  const [flashAyahNum, setFlashAyahNum] = useState<number>(0);

  const surahNum = parseInt(number ?? "1", 10);
  const surah = surahs.find((s) => s.number === surahNum);

  // ── Quran player ─────────────────────────────────────────────────────────
  const { state: playerState, playAyah, togglePlayPause } = useQuranPlayer();
  const isPlayerOnThisSurah = playerState.surahNumber === surahNum;
  const playingAyahNum = isPlayerOnThisSurah ? playerState.ayahNumber : null;

  // Track the last-read ayah number for highlight + to initialize on mount
  const [lastReadAyahNum, setLastReadAyahNum] = useState<number>(0);

  // Ref to current mode so IntersectionObserver callback doesn't need mode in its dep list
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Save timer ref for debouncing IntersectionObserver saves
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Whether we've already done the initial scroll-to-saved (only once per mount)
  const hasScrolledRef = useRef(false);

  // Container ref for IntersectionObserver — scoped to the ayah list, avoids
  // a full document.querySelectorAll scan on every ayah-list render.
  const ayahListRef = useRef<HTMLDivElement>(null);

  // ── Preload QAC data files so they are warm before first long-press ──────
  useEffect(() => { preloadQACData(); }, []);

  // ── Load surah data ──────────────────────────────────────────────────────
  // ── Word study callbacks ─────────────────────────────────────────────────
  const handleWordStudy = useCallback(
    (word: string, wordIndex: number, sNum: number, aNum: number) => {
      const surahObj = surahs.find((s) => s.number === sNum);
      setStudyTrigger({
        wordText: word,
        wordIndex,
        surahNum: sNum,
        surahName: surahObj?.name ?? "",
        ayahNum: aNum,
      });
    },
    []
  );

  const handleNavigateToVerse = useCallback(
    (targetSurah: number, targetAyah: number) => {
      if (targetSurah === surahNum) {
        // Same surah: scroll immediately and flash the card
        const el = document.getElementById(`ayah-${targetSurah}-${targetAyah}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        setFlashAyahNum(targetAyah);
        setTimeout(() => setFlashAyahNum(0), 2600);
      } else {
        // Different surah: pass ayah number via URL query param so the target
        // page can scroll and flash it after loading.
        navigate(`/quran/${targetSurah}?ayah=${targetAyah}`);
      }
    },
    [surahNum, navigate]
  );

  const load = useCallback((num: number) => {
    setIsLoading(true);
    setError(null);
    hasScrolledRef.current = false;
    fetchSurah(num, {
      edition: settings.defaultTranslation,
      transliteration: settings.showTransliteration,
    })
      .then((data) => {
        setAyahs(data.ayahs);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message ?? "Failed to load surah");
        setIsLoading(false);
      });
  }, [settings.defaultTranslation, settings.showTransliteration]);

  useEffect(() => {
    setAyahs([]);
    load(surahNum);
  }, [surahNum, load]);

  // ── Init last-read ayah from saved progress ──────────────────────────────
  useEffect(() => {
    const prog = getQuranProgress();
    if (prog && prog.surahNum === surahNum) {
      setLastReadAyahNum(prog.ayahNum);
    } else {
      setLastReadAyahNum(0);
    }
  }, [surahNum]);

  // ── After ayahs load: check for ?ayah=N navigation target ──────────────
  // When the user taps an occurrence in the word-study sheet and the target is
  // a different surah, we navigate to /quran/{N}?ayah={M}. This effect reads
  // that param once and scrolls + flashes the referenced ayah.
  useEffect(() => {
    if (!ayahs.length) return;
    const params = new URLSearchParams(window.location.search);
    const targetAyah = parseInt(params.get("ayah") ?? "0", 10);
    if (!targetAyah) return;

    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${surahNum}-${targetAyah}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setFlashAyahNum(targetAyah);
          setTimeout(() => setFlashAyahNum(0), 2600);
        }
      }, 200);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ayahs.length]);

  // ── After ayahs load: restore mode + scroll to saved position ─────────────
  useEffect(() => {
    if (!ayahs.length || hasScrolledRef.current) return;
    hasScrolledRef.current = true;

    const prog = getQuranProgress();
    if (!prog || prog.surahNum !== surahNum) {
      if (surah) saveQuranProgress(surahNum, surah.name, surah.arabicName, 1, { translationMode: modeRef.current });
      return;
    }

    // Restore saved translation mode
    if (prog.translationMode && TRANSLATION_MODES.some(tm => tm.id === prog.translationMode)) {
      setMode(prog.translationMode as TranslationMode);
    }

    // Only auto-scroll if resumeLastRead is enabled and not on ayah 1
    if (!settings.resumeLastRead || prog.ayahNum <= 1) return;

    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${surahNum}-${prog.ayahNum}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 120);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ayahs.length]);

  // ── IntersectionObserver: track visible ayah + debounced save ─────────────
  // Uses a containerRef scoped to the ayah list to avoid a full-document
  // querySelectorAll on every observation cycle.
  // Threshold simplified to a single value — reduces callback frequency by 3×.
  useEffect(() => {
    if (!ayahs.length || !surah) return;
    const container = ayahListRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!best || entry.intersectionRatio > best.intersectionRatio) {
              best = entry;
            }
          }
        }
        if (!best) return;

        const ayahNum = parseInt(
          best.target.getAttribute("data-ayah") ?? "0",
          10
        );
        if (!ayahNum) return;

        setLastReadAyahNum(ayahNum);

        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          saveQuranProgress(surahNum, surah.name, surah.arabicName, ayahNum, {
            translationMode: modeRef.current,
          });
        }, 1000);
      },
      { threshold: 0.4, rootMargin: "-10% 0px -10% 0px" }
    );

    const elements = container.querySelectorAll<Element>("[data-ayah]");
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ayahs.length, surahNum, surah]);

  // ── Auto-scroll to currently playing ayah ────────────────────────────────
  useEffect(() => {
    if (!playingAyahNum || !isPlayerOnThisSurah) return;
    const el = document.getElementById(`ayah-${surahNum}-${playingAyahNum}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [playingAyahNum, isPlayerOnThisSurah, surahNum]);

  if (!surah) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-4 p-8 text-center">
        <p className="font-arabic text-4xl text-muted-foreground/30" dir="rtl">؟</p>
        <p className="text-muted-foreground text-sm">Surah not found.</p>
        <button onClick={() => navigate("/quran")} className="text-sm text-primary hover:underline">
          ← Back to Qur'an
        </button>
      </div>
    );
  }

  const showBismillahBanner = surahNum !== 9 && surahNum !== 1;

  // useMemo prevents recomputing on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const displayedAyahs = useMemo(() =>
    showBismillahBanner
      ? ayahs.map((a, idx) =>
          idx === 0 ? { ...a, arabic: a.arabic.replace(BISMILLAH_PREFIX_RE, "") } : a
        )
      : ayahs,
  [ayahs, showBismillahBanner]);

  return (
    <div className="min-h-full flex flex-col">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-4 lg:px-8 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/quran")}
            className="w-8 h-8 rounded-lg bg-secondary hover:bg-accent flex items-center justify-center shrink-0 transition-colors"
            aria-label="Back to Qur'an"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" strokeWidth={2} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-foreground text-sm leading-tight truncate">
              {surah.name}
            </h1>
            <p className="text-xs text-muted-foreground leading-tight">
              Surah {surahNum} ·{" "}
              {isLoading ? "…" : surah.verses} verses · {surah.type}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => navigate("/root-search")}
              className="w-8 h-8 rounded-lg bg-secondary hover:bg-primary/10 flex items-center justify-center transition-colors group"
              aria-label="Search by root meaning"
              title="Search by root meaning"
            >
              <TextSearch className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.8} />
            </button>
            <p className="font-arabic text-lg text-foreground" dir="rtl">
              {surah.arabicName}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 lg:px-8 py-6 max-w-2xl mx-auto w-full">

        {/* ── Surah info banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl overflow-hidden gradient-primary islamic-pattern text-white shadow-lg mb-6"
        >
          <div className="relative p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center">
                    <BookOpen className="w-3 h-3 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-xs text-white/70 uppercase tracking-wider font-medium">
                    {surah.type}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">{surah.name}</h2>
                <p className="text-white/70 text-sm mt-0.5">{surah.englishName}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-arabic text-2xl text-white leading-none" dir="rtl">
                  {surah.arabicName}
                </p>
                <p className="text-white/60 text-xs mt-1">{surah.verses} Ayahs</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between gap-3">
              <div className="flex gap-4 text-xs text-white/60">
                <span>Surah #{surahNum}</span>
                <span>Page {surah.page}</span>
                <span>{surah.type} revelation</span>
              </div>

              {/* Play Surah button */}
              {!isLoading && ayahs.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  onClick={() => {
                    if (isPlayerOnThisSurah) {
                      togglePlayPause();
                    } else {
                      playAyah(surahNum, 1, surah.name, surah.arabicName, surah.verses);
                    }
                  }}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors"
                  aria-label={isPlayerOnThisSurah && playerState.isPlaying ? "Pause" : "Play Surah"}
                >
                  {isPlayerOnThisSurah && playerState.isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                  ) : isPlayerOnThisSurah && playerState.isPlaying ? (
                    <>
                      <SoundBars className="text-white" />
                      <span>Playing</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" strokeWidth={0} />
                      <span>Play Surah</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Translation selector ── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Translation
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TRANSLATION_MODES.map((tm) => (
              <button
                key={tm.id}
                onClick={() => setMode(tm.id)}
                className={cn(
                  "px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200 border",
                  mode === tm.id
                    ? "gradient-primary text-white border-primary/30 shadow-sm"
                    : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground hover:bg-accent"
                )}
              >
                {tm.label}
              </button>
            ))}
          </div>
          {settings.showTransliteration && (
            <p className="text-[10px] text-primary/60 mt-2 pl-1">
              ✓ Transliteration enabled
            </p>
          )}
        </motion.div>

        {/* ── Bismillah banner ── */}
        {showBismillahBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="text-center mb-6 py-5 px-4 rounded-2xl bg-gold-muted/60 border border-gold/20"
          >
            <p className="font-arabic text-3xl text-primary leading-loose" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            {showEnglish(mode) && (
              <p className="text-sm text-muted-foreground mt-2">
                In the name of Allah, the Most Gracious, the Most Merciful
              </p>
            )}
            {showUrdu(mode) && (
              <p className="font-arabic text-base text-muted-foreground mt-2" dir="rtl">
                اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے
              </p>
            )}
          </motion.div>
        )}

        {/* ── Loading ── */}
        {isLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
              <span className="text-sm">Loading {surah.name}…</span>
            </div>
            {Array.from({ length: Math.min(surah.verses, 5) }).map((_, i) => (
              <AyahSkeleton key={i} index={i} />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {!isLoading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-16 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-destructive" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Could not load surah</p>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                {error}. Please check your connection and try again.
              </p>
            </div>
            <button
              onClick={() => load(surahNum)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
              Try again
            </button>
          </motion.div>
        )}

        {/* ── Ayah list ── */}
        {!isLoading && !error && displayedAyahs.length > 0 && (
          <>
            <div ref={ayahListRef} className="space-y-4">
              {displayedAyahs.map((ayah, idx) => (
                <AyahCard
                  key={ayah.number}
                  ayah={ayah}
                  surahName={surah.name}
                  surahArabicName={surah.arabicName}
                  surahNumber={surahNum}
                  totalAyahs={surah.verses}
                  mode={mode}
                  index={idx}
                  showTransliteration={settings.showTransliteration}
                  isLastRead={ayah.numberInSurah === lastReadAyahNum}
                  highlightLastRead={settings.highlightLastReadVerse}
                  isFlashed={flashAyahNum === ayah.numberInSurah}
                  onWordStudy={handleWordStudy}
                />
              ))}
            </div>

            {/* Attribution footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 rounded-xl bg-secondary/40 border border-border px-4 py-3"
            >
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                Arabic: Uthmani script · Urdu: Fateh Muhammad Jalandhri
                <br />
                <span className="text-muted-foreground/60">via AlQuran.cloud API</span>
              </p>
            </motion.div>
          </>
        )}

        <div className="h-10" />
      </div>

      {/* ── Word Study Sheet — rendered outside the scrollable container ── */}
      <WordStudySheet
        trigger={studyTrigger}
        onClose={() => setStudyTrigger(null)}
        onNavigate={handleNavigateToVerse}
      />
    </div>
  );
}
