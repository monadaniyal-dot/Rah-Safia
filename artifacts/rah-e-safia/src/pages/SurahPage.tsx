import { useState, useEffect, useCallback, useRef } from "react";
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

function langToMode(lang: string): TranslationMode {
  switch (lang) {
    case "ur": return "arabic+urdu";
    case "en": return "arabic+english";
    default: return "arabic";
  }
}

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

/* ── Ayah card ── */
function AyahCard({
  ayah,
  surahName,
  surahNumber,
  mode,
  index,
  bookmarked,
  showTransliteration,
  isLastRead,
  highlightLastRead,
  isPlayingAyah,
  isPlayerPlaying,
  isPlayerLoading,
  onToggleBookmark,
  onPlay,
}: {
  ayah: AyahWithTranslations;
  surahName: string;
  surahNumber: number;
  mode: TranslationMode;
  index: number;
  bookmarked: boolean;
  showTransliteration: boolean;
  isLastRead: boolean;
  highlightLastRead: boolean;
  isPlayingAyah: boolean;
  isPlayerPlaying: boolean;
  isPlayerLoading: boolean;
  onToggleBookmark: () => void;
  onPlay: () => void;
}) {
  const hasSajda = isSajda(ayah);
  const displayUrdu = showUrdu(mode);
  const displayEnglish = showEnglish(mode);
  const shouldHighlightLastRead = isLastRead && highlightLastRead && !isPlayingAyah;

  const cardBorder = isPlayingAyah
    ? "border-primary/50 bg-card ring-1 ring-primary/20"
    : shouldHighlightLastRead
    ? "border-gold/50 bg-card ring-1 ring-gold/25"
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
            onClick={onPlay}
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
            onClick={onToggleBookmark}
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
        {/* Arabic */}
        <p
          className="font-arabic text-2xl leading-[2.2] text-right py-3 transition-colors duration-500 text-foreground"
          dir="rtl"
          lang="ar"
        >
          {ayah.arabic}
        </p>

        {/* Transliteration */}
        <AnimatePresence>
          {showTransliteration && ayah.transliteration && (
            <motion.div
              key="transliteration"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="border-t border-border/40 pt-2 pb-1">
                <p className="text-[10px] font-semibold text-gold/70 uppercase tracking-wide mb-1">
                  Transliteration
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  {ayah.transliteration}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Translations */}
        <AnimatePresence>
          {displayEnglish && ayah.english && (
            <motion.div
              key="english"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="border-t border-border/60 pt-3 pb-1">
                <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-wide mb-1.5">
                  English — Sahih International
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {ayah.english}
                </p>
              </div>
            </motion.div>
          )}

          {displayUrdu && ayah.urdu && (
            <motion.div
              key="urdu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="border-t border-border/60 pt-3 pb-1">
                <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-wide mb-1.5">
                  اردو — جالندھری
                </p>
                <p
                  className="font-arabic text-base text-foreground/85 leading-[2] text-right"
                  dir="rtl"
                  lang="ur"
                >
                  {ayah.urdu}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tafseer — lazy-loaded, per-ayah */}
      <TafseerPanel surahNum={surahNumber} ayahNum={ayah.numberInSurah} />
    </motion.article>
  );
}

/* ── Main page ── */
export default function SurahPage() {
  const { number } = useParams<{ number: string }>();
  const [, navigate] = useLocation();
  const { settings } = useSettings();
  const [mode, setMode] = useState<TranslationMode>(() => langToMode(settings.translationLanguage));
  const [ayahs, setAyahs] = useState<AyahWithTranslations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const surahNum = parseInt(number ?? "1", 10);
  const surah = surahs.find((s) => s.number === surahNum);
  const { isBookmarked, toggleBookmark } = useBookmarks();

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

  // ── Load surah data ──────────────────────────────────────────────────────
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

  // ── After ayahs load: restore mode + scroll to saved position ─────────────
  useEffect(() => {
    if (!ayahs.length || hasScrolledRef.current) return;
    hasScrolledRef.current = true;

    const prog = getQuranProgress();
    if (!prog || prog.surahNum !== surahNum) {
      // New surah — save it at ayah 1 as a "started" marker
      if (surah) saveQuranProgress(surahNum, surah.name, surah.arabicName, 1, { translationMode: modeRef.current });
      return;
    }

    // Restore saved translation mode
    if (prog.translationMode && TRANSLATION_MODES.some(tm => tm.id === prog.translationMode)) {
      setMode(prog.translationMode as TranslationMode);
    }

    // Only auto-scroll if resumeLastRead is enabled and not on ayah 1
    if (!settings.resumeLastRead || prog.ayahNum <= 1) return;

    // Give DOM a frame to render, then scroll
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
  useEffect(() => {
    if (!ayahs.length || !surah) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most-intersecting visible entry
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

        // Update highlight immediately
        setLastReadAyahNum(ayahNum);

        // Debounce the localStorage write (1 s)
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          saveQuranProgress(surahNum, surah.name, surah.arabicName, ayahNum, {
            translationMode: modeRef.current,
          });
        }, 1000);
      },
      { threshold: [0.1, 0.5, 0.9], rootMargin: "-10% 0px -10% 0px" }
    );

    const elements = document.querySelectorAll<Element>(`[data-ayah]`);
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  // Re-run when ayahs change (new surah) but NOT when mode changes — modeRef handles that
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

  const D = "[\\u064B-\\u0652\\u0670]*";
  const A = "[\\u0671\\u0627]";
  const BISMILLAH_PREFIX_RE = new RegExp(
    "^\\u0628" + D + "\\u0633" + D + "\\u0645" + D + "\\s+" +
    A + D + "\\u0644" + D + "\\u0644" + D + "\\u0647" + D + "\\s+" +
    A + D + "\\u0644" + D + "\\u0631" + D + "\\u062D" + D + "\\u0645" + D + "\\u0646" + D + "\\s+" +
    A + D + "\\u0644" + D + "\\u0631" + D + "\\u062D" + D + "\\u064A" + D + "\\u0645" + D + "\\s*",
    "u"
  );

  const displayedAyahs = showBismillahBanner
    ? ayahs.map((a, idx) =>
        idx === 0 ? { ...a, arabic: a.arabic.replace(BISMILLAH_PREFIX_RE, "") } : a
      )
    : ayahs;

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
          <p className="font-arabic text-lg text-foreground shrink-0" dir="rtl">
            {surah.arabicName}
          </p>
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
            <div className="space-y-4">
              {displayedAyahs.map((ayah, idx) => (
                <AyahCard
                  key={ayah.number}
                  ayah={ayah}
                  surahName={surah.name}
                  surahNumber={surahNum}
                  mode={mode}
                  index={idx}
                  bookmarked={isBookmarked(surahNum, ayah.numberInSurah)}
                  showTransliteration={settings.showTransliteration}
                  isLastRead={ayah.numberInSurah === lastReadAyahNum}
                  highlightLastRead={settings.highlightLastReadVerse}
                  isPlayingAyah={playingAyahNum === ayah.numberInSurah}
                  isPlayerPlaying={playerState.isPlaying}
                  isPlayerLoading={playerState.isLoading}
                  onPlay={() => {
                    if (playingAyahNum === ayah.numberInSurah) {
                      togglePlayPause();
                    } else {
                      playAyah(surahNum, ayah.numberInSurah, surah.name, surah.arabicName, surah.verses);
                    }
                  }}
                  onToggleBookmark={() =>
                    toggleBookmark({
                      surahNumber: surahNum,
                      surahName: surah.name,
                      surahArabicName: surah.arabicName,
                      ayahNumber: ayah.numberInSurah,
                      arabicText: ayah.arabic,
                    })
                  }
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
    </div>
  );
}
