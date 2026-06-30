import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, X, Music2, Loader2, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuranPlayer, usePlayerProgress } from "@/context/QuranPlayerContext";
import { formatPlayerTime } from "@/lib/quran-audio";
import SoundBars from "./SoundBars";

export default function MiniPlayer() {
  const { state, togglePlayPause, nextAyah, prevAyah, stop, openFullPlayer } = useQuranPlayer();
  const { currentTime, duration } = usePlayerProgress();
  const { surahNumber, surahName, ayahNumber, totalAyahs, reciter,
          isPlaying, isLoading, hasError } = state;

  const visible = surahNumber !== null;
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="mini-player"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 32 }}
          className={cn(
            "fixed left-0 right-0 z-[45]",
            "bottom-[92px] lg:bottom-0 lg:left-64",
            "bg-card/98 backdrop-blur-xl border-t border-border shadow-2xl",
          )}
        >
          {/* Progress bar — top edge */}
          <div className="h-[3px] w-full bg-border overflow-hidden">
            <motion.div
              className="h-full gradient-primary"
              style={{ width: `${pct}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5 h-[60px]">
            {/* Info area — tap to open full player */}
            <button
              onClick={openFullPlayer}
              className="flex-1 flex items-center gap-3 min-w-0 text-left"
              aria-label="Open full player"
            >
              {/* Icon */}
              <div className="shrink-0 w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" strokeWidth={2} />
                ) : hasError ? (
                  <AlertCircle className="w-4 h-4 text-white" strokeWidth={2} />
                ) : isPlaying ? (
                  <SoundBars className="text-white" />
                ) : (
                  <Music2 className="w-4 h-4 text-white" strokeWidth={1.8} />
                )}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-xs font-semibold text-foreground leading-tight truncate">
                    {surahName}
                  </p>
                  {ayahNumber !== null && (
                    <span className="shrink-0 text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded-md leading-none">
                      {ayahNumber}/{totalAyahs}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate leading-tight">
                  {hasError ? "Playback error — tap to retry" : reciter.name}
                </p>
              </div>

              {/* Time */}
              <span className="shrink-0 text-[11px] font-mono text-muted-foreground tabular-nums">
                {formatPlayerTime(currentTime)}
              </span>
            </button>

            {/* Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <motion.button
                onClick={prevAyah}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Previous ayah"
              >
                <SkipBack className="w-3.5 h-3.5" strokeWidth={2} />
              </motion.button>

              <motion.button
                onClick={togglePlayPause}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                disabled={isLoading}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-all",
                  "gradient-primary text-white",
                  isLoading && "opacity-70"
                )}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4" strokeWidth={2.5} />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" strokeWidth={2.5} />
                )}
              </motion.button>

              <motion.button
                onClick={nextAyah}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Next ayah"
              >
                <SkipForward className="w-3.5 h-3.5" strokeWidth={2} />
              </motion.button>

              <motion.button
                onClick={stop}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ml-0.5"
                aria-label="Stop playback"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
