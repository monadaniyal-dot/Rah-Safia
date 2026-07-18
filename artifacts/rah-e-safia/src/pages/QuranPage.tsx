import { useState, useMemo, useCallback, memo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Search, X, ChevronRight, BookMarked,
  Clock, ArrowRight, Play, Pause, Loader2, Languages,
} from "lucide-react";
import { surahs, type Surah } from "@/lib/quran-data";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/use-settings";
import { useReadingProgress, relativeTime } from "@/lib/reading-progress";
import { useQuranPlayer } from "@/context/QuranPlayerContext";
import SoundBars from "@/components/quran/SoundBars";

// ── Memoised row — only re-renders when player state for THIS surah changes ──
interface SurahRowProps {
  surah: Surah;
  isActive: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  onNavigate: (number: number) => void;
  onPlay: (surah: Surah) => void;
}

const SurahRow = memo(function SurahRow({
  surah,
  isActive,
  isPlaying,
  isLoading,
  onNavigate,
  onPlay,
}: SurahRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 py-2 rounded-xl px-1 -mx-1 transition-colors duration-150",
        isActive && "bg-primary/5"
      )}
    >
      {/* ── Main tap area → navigate ── */}
      <button
        onClick={() => onNavigate(surah.number)}
        className="flex-1 flex items-center gap-3 py-2 px-2 text-left group rounded-xl hover:bg-secondary/60 transition-colors duration-150 min-w-0"
      >
        {/* Surah number badge */}
        <div className={cn(
          "shrink-0 w-11 h-11 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300",
          isActive ? "gradient-primary shadow-primary/30 shadow-md" : "gradient-primary"
        )}>
          {isPlaying ? (
            <SoundBars className="text-white" />
          ) : (
            <span className="text-white text-xs font-bold">{surah.number}</span>
          )}
        </div>

        {/* Names — three-tier hierarchy */}
        <div className="flex-1 min-w-0">
          <p
            className="font-arabic text-foreground leading-snug font-bold truncate"
            dir="rtl"
            style={{ fontSize: "clamp(1.1rem, 3.5vw, 1.35rem)" }}
          >
            {surah.arabicName}
          </p>
          <p className={cn(
            "text-sm font-bold mt-0.5 leading-tight transition-colors duration-200",
            isActive ? "text-primary" : "text-foreground/85"
          )}>
            {surah.name}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground">{surah.englishName}</span>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <span
              className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none",
                surah.type === "Meccan"
                  ? "bg-primary/10 text-primary"
                  : "bg-gold-muted text-gold"
              )}
            >
              {surah.type}
            </span>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <span className="text-[11px] text-muted-foreground">{surah.verses} verses</span>
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight
          className="shrink-0 w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-150"
          strokeWidth={2}
        />
      </button>

      {/* ── Play button ── */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        onClick={() => onPlay(surah)}
        aria-label={
          isPlaying
            ? `Pause ${surah.name}`
            : `Play ${surah.name} from the beginning`
        }
        className={cn(
          "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
          isActive
            ? "gradient-primary text-white shadow-sm shadow-primary/30"
            : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
        ) : isPlaying ? (
          <Pause className="w-3.5 h-3.5" strokeWidth={2.5} />
        ) : (
          <Play className="w-3.5 h-3.5 ml-0.5" strokeWidth={2.5} />
        )}
      </motion.button>
    </div>
  );
});

