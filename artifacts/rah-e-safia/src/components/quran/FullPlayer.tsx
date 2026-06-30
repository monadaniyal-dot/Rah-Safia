import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, ChevronDown,
  Loader2, AlertCircle, RefreshCw, Repeat, Repeat1,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuranPlayer, usePlayerProgress, type PlaybackSpeed, type RepeatMode } from "@/context/QuranPlayerContext";
import { RECITERS, formatPlayerTime } from "@/lib/quran-audio";
import SoundBars from "./SoundBars";

const SPEEDS: PlaybackSpeed[] = [0.75, 1, 1.25];
const SPEED_LABELS: Record<PlaybackSpeed, string> = { 0.75: "¾×", 1: "1×", 1.25: "1¼×" };

const REPEAT_OPTIONS: { mode: RepeatMode; label: string; icon: React.ElementType }[] = [
  { mode: "off",   label: "Off",   icon: Repeat },
  { mode: "ayah",  label: "Ayah",  icon: Repeat1 },
  { mode: "surah", label: "Surah", icon: Repeat },
];

export default function FullPlayer() {
  const {
    state, togglePlayPause, nextAyah, prevAyah, seek,
    setSpeed, setRepeat, setReciter, closeFullPlayer,
  } = useQuranPlayer();

  const { currentTime, duration } = usePlayerProgress();
  const {
    surahName, surahArabicName, ayahNumber, totalAyahs,
    reciter, isPlaying, isLoading, hasError, errorMessage,
    speed, repeat, fullPlayerOpen,
  } = state;

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {fullPlayerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="fp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[58] bg-background/60 backdrop-blur-sm"
            onClick={closeFullPlayer}
          />

          {/* Panel — slides up from bottom */}
          <motion.div
            key="fp-panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[59]",
              "lg:left-64",
              "bg-card border-t border-border shadow-2xl",
              "flex flex-col max-h-[92dvh] overflow-y-auto scrollbar-hide",
              "rounded-t-3xl"
            )}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Top bar */}
            <div className="flex items-center justify-between px-5 pt-2 pb-4 shrink-0">
              <div className="w-8" />
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Now Playing
              </p>
              <motion.button
                onClick={closeFullPlayer}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close player"
              >
                <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
              </motion.button>
            </div>

            <div className="px-6 pb-6 flex flex-col gap-5">

              {/* Cover art area */}
              <div className="flex items-center justify-center">
                <div className="w-36 h-36 rounded-3xl gradient-primary islamic-pattern flex flex-col items-center justify-center shadow-xl">
                  {isLoading ? (
                    <Loader2 className="w-10 h-10 text-white animate-spin" strokeWidth={1.8} />
                  ) : isPlaying ? (
                    <SoundBars className="text-white scale-[2.5]" />
                  ) : (
                    <span className="text-6xl">🌙</span>
                  )}
                </div>
              </div>

              {/* Surah info */}
              <div className="text-center">
                <p className="font-arabic text-3xl text-foreground leading-none mb-1" dir="rtl">
                  {surahArabicName}
                </p>
                <h2 className="text-xl font-bold text-foreground leading-tight">{surahName}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {reciter.name}
                </p>
                {ayahNumber !== null && (
                  <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-xs font-semibold text-primary">
                      Ayah {ayahNumber} of {totalAyahs}
                    </span>
                    {isPlaying && <SoundBars className="text-primary" />}
                  </div>
                )}
              </div>

              {/* Error state */}
              {hasError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" strokeWidth={1.8} />
                  <p className="text-xs text-red-700 dark:text-red-400 flex-1">{errorMessage}</p>
                  <button
                    onClick={togglePlayPause}
                    className="shrink-0 flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 hover:opacity-80"
                  >
                    <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
                    Retry
                  </button>
                </motion.div>
              )}

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="relative h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full gradient-primary rounded-full transition-all duration-100"
                    style={{ width: `${pct}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.5}
                    value={currentTime}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Seek"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                  <span>{formatPlayerTime(currentTime)}</span>
                  <span>{formatPlayerTime(duration)}</span>
                </div>
              </div>

              {/* Main controls */}
              <div className="flex items-center justify-center gap-6">
                <motion.button
                  onClick={prevAyah}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center bg-secondary text-foreground hover:bg-accent transition-colors"
                  aria-label="Previous ayah"
                >
                  <SkipBack className="w-5 h-5" strokeWidth={2} />
                </motion.button>

                <motion.button
                  onClick={togglePlayPause}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  disabled={isLoading}
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
                    "gradient-primary text-white",
                    "transition-opacity",
                    isLoading && "opacity-70"
                  )}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isLoading ? (
                    <Loader2 className="w-7 h-7 animate-spin" strokeWidth={2} />
                  ) : isPlaying ? (
                    <Pause className="w-7 h-7" strokeWidth={2.5} />
                  ) : (
                    <Play className="w-7 h-7 ml-1" strokeWidth={2.5} />
                  )}
                </motion.button>

                <motion.button
                  onClick={nextAyah}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center bg-secondary text-foreground hover:bg-accent transition-colors"
                  aria-label="Next ayah"
                >
                  <SkipForward className="w-5 h-5" strokeWidth={2} />
                </motion.button>
              </div>

              {/* Speed + Repeat */}
              <div className="grid grid-cols-2 gap-3">
                {/* Playback speed */}
                <div className="rounded-2xl bg-secondary/50 border border-border p-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                    Speed
                  </p>
                  <div className="flex gap-1.5">
                    {SPEEDS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSpeed(s)}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                          speed === s
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-background text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {SPEED_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Repeat mode */}
                <div className="rounded-2xl bg-secondary/50 border border-border p-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                    Repeat
                  </p>
                  <div className="flex gap-1.5">
                    {REPEAT_OPTIONS.map(({ mode, label }) => (
                      <button
                        key={mode}
                        onClick={() => setRepeat(mode)}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                          repeat === mode
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-background text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reciter selector */}
              <div className="rounded-2xl bg-secondary/50 border border-border overflow-hidden">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 pt-3 pb-2">
                  Reciter
                </p>
                <div className="divide-y divide-border/50">
                  {RECITERS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setReciter(r)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-200",
                        r.id === reciter.id
                          ? "bg-primary/8 text-primary"
                          : "hover:bg-secondary/80 text-foreground"
                      )}
                    >
                      <div className="min-w-0">
                        <p className={cn(
                          "text-sm font-medium leading-tight truncate",
                          r.id === reciter.id ? "text-primary" : "text-foreground"
                        )}>
                          {r.name}
                        </p>
                        <p className="font-arabic text-xs text-muted-foreground mt-0.5" dir="rtl">
                          {r.arabicName}
                        </p>
                      </div>
                      {r.id === reciter.id && (
                        <motion.div
                          layoutId="reciter-check"
                          className="w-2 h-2 rounded-full bg-primary shrink-0 ml-3"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Attribution */}
              <p className="text-center text-[10px] text-muted-foreground/50">
                Audio via EveryAyah.com · Stream on demand
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
