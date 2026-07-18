/**
 * WordStudySheet — Quranic Word Study bottom sheet.
 *
 * Data layer powered by the Quranic Arabic Corpus (QAC) v0.4:
 *   - Morphological data: root, lemma, POS, gender, number, case, aspect, etc.
 *   - Root occurrence index: exact token count and all positions in the Quran.
 *
 * Attribution (required by QAC license):
 *   Quranic Arabic Corpus · corpus.quran.com · © 2011 Kais Dukes, GNU GPL
 *
 * Section order:
 *  1  Arabic word + transliteration + English meaning  — hero
 *  2  Root · Lemma · POS pills
 *  3  Morphological analysis                           — expandable
 *  4  Lexical explanation (from Quran.com gloss)       — expandable
 *  5  Occurrences (root-based, exact from corpus)      — expandable
 *  6  Tafseer (Ibn Kathir)                             — expandable
 */

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  memo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Shapes,
  ScrollText,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchVerseWords,
  fetchTafseer,
  lookupWordMorphology,
  lookupRootOccurrences,
  formatMorphology,
  stripDiacritics,
  WORD_AUDIO_BASE,
  POS_LABELS,
  type VerseWord,
  type TafseerResult,
  type QACEntry,
  type QACRootEntry,
} from "@/lib/word-study-api";
import { useWordBookmarks } from "@/lib/word-bookmarks";
import { surahs } from "@/lib/quran-data";
import { lookupRootMeaning } from "@/lib/qac-root-meanings";

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
  unavailable = false,
  arabicValue = false,
}: {
  label: string;
  value: string;
  color?: "default" | "emerald" | "amber" | "sky" | "violet";
  unavailable?: boolean;
  arabicValue?: boolean;
}) {
  const colors = {
    default: "bg-secondary/70 text-foreground/80",
    emerald: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    amber:   "bg-amber-500/12 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    sky:     "bg-sky-500/12 text-sky-700 dark:text-sky-400 border border-sky-500/20",
    violet:  "bg-violet-500/12 text-violet-700 dark:text-violet-400 border border-violet-500/20",
  };
  return (
    <div className={cn("rounded-xl px-3 py-2 flex flex-col gap-0.5", colors[color])}>
      <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">{label}</span>
      <span
        className={cn(
          "text-xs font-semibold leading-snug",
          unavailable && "text-muted-foreground/50 italic font-normal",
          arabicValue && !unavailable && "font-arabic text-base leading-normal"
        )}
        dir={arabicValue ? "rtl" : undefined}
        lang={arabicValue ? "ar" : undefined}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Unavailable notice ────────────────────────────────────────────────────────

function UnavailableNotice({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 py-2 px-1">
      <Info className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 mt-0.5" strokeWidth={1.8} />
      <p className="text-xs text-muted-foreground/60 leading-relaxed italic">{message}</p>
    </div>
  );
}

// ─── Expandable section ────────────────────────────────────────────────────────

function ExpandableSection({
  icon: Icon,
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  icon: React.ElementType;
  title: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border/50 overflow-hidden">
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-sm font-semibold text-foreground"
      >
        <span className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
          {title}
          {badge}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
          strokeWidth={2}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1, transition: { duration: 0.22 } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.16 } }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Occurrence card (QAC-based) ───────────────────────────────────────────────
// Receives a [surahNum, ayahNum, wordPos] tuple from the root index.
// Lazily fetches the verse words when the card scrolls into view and renders
// a highlighted Arabic snippet showing the target word in context.

const OccurrenceCard = memo(function OccurrenceCard({
  pos,
  idx,
  onNavigate,
  onClose,
}: {
  pos: [number, number, number];
  idx: number;
  onNavigate: (surah: number, ayah: number) => void;
  onClose: () => void;
}) {
  const [surahNum, ayahNum, wordPos] = pos;
  const cardRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const [verseWords, setVerseWords] = useState<VerseWord[] | null>(null);

  // Trigger fetch only when card scrolls into view
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    fetchVerseWords(surahNum, ayahNum)
      .then((words) => { if (!cancelled) setVerseWords(words); })
      .catch(() => { /* snippet is non-critical; card still works without it */ });
    return () => { cancelled = true; };
  }, [visible, surahNum, ayahNum]);

  const handleClick = useCallback(() => {
    onNavigate(surahNum, ayahNum);
    onClose();
  }, [surahNum, ayahNum, onNavigate, onClose]);

  const surahInfo = surahs.find((s) => s.number === surahNum);

  // Build the Arabic snippet: only "word" tokens, highlight the one at wordPos
  const realWords = verseWords?.filter((w) => w.charType === "word") ?? null;

  return (
    <motion.button
      ref={cardRef}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.025 } }}
      onClick={handleClick}
      className="w-full text-left rounded-xl border border-border/50 bg-card hover:bg-accent transition-colors duration-150 p-3"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <BookOpen className="w-3.5 h-3.5 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-foreground">
              {surahInfo?.name ?? `Surah ${surahNum}`}
            </span>
            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
              {surahNum}:{ayahNum}
            </span>
          </div>
          {surahInfo && (
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              {surahInfo.arabicName}
            </p>
          )}
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
      </div>

      {/* Arabic verse snippet — shown once words are loaded */}
      {realWords && realWords.length > 0 && (
        <p
          className="mt-2 text-right font-arabic text-sm leading-[1.9] text-foreground/75 line-clamp-2"
          dir="rtl"
          lang="ar"
        >
          {realWords.map((w) => {
            const isTarget = w.position === wordPos;
            return (
              <span
                key={w.id}
                className={cn(
                  "mx-[1px]",
                  isTarget
                    ? "text-primary font-bold underline decoration-primary/50 decoration-dotted underline-offset-[3px]"
                    : "text-foreground/70"
                )}
              >
                {w.textUthmani}
              </span>
            );
          })}
        </p>
      )}
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
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const audio = new Audio(WORD_AUDIO_BASE + audioUrl);
    audioRef.current = audio;
    setLoading(true);
    audio.oncanplay = () => { setLoading(false); setPlaying(true); audio.play().catch(() => setPlaying(false)); };
    audio.onended = () => setPlaying(false);
    audio.onerror = () => { setLoading(false); setPlaying(false); };
    audio.load();
  }, [audioUrl]);

  useEffect(() => { return () => { audioRef.current?.pause(); }; }, []);
  return { play, playing, loading };
}