export default function QuranPage() {
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();
  const { settings } = useSettings();
  const progress = useReadingProgress();
  const { state: playerState, playAyah, togglePlayPause } = useQuranPlayer();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return surahs;
    const num = parseInt(q, 10);
    return surahs.filter(
      (s) =>
        (!isNaN(num) && s.number === num) ||
        s.name.toLowerCase().includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        s.arabicName.includes(query.trim())
    );
  }, [query]);

  const saved = settings.resumeLastRead ? progress.quran : undefined;

  const handleNavigate = useCallback((number: number) => {
    navigate(`/quran/${number}`);
  }, [navigate]);

  const handlePlay = useCallback((surah: Surah) => {
    if (playerState.surahNumber === surah.number) {
      togglePlayPause();
    } else {
      playAyah(surah.number, 1, surah.name, surah.arabicName, surah.verses);
    }
  }, [playerState.surahNumber, togglePlayPause, playAyah]);

  return (
    <div className="min-h-full flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 shadow-sm">
          <BookOpen className="w-4 h-4 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="font-semibold text-foreground text-sm leading-tight">Qur'an</h1>
          <p className="font-arabic text-muted-foreground text-xs leading-tight" dir="rtl">
            القرآن الكريم
          </p>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        {/* Sticky top section: heading + search */}
        <div className="sticky top-[60px] lg:top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 lg:px-8 pt-5 lg:pt-8 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="hidden lg:flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Qur'an
              </span>
            </div>
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-foreground leading-tight">
                  The Holy Qur'an
                </h2>
                <p className="font-arabic text-muted-foreground text-base mt-0.5" dir="rtl">
                  القرآن الكريم
                </p>
              </div>
              <p className="text-xs text-muted-foreground shrink-0 pb-1">
                114 Surahs
              </p>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" strokeWidth={1.8} />
              <input
                type="search"
                aria-label="Search surahs by name or number"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or number…"
                className={cn(
                  "w-full pl-10 pr-10 py-2.5 rounded-xl text-sm",
                  "bg-secondary border border-border",
                  "text-foreground placeholder:text-muted-foreground",
                  "outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
                  "transition-all duration-200"
                )}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {query && (
              <p className="text-xs text-muted-foreground mt-2">
                {filtered.length === 0
                  ? "No surahs found"
                  : `${filtered.length} surah${filtered.length !== 1 ? "s" : ""} found`}
              </p>
            )}

            {/* Root meaning search entry point */}
            {!query && (
              <button
                onClick={() => navigate("/root-search")}
                className="mt-3 w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors duration-150 group"
              >
                <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <Languages className="w-3 h-3 text-white" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold text-foreground leading-tight">
                    Search roots by English meaning
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Type "mercy", "justice"… and find matching Arabic roots
                  </p>
                </div>
                <ChevronRight
                  className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors"
                  strokeWidth={2}
                />
              </button>
            )}
          </motion.div>
        </div>

        {/* Surah list */}
        <div className="flex-1 px-4 lg:px-8 py-3">

          {/* ── Continue Reading banner / start nudge ── */}
          <AnimatePresence>
            {!saved && !query && (
              <motion.div
                key="start-nudge"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <div className="w-full rounded-2xl border border-border bg-secondary/40 overflow-hidden">
                  <div className="px-4 py-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/8 border border-primary/12 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4.5 h-4.5 text-primary/50" strokeWidth={1.6} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-tight">
                        Start your reading journey
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Open any Surah and your progress is saved automatically
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
                  </div>
                </div>
              </motion.div>
            )}
            {saved && !query && (
              <motion.div
                key="resume-banner"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <div className="w-full text-left rounded-2xl border border-gold/35 bg-gradient-to-r from-gold-muted/60 to-gold-muted/30 overflow-hidden shadow-sm group flex items-stretch">
                  <button
                    onClick={() => navigate(`/quran/${saved.surahNum}`)}
                    className="flex-1 text-left hover:from-gold-muted hover:to-gold-muted/50 transition-all duration-200"
                  >
                    <div className="h-0.5 w-full bg-gradient-to-r from-gold/50 via-gold to-gold/50" />
                    <div className="px-4 py-3.5 flex items-center gap-3">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0">
                        <BookMarked className="w-5 h-5 text-gold" strokeWidth={1.8} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-gold/80 uppercase tracking-widest mb-0.5">
                          Continue Reading
                        </p>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-sm font-bold text-foreground leading-tight">
                            {saved.surahName}
                          </span>
                          <span className="font-arabic text-sm text-foreground/70" dir="rtl">
                            {saved.surahArabicName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            Ayah {saved.ayahNum}
                            {saved.ayahNum > 1 && (
                              <span className="text-muted-foreground/60"> of {surahs.find(s => s.number === saved.surahNum)?.verses ?? "…"}</span>
                            )}
                          </span>
                          <span className="text-muted-foreground/30 text-xs">·</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
                            <Clock className="w-3 h-3" strokeWidth={2} />
                            {relativeTime(saved.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight
                        className="w-4 h-4 text-gold/70 shrink-0 group-hover:translate-x-0.5 transition-transform duration-150"
                        strokeWidth={2}
                      />
                    </div>
                  </button>

                  {/* Play from saved position */}
                  {(() => {
                    const savedSurah = surahs.find(s => s.number === saved.surahNum);
                    if (!savedSurah) return null;
                    const isActive = playerState.surahNumber === saved.surahNum;
                    const isPlaying = isActive && playerState.isPlaying;
                    const isLoading = isActive && playerState.isLoading;
                    return (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 500, damping: 28 }}
                        onClick={() => {
                          if (isActive) {
                            togglePlayPause();
                          } else {
                            playAyah(saved.surahNum, saved.ayahNum, saved.surahName, saved.surahArabicName, savedSurah.verses);
                          }
                        }}
                        aria-label={isPlaying ? "Pause" : `Play from ayah ${saved.ayahNum}`}
                        className={cn(
                          "shrink-0 w-14 flex flex-col items-center justify-center gap-1 border-l border-gold/20 transition-colors duration-200",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-gold/10 text-gold/70 hover:text-gold"
                        )}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                        ) : isPlaying ? (
                          <SoundBars className={isActive ? "text-primary" : "text-gold"} />
                        ) : (
                          <Play className="w-4 h-4 fill-current" strokeWidth={0} />
                        )}
                        <span className="text-[9px] font-semibold uppercase tracking-wide leading-none">
                          {isPlaying ? "Playing" : "Play"}
                        </span>
                      </motion.button>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-20 text-center gap-4"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center">
                <Search className="w-7 h-7 text-muted-foreground/40" strokeWidth={1.5} />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <p className="font-medium text-foreground text-sm">
                  No surahs found
                  {query.trim() && (
                    <> for "<span className="text-primary">{query.trim()}</span>"</>
                  )}
                </p>
                <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed">
                  Try the surah name, number, or topic in English or Arabic
                </p>
              </div>

              {/* Action */}
              <button
                onClick={() => setQuery("")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/8 hover:bg-primary/14 text-primary text-xs font-semibold transition-colors duration-200 border border-primary/15"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                Clear search
              </button>
            </motion.div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((surah) => {
                const isActive = playerState.surahNumber === surah.number;
                const isPlaying = isActive && playerState.isPlaying;
                const isLoading = isActive && playerState.isLoading;

                return (
                  <SurahRow
                    key={surah.number}
                    surah={surah}
                    isActive={isActive}
                    isPlaying={isPlaying}
                    isLoading={isLoading}
                    onNavigate={handleNavigate}
                    onPlay={handlePlay}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
