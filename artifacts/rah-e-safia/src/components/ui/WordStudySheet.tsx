/**
 * WordStudySheet
 *
 * A full-featured bottom sheet that appears when a user long-presses any
 * Arabic word in the Quran reader. Shows:
 *  • Arabic word + transliteration + English meaning
 *  • Root letters, POS, and lexical explanation (from curated lexicon)
 *  • Occurrence count + list of every verse containing the word
 *  • Per-word pronunciation audio (Quran.com word-by-word audio)
 *  • Bookmark / Copy / Share actions
 */

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  memo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  X,
  Copy,
  Share2,
  Check,
  Bookmark,
  BookmarkCheck,
  Volume2,
  ChevronDown,
  ChevronRight,
  Search,
  Loader2,
  AlertCircle,
  BookOpen,
  Info,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchVerseWords,
  fetchWordOccurrences,
  lookupLexicon,
  WORD_AUDIO_BASE,
  type VerseWord,
  type WordOccurrence,
} from "@/lib/word-study-api";
import { useWordBookmarks } from "@/lib/word-bookmarks";
import { surahs } from "@/lib/quran-data";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface WordStudyTrigger {
  /** Raw Arabic token as it appears in ayah.arabic */
  wordText: string;
  /** 0-based index in the space-split word array */
  wordIndex: number;
  surahNum: number;
  surahName: string;
  ayahNum: number;
}

interface Props {
  trigger: WordStudyTrigger | null;
  onClose: () => void;
  /** Navigate to a different verse when the user taps an occurrence */
  onNavigate: (surahNum: number, ayahNum: number) => void;
}

// ─── Pill badge ────────────────────────────────────────────────────────────────

function Pill({
  label,
  value,
  color = "default",
}: {
  label: string;
  value: string;
  color?: "default" | "emerald" | "amber" | "sky" | "violet";
}) {
  const colors = {
    default: "bg-secondary/70 text-foreground/80",
    emerald: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    amber: "bg-amber-500/12 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    sky: "bg-sky-500/12 text-sky-700 dark:text-sky-400 border border-sky-500/20",
    violet: "bg-violet-500/12 text-violet-700 dark:text-violet-400 border border-violet-500/20",
  };
  return (
    <div className={cn("rounded-xl px-3 py-2 flex flex-col gap-0.5", colors[color])}>
      <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">{label}</span>
      <span className="text-xs font-semibold leading-snug">{value}</span>
    </div>
  );
}

// ─── Occurrence card ───────────────────────────────────────────────────────────

const OccurrenceCard = memo(function OccurrenceCard({
  occ,
  idx,
  onNavigate,
  onClose,
}: {
  occ: WordOccurrence;
  idx: number;
  onNavigate: (surah: number, ayah: number) => void;
  onClose: () => void;
}) {
  const handleClick = useCallback(() => {
    onNavigate(occ.surahNum, occ.ayahNum);
    onClose();
  }, [occ, onNavigate, onClose]);

  const surahInfo = surahs.find((s) => s.number === occ.surahNum);

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.025 } }}
      onClick={handleClick}
      className="w-full text-left rounded-xl border border-border/50 bg-card hover:bg-accent transition-colors duration-150 p-3"
    >
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 mt-0.5">
          <BookOpen className="w-3.5 h-3.5 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-xs font-semibold text-foreground">
              {surahInfo?.name ?? occ.surahName}
            </span>
            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
              {occ.surahNum}:{occ.ayahNum}
            </span>
          </div>
          <p
            className="font-arabic text-sm text-foreground/75 leading-[1.85] text-right line-clamp-2"
            dir="rtl"
            lang="ar"
          >
            {occ.arabic}
          </p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-2" strokeWidth={2} />
      </div>
    </motion.button>
  );
});

// ─── Audio player hook ─────────────────────────────────────────────────────────