// ─── Copy / share helper ───────────────────────────────────────────────────────

function useCopyShare(getText: () => string) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try { await navigator.clipboard.writeText(getText()); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { /* ignore */ }
  }, [getText]);
  const handleShare = useCallback(async () => {
    try { if (navigator.share) await navigator.share({ text: getText() }); else await navigator.clipboard.writeText(getText()); }
    catch { /* ignore */ }
  }, [getText]);
  return { copied, handleCopy, handleShare };
}

// ─── Strip HTML helper ─────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Main sheet ────────────────────────────────────────────────────────────────

export default function WordStudySheet({ trigger, onClose, onNavigate }: Props) {
  // ── Quran.com word data (English gloss + audio) ─────────────────────────────
  const [wordData, setWordData]       = useState<VerseWord | null>(null);
  const [loadingWord, setLoadingWord] = useState(false);
  const [wordError, setWordError]     = useState(false);

  // ── Canonical 1-based word position (from Quran.com match) ─────────────────
  // Kept in state so the bookmark handler can record the corpus-aligned position
  // rather than the raw rendered wordIndex, which diverges for basmala-stripped
  // first ayahs.
  const [canonicalPos, setCanonicalPos] = useState<number>(1);

  // ── QAC morphology data ─────────────────────────────────────────────────────
  const [qacEntry, setQacEntry]       = useState<QACEntry | null>(null);
  const [qacLoading, setQacLoading]   = useState(false);
  const [qacError, setQacError]       = useState(false);

  // ── Root occurrences (QAC root index) ───────────────────────────────────────
  const [rootOccs, setRootOccs]       = useState<QACRootEntry | null>(null);
  const [occLoading, setOccLoading]   = useState(false);
  const [occError, setOccError]       = useState(false);

  // ── Tafseer ─────────────────────────────────────────────────────────────────
  const [tafseer, setTafseer]                 = useState<TafseerResult | null>(null);
  const [loadingTafseer, setLoadingTafseer]   = useState(false);
  const [tafseerError, setTafseerError]       = useState(false);

  const { isBookmarked, toggleBookmark } = useWordBookmarks();

  const open = trigger !== null;

  // ── Unified data-loading effect ──────────────────────────────────────────────
  // Step 1: fetch Quran.com word data to obtain the CANONICAL word position.
  //         This must precede QAC lookup because the app strips the basmala
  //         prefix from the first displayed ayah of each surah, which shifts
  //         rendered wordIndex values away from the corpus token positions.
  //         `wordData.position` is authoritative; `wordIndex + 1` is only a
  //         fallback used when the Quran.com fetch itself fails.
  // Step 2: look up QAC morphology with the canonical position.
  // Step 3: if a root is found, look up root occurrences.
  useEffect(() => {
    if (!trigger) {
      setWordData(null);
      setQacEntry(null);
      setRootOccs(null);
      setTafseer(null);
      return;
    }

    let cancelled = false;

    // Reset all data states synchronously
    setWordData(null);   setWordError(false);  setLoadingWord(true);
    setQacEntry(null);   setQacError(false);   setQacLoading(true);
    setRootOccs(null);   setOccError(false);   setOccLoading(true);

    const run = async () => {
      // ── Step 1: Quran.com word data + canonical position ─────────────────
      // Fallback: rendered index (0-based) → 1-based, used only if Step 1 fails
      let canonicalWordPos = trigger.wordIndex + 1;
      try {
        const words = await fetchVerseWords(trigger.surahNum, trigger.ayahNum);
        if (cancelled) return;
        const realWords = words.filter((w) => w.charType === "word");
        const targetStripped = stripDiacritics(trigger.wordText);
        const match =
          realWords.find((w) => stripDiacritics(w.textUthmani) === targetStripped) ??
          realWords[trigger.wordIndex] ??
          null;
        if (!cancelled) { setWordData(match); setLoadingWord(false); }
        // Canonical position from Quran.com/Tanzil tokenization — matches QAC index
        if (match?.position) {
          canonicalWordPos = match.position;
          if (!cancelled) setCanonicalPos(match.position);
        } else {
          if (!cancelled) setCanonicalPos(trigger.wordIndex + 1);
        }
      } catch {
        if (!cancelled) {
          setWordError(true);
          setLoadingWord(false);
          setCanonicalPos(trigger.wordIndex + 1);
        }
        // Non-fatal: QAC lookup continues with the index-based fallback
      }

      if (cancelled) return;

      // ── Step 2: QAC morphology ────────────────────────────────────────────
      try {
        const entry = await lookupWordMorphology(
          trigger.surahNum, trigger.ayahNum, canonicalWordPos,
        );
        if (cancelled) return;
        setQacEntry(entry);
        setQacLoading(false);

        // ── Step 3: Root occurrences ────────────────────────────────────────
        if (entry?.r) {
          try {
            const occs = await lookupRootOccurrences(entry.r);
            if (!cancelled) { setRootOccs(occs); setOccLoading(false); }
          } catch {
            if (!cancelled) { setOccError(true); setOccLoading(false); }
          }
        } else {
          if (!cancelled) setOccLoading(false);
        }
      } catch {
        // QAC data file failed to load (network error / deploy sandbox)
        if (!cancelled) {
          setQacError(true);  setQacLoading(false);
          setOccError(true);  setOccLoading(false);
        }
      }
    };

    run();
    return () => { cancelled = true; };
  }, [trigger?.surahNum, trigger?.ayahNum, trigger?.wordIndex, trigger?.wordText]);

  // ── Fetch tafseer when surah:ayah changes ────────────────────────────────────
  useEffect(() => {
    if (!trigger) { setTafseer(null); return; }
    setTafseer(null);
    setTafseerError(false);
    setLoadingTafseer(true);

    fetchTafseer(trigger.surahNum, trigger.ayahNum)
      .then((result) => { setTafseer(result); setLoadingTafseer(false); })
      .catch(() => { setTafseerError(true); setLoadingTafseer(false); });
  }, [trigger?.surahNum, trigger?.ayahNum]);

  // ── Derived display values ───────────────────────────────────────────────────
  const displayArabic   = wordData?.textUthmani ?? trigger?.wordText ?? "";
  const displayTranslit = wordData?.transliteration || null;
  const displayMeaning  = wordData?.translation || null;
  const audioUrl        = wordData?.audioUrl ?? "";

  // ── Bookmark ─────────────────────────────────────────────────────────────────
  const bookmarkId = trigger
    ? `${trigger.surahNum}:${trigger.ayahNum}:${trigger.wordIndex}`
    : "";
  const bookmarked = isBookmarked(bookmarkId);

  const handleBookmark = useCallback(() => {
    if (!trigger) return;
    toggleBookmark({
      id: bookmarkId,
      arabic: displayArabic,
      transliteration: displayTranslit ?? "",
      englishMeaning: displayMeaning ?? "",
      surahNum: trigger.surahNum,
      surahName: trigger.surahName,
      ayahNum: trigger.ayahNum,
      wordPosition: canonicalPos, // Quran.com-aligned position, not raw rendered index
    });
  }, [trigger, bookmarkId, displayArabic, displayTranslit, displayMeaning, canonicalPos, toggleBookmark]);

  // ── Share text ───────────────────────────────────────────────────────────────
  const getShareText = useCallback(() => {
    const lines = [
      displayArabic,
      displayTranslit ? `(${displayTranslit})` : "",
      displayMeaning  ? `"${displayMeaning}"` : "",
      qacEntry?.r     ? `Root: ${qacEntry.r}` : "",
      qacEntry        ? `Morphology: ${formatMorphology(qacEntry)}` : "",
      `\nQuran ${trigger?.surahNum}:${trigger?.ayahNum}`,
      "Shared from Rah-e-Safia · رہِ صافیہ",
    ];
    return lines.filter(Boolean).join("\n");
  }, [displayArabic, displayTranslit, displayMeaning, qacEntry, trigger]);

  const { copied, handleCopy, handleShare } = useCopyShare(getShareText);
  const { play, playing, loading: audioLoading } = useWordAudio(audioUrl);

  const sheetRef = useRef<HTMLDivElement>(null);

  // ── Body scroll lock ─────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ── Occurrence count badge ───────────────────────────────────────────────────
  const occBadge = occLoading ? (
    <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded-full text-[10px]">
      <Loader2 className="w-3 h-3 inline animate-spin" strokeWidth={2} />
    </span>
  ) : rootOccs !== null && rootOccs.c > 0 ? (
    <span className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-[10px] font-bold">
      {rootOccs.c}
    </span>
  ) : null;

  // ── Tafseer content ──────────────────────────────────────────────────────────
  const tafseerText = tafseer
    ? (tafseer.isHtml ? stripHtml(tafseer.text) : tafseer.text)
    : null;

  // ── QAC-derived values ───────────────────────────────────────────────────────
  const qacRoot        = qacEntry?.r ?? null;
  const qacLemma       = qacEntry?.l ?? null;
  const qacRootMeaning = lookupRootMeaning(qacRoot);
  // Use the full POS_LABELS map so all 30+ QAC part-of-speech tags render
  // as human-readable text rather than falling through to the raw code.
  const qacPOS         = qacEntry?.p
    ? (POS_LABELS[qacEntry.p] ?? qacEntry.p)
    : null;

  // Limit occurrence list to 50 items; keep the full count for the header
  const occPositions: Array<[number, number, number]> = rootOccs?.w.slice(0, 50) ?? [];
  const occTotalCount = rootOccs?.c ?? 0;

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
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Audio button */}
                {audioUrl && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={play}
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                      playing
                        ? "gradient-primary text-white"
                        : "bg-secondary hover:bg-accent text-muted-foreground"
                    )}
                    aria-label="Play word audio"
                  >
                    {audioLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />
                    )}
                  </motion.button>
                )}

                {/* Bookmark */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleBookmark}
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                    bookmarked ? "bg-amber-500/15 text-amber-500" : "bg-secondary hover:bg-accent text-muted-foreground"
                  )}
                  aria-label={bookmarked ? "Remove bookmark" : "Bookmark word"}
                >
                  {bookmarked
                    ? <BookmarkCheck className="w-4 h-4 fill-amber-400" strokeWidth={1.8} />
                    : <Bookmark className="w-4 h-4" strokeWidth={1.8} />
                  }
                </motion.button>

                {/* Copy */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopy}
                  className="w-8 h-8 rounded-xl bg-secondary hover:bg-accent flex items-center justify-center shrink-0 transition-colors text-muted-foreground"
                  aria-label="Copy word info"
                >
                  {copied
                    ? <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                    : <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                  }
                </motion.button>

                {/* Share */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShare}
                  className="w-8 h-8 rounded-xl bg-secondary hover:bg-accent flex items-center justify-center shrink-0 transition-colors text-muted-foreground"
                  aria-label="Share word info"
                >
                  <Share2 className="w-3.5 h-3.5" strokeWidth={2} />
                </motion.button>

                {/* Close */}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-secondary hover:bg-accent flex items-center justify-center shrink-0 transition-colors"
                  aria-label="Close word study"
                >
                  <X className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Scrollable content — extra bottom padding accounts for iOS home bar */}
            <div
              className="overflow-y-auto flex-1 px-4 py-4 space-y-4"
              style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
            >

              {/* ── Hero: Arabic word + transliteration + English ── */}
              <div className="text-center py-2">
                {loadingWord ? (
                  <div className="flex items-center justify-center gap-2 h-14">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" strokeWidth={2} />
                    <span className="text-sm text-muted-foreground">Loading…</span>
                  </div>
                ) : (
                  <>
                    <p
                      className="font-arabic text-4xl text-foreground leading-[1.6] mb-1"
                      dir="rtl"
                      lang="ar"
                    >
                      {displayArabic}
                    </p>
                    {displayTranslit && (
                      <p className="text-sm text-muted-foreground italic mb-1">{displayTranslit}</p>
                    )}
                    {displayMeaning && (
                      <p className="text-sm font-medium text-foreground/80">{displayMeaning}</p>
                    )}
                    {wordError && !displayArabic && (
                      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                        <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
                        Could not load word data
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── Pills: Root · Lemma · POS ── */}
              <div className="grid grid-cols-3 gap-2">
                {/* Root */}
                {qacLoading ? (
                  <div className="rounded-xl bg-secondary/70 px-3 py-2 flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">Root</span>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground mt-0.5" strokeWidth={2} />
                  </div>
                ) : (
                  <Pill
                    label="Root"
                    value={qacRoot ?? "—"}
                    color="emerald"
                    unavailable={!qacRoot}
                    arabicValue={!!qacRoot}
                  />
                )}

                {/* Lemma */}
                {qacLoading ? (
                  <div className="rounded-xl bg-secondary/70 px-3 py-2 flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">Lemma</span>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground mt-0.5" strokeWidth={2} />
                  </div>
                ) : (
                  <Pill
                    label="Lemma"
                    value={qacLemma ?? "—"}
                    color="sky"
                    unavailable={!qacLemma}
                    arabicValue={!!qacLemma}
                  />
                )}

                {/* Part of speech */}
                {qacLoading ? (
                  <div className="rounded-xl bg-secondary/70 px-3 py-2 flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">POS</span>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground mt-0.5" strokeWidth={2} />
                  </div>
                ) : (
                  <Pill
                    label="POS"
                    value={qacPOS ?? "Particle"}
                    color="violet"
                    unavailable={!qacEntry}
                  />
                )}
              </div>

              {/* ── Root meaning ── */}
              {!qacLoading && qacRoot && (
                <div className="rounded-2xl border border-border/50 bg-muted/20 px-4 py-3 space-y-1">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/60">
                    Root meaning
                  </p>
                  {qacRootMeaning ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground/85 leading-snug">
                        {qacRootMeaning.en}
                      </p>
                      {qacRootMeaning.ur && (
                        <p
                          className="text-xs text-muted-foreground font-arabic leading-relaxed"
                          dir="rtl"
                          lang="ur"
                        >
                          {qacRootMeaning.ur}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/60 italic">Not available</p>
                  )}
                </div>
              )}

              {/* ── Morphological analysis ── */}
              <ExpandableSection
                icon={Shapes}
                title="Morphology"
                defaultOpen
              >
                {qacLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                    Loading morphology…
                  </div>
                ) : qacError ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
                    Could not load morphological data. Check your connection.
                  </div>
                ) : qacEntry ? (
                  <div className="space-y-2">
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {formatMorphology(qacEntry)}
                    </p>
                    {/* Raw fields for the curious */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {qacEntry.p && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 font-mono">
                          {qacEntry.p}
                        </span>
                      )}
                      {qacEntry.g && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono">
                          {qacEntry.g === "M" ? "Masc" : "Fem"}
                        </span>
                      )}
                      {qacEntry.n && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono">
                          {qacEntry.n === "S" ? "Sing" : qacEntry.n === "D" ? "Dual" : "Plural"}
                        </span>
                      )}
                      {qacEntry.c && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
                          {qacEntry.c === "N" ? "Nom" : qacEntry.c === "A" ? "Acc" : "Gen"}
                        </span>
                      )}
                      {qacEntry.t && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                          {qacEntry.t}
                        </span>
                      )}
                      {qacEntry.ps && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                          {qacEntry.ps}
                        </span>
                      )}
                      {qacEntry.vn && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                          {qacEntry.vn === "A" ? "Active" : "Passive"}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <UnavailableNotice message="No morphological data found for this word token." />
                )}
              </ExpandableSection>

              {/* ── Lexical explanation (English gloss from Quran.com) ── */}
              <ExpandableSection icon={BookOpen} title="Meaning">
                {loadingWord ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                    Loading…
                  </div>
                ) : displayMeaning ? (
                  <div className="space-y-2">
                    <p className="text-sm text-foreground/80 leading-relaxed">{displayMeaning}</p>
                    {displayTranslit && (
                      <p className="text-xs text-muted-foreground italic">
                        Transliteration: {displayTranslit}
                      </p>
                    )}
                  </div>
                ) : (
                  <UnavailableNotice message="Word-level English gloss not available for this token." />
                )}
              </ExpandableSection>

              {/* ── Root occurrences ── */}
              <ExpandableSection
                icon={BookOpen}
                title={qacRoot ? `Root "${qacRoot}" occurrences` : "Occurrences"}
                badge={occBadge}
              >
                {occLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                    Looking up corpus…
                  </div>
                ) : occError ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
                    Could not load occurrence data.
                  </div>
                ) : !qacRoot ? (
                  <UnavailableNotice message="This word has no root (grammatical particle). Root occurrence counts apply to content words." />
                ) : rootOccs ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Root <span className="font-arabic text-sm text-foreground" dir="rtl" lang="ar">{qacRoot}</span>{" "}
                      appears <strong className="text-foreground">{occTotalCount.toLocaleString()}</strong> times across the Quran.
                      {occTotalCount > 50 && ` Showing first 50 of ${occTotalCount.toLocaleString()}.`}
                    </p>
                    <div className="space-y-2">
                      {occPositions.map((pos, i) => (
                        <OccurrenceCard
                          key={`${pos[0]}:${pos[1]}:${pos[2]}`}
                          pos={pos}
                          idx={i}
                          onNavigate={onNavigate}
                          onClose={onClose}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <UnavailableNotice message="No occurrences found in the root index." />
                )}
              </ExpandableSection>

              {/* ── Tafseer ── */}
              <ExpandableSection icon={ScrollText} title="Tafseer (Ibn Kathir)">
                {loadingTafseer ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                    Loading tafseer…
                  </div>
                ) : tafseerError ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
                    Tafseer unavailable. Check your connection.
                  </div>
                ) : tafseerText ? (
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                    {tafseerText}
                  </p>
                ) : (
                  <UnavailableNotice message="Tafseer not available for this verse." />
                )}
              </ExpandableSection>

              {/* ── QAC Attribution (required by license) ── */}
              <div className="flex items-center gap-1.5 px-1 pt-1 pb-2">
                <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/40 shrink-0" strokeWidth={1.8} />
                <p className="text-[9px] text-muted-foreground/40 leading-relaxed">
                  Morphological data: Quranic Arabic Corpus ·{" "}
                  <a
                    href="http://corpus.quran.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-muted-foreground/70 transition-colors"
                  >
                    corpus.quran.com
                  </a>{" "}
                  · © 2011 Kais Dukes, GNU GPL
                </p>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