function useWordAudio(audioUrl: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const play = useCallback(() => {
    if (!audioUrl) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(WORD_AUDIO_BASE + audioUrl);
    audioRef.current = audio;
    setLoading(true);
    audio.oncanplay = () => {
      setLoading(false);
      setPlaying(true);
      audio.play().catch(() => setPlaying(false));
    };
    audio.onended = () => setPlaying(false);
    audio.onerror = () => {
      setLoading(false);
      setPlaying(false);
    };
    audio.load();
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return { play, playing, loading };
}

// ─── Copy / share helper ───────────────────────────────────────────────────────

function useCopyShare(getText: () => string) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }, [getText]);
  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) await navigator.share({ text: getText() });
      else await navigator.clipboard.writeText(getText());
    } catch { /* ignore */ }
  }, [getText]);
  return { copied, handleCopy, handleShare };
}

// ─── Main sheet ────────────────────────────────────────────────────────────────

export default function WordStudySheet({ trigger, onClose, onNavigate }: Props) {
  const [wordData, setWordData] = useState<VerseWord | null>(null);
  const [loadingWord, setLoadingWord] = useState(false);
  const [wordError, setWordError] = useState(false);

  const [occurrences, setOccurrences] = useState<WordOccurrence[] | null>(null);
  const [occTotal, setOccTotal] = useState(0);
  const [loadingOcc, setLoadingOcc] = useState(false);
  const [showOccurrences, setShowOccurrences] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);

  const { isBookmarked, toggleBookmark } = useWordBookmarks();

  const open = trigger !== null;
  const lexEntry = trigger ? lookupLexicon(trigger.wordText) : undefined;

  // Fetch word-level data when trigger changes
  useEffect(() => {
    if (!trigger) {
      setWordData(null);
      setOccurrences(null);
      setOccTotal(0);
      setShowOccurrences(false);
      return;
    }

    setWordData(null);
    setWordError(false);
    setLoadingWord(true);
    setOccurrences(null);
    setOccTotal(0);
    setShowOccurrences(false);

    fetchVerseWords(trigger.surahNum, trigger.ayahNum)
      .then((words) => {
        // Filter to actual words only (exclude end markers, pause signs, etc.)
        const realWords = words.filter((w) => w.charType === "word");
        // Match by position: trigger.wordIndex (0-based) → position 1-based in realWords
        const match = realWords[trigger.wordIndex] ?? null;
        setWordData(match);
        setLoadingWord(false);
      })
      .catch(() => {
        setWordError(true);
        setLoadingWord(false);
      });
  }, [trigger?.surahNum, trigger?.ayahNum, trigger?.wordIndex, trigger?.wordText]);

  // Lazy-load occurrences when section is expanded
  useEffect(() => {
    if (!showOccurrences || !trigger) return;
    if (occurrences !== null) return; // already loaded

    setLoadingOcc(true);
    fetchWordOccurrences(trigger.wordText)
      .then((result) => {
        setOccurrences(result.occurrences);
        setOccTotal(result.total);
        setLoadingOcc(false);
      })
      .catch(() => {
        setOccurrences([]);
        setLoadingOcc(false);
      });
  }, [showOccurrences, trigger?.wordText]);

  const displayArabic = wordData?.textUthmani ?? trigger?.wordText ?? "";
  const displayTranslit = wordData?.transliteration ?? "";
  const displayMeaning = wordData?.translation ?? "";
  const audioUrl = wordData?.audioUrl ?? "";

  const bookmarkId =
    trigger
      ? `${trigger.surahNum}:${trigger.ayahNum}:${trigger.wordIndex}`
      : "";
  const bookmarked = isBookmarked(bookmarkId);

  const handleBookmark = useCallback(() => {
    if (!trigger) return;
    toggleBookmark({
      id: bookmarkId,
      arabic: displayArabic,
      transliteration: displayTranslit,
      englishMeaning: displayMeaning,
      surahNum: trigger.surahNum,
      surahName: trigger.surahName,
      ayahNum: trigger.ayahNum,
      wordPosition: trigger.wordIndex + 1,
    });
  }, [trigger, bookmarkId, displayArabic, displayTranslit, displayMeaning, toggleBookmark]);

  const getShareText = useCallback(
    () =>
      `${displayArabic} — ${displayTranslit}\n"${displayMeaning}"\n\n${
        lexEntry ? `Root: ${lexEntry.root} (${lexEntry.rootMeaning})\n\n${lexEntry.explanation}\n\n` : ""
      }Quran ${trigger?.surahNum}:${trigger?.ayahNum}\nShared from Quran Al-Falah · قرآن الفلاح`,
    [displayArabic, displayTranslit, displayMeaning, lexEntry, trigger]
  );

  const { copied, handleCopy, handleShare } = useCopyShare(getShareText);
  const { play, playing, loading: audioLoading } = useWordAudio(audioUrl);

  const sheetRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll while sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && trigger && (
        <>
          {/* Backdrop */}
          <motion.div
            key="ws-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]"
          />

          {/* Sheet */}
          <motion.div
            key="ws-sheet"
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 350, mass: 0.8 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[88vh] flex flex-col rounded-t-3xl bg-card border-t border-border shadow-2xl overflow-hidden"
          >
            {/* Drag handle */}
            <div className="flex items-center justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
            </div>

            {/* Header bar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border/50 shrink-0">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <Search className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Quranic Word Study</p>
                  <p className="text-[10px] text-muted-foreground">
                    {trigger.surahName} {trigger.surahNum}:{trigger.ayahNum}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-secondary hover:bg-accent flex items-center justify-center shrink-0 transition-colors"
                aria-label="Close word study"
              >
                <X className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-5 py-4 space-y-5 pb-8">

                {/* ── Word hero ── */}
                <div className="rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/6 to-transparent p-5 text-center">
                  <p
                    className="font-arabic text-5xl text-foreground leading-[1.6] mb-2"
                    dir="rtl"
                    lang="ar"
                  >
                    {displayArabic}
                  </p>

                  {loadingWord && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mt-2">
                      <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                      <span className="text-xs">Loading word data…</span>
                    </div>
                  )}

                  {!loadingWord && wordError && (
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground mt-2">
                      <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
                      <span className="text-xs">Could not fetch word data — showing local data</span>
                    </div>
                  )}

                  {!loadingWord && displayTranslit && (
                    <p className="text-sm italic text-muted-foreground mb-1.5">{displayTranslit}</p>
                  )}
                  {!loadingWord && displayMeaning && (
                    <p className="text-sm font-medium text-foreground/80">"{displayMeaning}"</p>
                  )}
                </div>

                {/* ── Action bar ── */}
                <div className="flex flex-wrap gap-2">
                  {/* Audio */}
                  <button
                    onClick={play}
                    disabled={!audioUrl}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-200",
                      audioUrl
                        ? playing || audioLoading
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-primary/12 hover:bg-primary/20 text-primary"
                        : "bg-secondary/50 text-muted-foreground/50 cursor-not-allowed"
                    )}
                    title={audioUrl ? "Play pronunciation" : "Audio coming soon"}
                    aria-label="Play word pronunciation"
                  >
                    {audioLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />
                    )}
                    {playing ? "Playing…" : "Pronounce"}
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-medium transition-colors duration-200"
                    aria-label="Copy word and meaning"
                  >
                    {copied
                      ? <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                      : <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                    }
                    {copied ? "Copied!" : "Copy"}
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-medium transition-colors duration-200"
                    aria-label="Share word"
                  >
                    <Share2 className="w-3.5 h-3.5" strokeWidth={2} />
                    Share
                  </button>

                  <button
                    onClick={handleBookmark}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-200",
                      bookmarked
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-secondary/80 hover:bg-secondary text-foreground"
                    )}
                    aria-label={bookmarked ? "Remove bookmark" : "Bookmark this word"}
                  >
                    {bookmarked
                      ? <BookmarkCheck className="w-3.5 h-3.5" strokeWidth={2} />
                      : <Bookmark className="w-3.5 h-3.5" strokeWidth={2} />
                    }
                    {bookmarked ? "Saved" : "Save"}
                  </button>
                </div>

                {/* ── Lexical info pills (from curated lexicon) ── */}
                {lexEntry && (
                  <div className="grid grid-cols-2 gap-2">
                    <Pill label="Arabic Root" value={lexEntry.root || "—"} color="emerald" />
                    <Pill label="Root Meaning" value={lexEntry.rootMeaning || "—"} color="amber" />
                    <Pill label="Part of Speech" value={lexEntry.pos} color="sky" />
                    <Pill label="Urdu Meaning" value={lexEntry.urdu} color="violet" />
                  </div>
                )}

                {/* If no lexicon entry, show a clear, friendly message */}
                {!lexEntry && !loadingWord && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-secondary/30 p-3">
                    <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" strokeWidth={1.8} />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground/70">
                        Root &amp; morphology not indexed for this form
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Conjugated verbs, broken plurals, and rare word forms may not have a
                        direct dictionary entry. The translation above comes from Quran.com
                        word-by-word data. Tap <span className="font-medium">Occurrences</span>{" "}
                        below to find every verse containing this word.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Explanation section ── */}
                {lexEntry?.explanation && (
                  <div className="rounded-2xl border border-border/50 overflow-hidden">
                    <button
                      onClick={() => setShowExplanation((s) => !s)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-sm font-semibold text-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                        Lexical Explanation
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform duration-200",
                          showExplanation && "rotate-180"
                        )}
                        strokeWidth={2}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {showExplanation && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1, transition: { duration: 0.22 } }}
                          exit={{ height: 0, opacity: 0, transition: { duration: 0.16 } }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 py-4">
                            <p className="text-sm text-foreground/85 leading-relaxed">
                              {lexEntry.explanation}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* ── Occurrences section ── */}
                <div className="rounded-2xl border border-border/50 overflow-hidden">
                  <button
                    onClick={() => setShowOccurrences((s) => !s)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-sm font-semibold text-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                      Occurrences in the Quran
                      {occTotal > 0 && (
                        <span className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-[10px] font-bold">
                          {occTotal}
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform duration-200",
                        showOccurrences && "rotate-180"
                      )}
                      strokeWidth={2}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {showOccurrences && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1, transition: { duration: 0.25 } }}
                        exit={{ height: 0, opacity: 0, transition: { duration: 0.18 } }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 py-3 space-y-2.5">
                          {loadingOcc && (
                            <div className="flex items-center gap-2 text-muted-foreground py-3 justify-center">
                              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                              <span className="text-xs">Searching the Quran…</span>
                            </div>
                          )}
                          {!loadingOcc && occurrences?.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-3">
                              No occurrences found. Try searching manually.
                            </p>
                          )}
                          {!loadingOcc && occurrences && occurrences.length > 0 && (
                            <>
                              <p className="text-[10px] text-muted-foreground mb-1">
                                Found {occTotal} occurrence{occTotal !== 1 ? "s" : ""} — tap any verse to navigate there.
                              </p>
                              {occurrences.map((occ, i) => (
                                <OccurrenceCard
                                  key={`${occ.surahNum}:${occ.ayahNum}:${i}`}
                                  occ={occ}
                                  idx={i}
                                  onNavigate={onNavigate}
                                  onClose={onClose}
                                />
                              ))}
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Attribution ── */}
                <p className="text-[10px] text-muted-foreground/50 text-center leading-relaxed">
                  Word-by-word data from Quran.com · Audio via QuranCDN
                  {lexEntry && " · Lexical data from Quran Al-Falah dictionary"}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
