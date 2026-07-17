/**
 * WordStudySheet — Quranic Word Study bottom sheet.
 *
 * Unified data model: every word always renders the same 14-field layout.
 * If a field cannot be populated, a consistent "Not available" notice is shown
 * in-place rather than hiding the section entirely.
 *
 * Section order (per spec):
 *  1  Arabic word                 — hero
 *  2  Transliteration             — hero
 *  3  English meaning             — hero
 *  4  Urdu meaning                — pill
 *  5  Root letters                — pill
 *  6  Lemma                       — pill
 *  7  Morphological information   — expandable section
 *  8  Lexical explanation         — expandable section
 *  9  Root meaning                — pill
 * 10  Exact occurrence count      — badge in occurrences header
 * 11  Root occurrence count       — note inside occurrences section
 * 12  Verse list                  — occurrences section body
 * 13  Navigation                  — occurrence card tap
 * 14  Tafseer                     — expandable section
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
  Hash,
  Info,
  Shapes,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchVerseWords,
  fetchWordOccurrences,
  fetchTafseer,
  lookupLexiconFull,
  deriveMorphNote,
  stripDiacritics,
  WORD_AUDIO_BASE,
  type VerseWord,
  type WordOccurrence,
  type TafseerResult,
  type LexiconMatch,
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
  unavailable = false,
}: {
  label: string;
  value: string;
  color?: "default" | "emerald" | "amber" | "sky" | "violet";
  unavailable?: boolean;
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
      <span className={cn(
        "text-xs font-semibold leading-snug",
        unavailable && "text-muted-foreground/50 italic font-normal"
      )}>
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
  // ── API word data ──────────────────────────────────────────────────────────
  const [wordData, setWordData]     = useState<VerseWord | null>(null);
  const [loadingWord, setLoadingWord] = useState(false);
  const [wordError, setWordError]   = useState(false);

  // ── Occurrences ────────────────────────────────────────────────────────────
  // Pre-fetched when trigger changes so count badge always shows immediately.
  const [occurrences, setOccurrences] = useState<WordOccurrence[] | null>(null);
  const [occTotal, setOccTotal]       = useState<number | null>(null);
  const [loadingOcc, setLoadingOcc]   = useState(false);
  const [occError, setOccError]       = useState(false);

  // ── Tafseer ────────────────────────────────────────────────────────────────
  const [tafseer, setTafseer]           = useState<TafseerResult | null>(null);
  const [loadingTafseer, setLoadingTafseer] = useState(false);
  const [tafseerError, setTafseerError] = useState(false);

  const { isBookmarked, toggleBookmark } = useWordBookmarks();

  const open = trigger !== null;

  // ── Lexicon lookup (synchronous) ───────────────────────────────────────────
  const lexMatch: LexiconMatch | undefined =
    trigger ? lookupLexiconFull(trigger.wordText) : undefined;
  const lexEntry = lexMatch?.entry;
  const morphNote =
    lexMatch
      ? deriveMorphNote(lexMatch.matchType, lexEntry?.pos ?? "")
      : null;

  // ── Fetch API word data when trigger changes ───────────────────────────────
  useEffect(() => {
    if (!trigger) {
      setWordData(null);
      setOccurrences(null);
      setOccTotal(null);
      setTafseer(null);
      return;
    }

    // Word-by-word data
    setWordData(null);
    setWordError(false);
    setLoadingWord(true);

    fetchVerseWords(trigger.surahNum, trigger.ayahNum)
      .then((words) => {
        const realWords = words.filter((w) => w.charType === "word");
        // Primary: match by stripped Arabic text (robust against index drift)
        const targetStripped = stripDiacritics(trigger.wordText);
        const match =
          realWords.find((w) => stripDiacritics(w.textUthmani) === targetStripped) ??
          realWords[trigger.wordIndex] ??
          null;
        setWordData(match);
        setLoadingWord(false);
      })
      .catch(() => { setWordError(true); setLoadingWord(false); });
  }, [trigger?.surahNum, trigger?.ayahNum, trigger?.wordIndex, trigger?.wordText]);

  // ── Pre-fetch occurrences (not lazy) so count badge is always immediate ────
  useEffect(() => {
    if (!trigger) { setOccurrences(null); setOccTotal(null); return; }
    setOccurrences(null);
    setOccTotal(null);
    setOccError(false);
    setLoadingOcc(true);

    fetchWordOccurrences(trigger.wordText)
      .then((result) => {
        setOccurrences(result.occurrences);
        setOccTotal(result.total);
        setLoadingOcc(false);
      })
      .catch(() => { setOccError(true); setOccurrences([]); setOccTotal(0); setLoadingOcc(false); });
  }, [trigger?.wordText]);

  // ── Fetch tafseer (Ibn Kathir) when surah:ayah changes ────────────────────
  useEffect(() => {
    if (!trigger) { setTafseer(null); return; }
    setTafseer(null);
    setTafseerError(false);
    setLoadingTafseer(true);

    fetchTafseer(trigger.surahNum, trigger.ayahNum)
      .then((result) => { setTafseer(result); setLoadingTafseer(false); })
      .catch(() => { setTafseerError(true); setLoadingTafseer(false); });
  }, [trigger?.surahNum, trigger?.ayahNum]);

  // ── Derived display values ─────────────────────────────────────────────────
  const displayArabic   = wordData?.textUthmani ?? trigger?.wordText ?? "";
  const displayTranslit = wordData?.transliteration || null;
  const displayMeaning  = wordData?.translation || null;
  const audioUrl        = wordData?.audioUrl ?? "";

  // ── Bookmark ───────────────────────────────────────────────────────────────
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
      wordPosition: trigger.wordIndex + 1,
    });
  }, [trigger, bookmarkId, displayArabic, displayTranslit, displayMeaning, toggleBookmark]);

  // ── Share text ─────────────────────────────────────────────────────────────
  const getShareText = useCallback(() => {
    const lines = [
      displayArabic,
      displayTranslit ? `(${displayTranslit})` : "",
      displayMeaning  ? `"${displayMeaning}"` : "",
      lexEntry?.root  ? `Root: ${lexEntry.root} — ${lexEntry.rootMeaning}` : "",
      lexEntry?.explanation ? `\n${lexEntry.explanation}` : "",
      `\nQuran ${trigger?.surahNum}:${trigger?.ayahNum}`,
      "Shared from Quran Al-Falah · قرآن الفلاح",
    ];
    return lines.filter(Boolean).join("\n");
  }, [displayArabic, displayTranslit, displayMeaning, lexEntry, trigger]);

  const { copied, handleCopy, handleShare } = useCopyShare(getShareText);
  const { play, playing, loading: audioLoading } = useWordAudio(audioUrl);

  const sheetRef = useRef<HTMLDivElement>(null);

  // ── Body scroll lock ───────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ── Occurrence badge ───────────────────────────────────────────────────────
  const occBadge = loadingOcc ? (
    <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded-full text-[10px]">
      <Loader2 className="w-3 h-3 inline animate-spin" strokeWidth={2} />
    </span>
  ) : occTotal !== null && occTotal > 0 ? (
    <span className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-[10px] font-bold">
      {occTotal}
    </span>
  ) : null;

  // ── Tafseer content ────────────────────────────────────────────────────────
  const tafseerText =
    tafseer
      ? (tafseer.isHtml ? stripHtml(tafseer.text) : tafseer.text)
      : null;

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

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-5 py-4 space-y-4 pb-10">

                {/* ── §1-3: Word hero — Arabic · Transliteration · English meaning ── */}
                <div className="rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/6 to-transparent p-5 text-center">
                  {/* §1 Arabic word */}
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
                      <span className="text-xs">Word data unavailable — showing local data only</span>
                    </div>
                  )}

                  {/* §2 Transliteration */}
                  {!loadingWord && (
                    displayTranslit
                      ? <p className="text-sm italic text-muted-foreground mb-1.5">{displayTranslit}</p>
                      : !wordError && (
                          <p className="text-xs italic text-muted-foreground/50 mb-1.5">
                            Transliteration not available
                          </p>
                        )
                  )}

                  {/* §3 English meaning */}
                  {!loadingWord && (
                    displayMeaning
                      ? <p className="text-sm font-medium text-foreground/80">"{displayMeaning}"</p>
                      : !wordError && (
                          <p className="text-xs italic text-muted-foreground/50">
                            English meaning not available for this word token
                          </p>
                        )
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
                    aria-label="Play word pronunciation"
                  >
                    {audioLoading
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                      : <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />
                    }
                    {playing ? "Playing…" : "Pronounce"}
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-medium transition-colors duration-200"
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
                  >
                    {bookmarked
                      ? <BookmarkCheck className="w-3.5 h-3.5" strokeWidth={2} />
                      : <Bookmark className="w-3.5 h-3.5" strokeWidth={2} />
                    }
                    {bookmarked ? "Saved" : "Save"}
                  </button>
                </div>

                {/* ── §4-6,9: Lexical info pills — always rendered ── */}
                {/* §4 Urdu meaning · §5 Root letters · §6 Lemma · §9 Root meaning */}
                <div className="grid grid-cols-2 gap-2">
                  <Pill
                    label="Arabic Root"
                    value={lexEntry?.root || "—"}
                    color="emerald"
                    unavailable={!lexEntry?.root}
                  />
                  <Pill
                    label="Root Meaning"
                    value={lexEntry?.rootMeaning || "—"}
                    color="amber"
                    unavailable={!lexEntry?.rootMeaning}
                  />
                  <Pill
                    label="Lemma (Citation Form)"
                    value={lexEntry?.arabic || "—"}
                    color="sky"
                    unavailable={!lexEntry?.arabic}
                  />
                  <Pill
                    label="Part of Speech"
                    value={lexEntry?.pos || "—"}
                    color="sky"
                    unavailable={!lexEntry?.pos}
                  />
                  {/* Urdu full-width */}
                  <div className="col-span-2">
                    <Pill
                      label="Urdu Meaning"
                      value={lexEntry?.urdu || "—"}
                      color="violet"
                      unavailable={!lexEntry?.urdu}
                    />
                  </div>
                </div>

                {/* Lexicon coverage note when word is not indexed */}
                {!lexEntry && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-border/40 bg-secondary/20 px-3 py-2.5">
                    <Info className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 mt-0.5" strokeWidth={1.8} />
                    <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                      Root, lemma, and Urdu meaning are sourced from a curated dictionary of ~90 high-frequency
                      Quranic words. This word's inflected form is not yet indexed — conjugated verbs, broken
                      plurals, and rare forms may not have an entry.
                    </p>
                  </div>
                )}

                {/* ── §7: Morphological information — always shown ── */}
                <ExpandableSection icon={Shapes} title="Morphological Information">
                  {morphNote ? (
                    <>
                      <div className="rounded-xl bg-secondary/30 border border-border/40 px-4 py-3">
                        <p className="text-sm text-foreground/85 leading-relaxed">{morphNote}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 mt-1">
                        <div className="rounded-lg bg-secondary/40 px-2 py-1.5 text-center">
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-bold mb-0.5">Match</p>
                          <p className="text-[10px] font-medium text-foreground/80 leading-tight break-all">
                            {lexMatch?.matchType.replace(/\+/g, " + ") ?? "—"}
                          </p>
                        </div>
                        <div className="rounded-lg bg-secondary/40 px-2 py-1.5 text-center">
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-bold mb-0.5">POS</p>
                          <p className="text-[10px] font-medium text-foreground/80 leading-tight">{lexEntry?.pos ?? "—"}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/40 px-2 py-1.5 text-center">
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-bold mb-0.5">Lemma</p>
                          <p className="text-[10px] font-medium text-foreground/80 leading-tight font-arabic" dir="rtl">
                            {lexEntry?.arabic ?? "—"}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <UnavailableNotice message="Morphological analysis is not available for this word. The word's inflected form is not indexed in the current morphology dataset. Full morphological breakdown (case, voice, person, number) requires a complete Arabic corpus database." />
                  )}
                </ExpandableSection>

                {/* ── §8: Lexical explanation — always shown ── */}
                <ExpandableSection icon={BookOpen} title="Lexical Explanation" defaultOpen={!!lexEntry?.explanation}>
                  {lexEntry?.explanation ? (
                    <p className="text-sm text-foreground/85 leading-relaxed">
                      {lexEntry.explanation}
                    </p>
                  ) : (
                    <UnavailableNotice message="No lexical explanation is available for this word. The word may be a grammatical particle, a verb conjugation, or a form not yet covered by the current dictionary." />
                  )}
                </ExpandableSection>

                {/* ── §10-13: Occurrences in the Quran — pre-fetched, always shown ── */}
                <ExpandableSection
                  icon={Hash}
                  title="Occurrences in the Quran"
                  badge={occBadge}
                >
                  {/* §10 Exact occurrence count */}
                  {!loadingOcc && occTotal !== null && occTotal > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      This exact word form appears{" "}
                      <span className="font-semibold text-primary">{occTotal}</span>{" "}
                      time{occTotal !== 1 ? "s" : ""} in the Quran. Tap any verse to navigate there.
                    </p>
                  )}

                  {/* §11 Root occurrence count */}
                  <div className="rounded-xl border border-border/40 bg-secondary/20 px-3 py-2.5">
                    <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                      <span className="font-semibold text-foreground/60">Root occurrences: </span>
                      Not available from current dataset. Root-level frequency requires a
                      morphological corpus database (e.g. Quranic Arabic Corpus).
                    </p>
                  </div>

                  {/* Loading */}
                  {loadingOcc && (
                    <div className="flex items-center gap-2 text-muted-foreground py-2 justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                      <span className="text-xs">Searching the Quran…</span>
                    </div>
                  )}

                  {/* Error */}
                  {occError && !loadingOcc && (
                    <UnavailableNotice message="Could not fetch occurrence data. Please check your internet connection." />
                  )}

                  {/* §12-13 Verse list — always Quran verses (AlQuran.cloud is Quran-only) */}
                  {!loadingOcc && !occError && occurrences !== null && (
                    occurrences.length === 0
                      ? <UnavailableNotice message="No occurrences found for this word form. The search matches exact Arabic script — diacritics are stripped before searching." />
                      : <div className="space-y-2.5">
                          {occurrences.map((occ, i) => (
                            <OccurrenceCard
                              key={`${occ.surahNum}:${occ.ayahNum}:${i}`}
                              occ={occ}
                              idx={i}
                              onNavigate={onNavigate}
                              onClose={onClose}
                            />
                          ))}
                        </div>
                  )}
                </ExpandableSection>

                {/* ── §14: Tafseer (Ibn Kathir) — always shown ── */}
                <ExpandableSection icon={ScrollText} title={`Tafseer — ${tafseer?.name ?? "Ibn Kathir"}`}>
                  {loadingTafseer && (
                    <div className="flex items-center gap-2 text-muted-foreground py-2 justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                      <span className="text-xs">Loading tafseer…</span>
                    </div>
                  )}
                  {!loadingTafseer && tafseerError && (
                    <UnavailableNotice message="Could not load tafseer. Please check your internet connection and try again." />
                  )}
                  {!loadingTafseer && !tafseerError && tafseerText ? (
                    <>
                      <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                        {tafseerText}
                      </p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1">
                        Source: {tafseer?.name} · via Quran.com
                      </p>
                    </>
                  ) : !loadingTafseer && !tafseerError && (
                    <UnavailableNotice message="Tafseer is not available for this verse. The dataset may not include an entry for this particular ayah." />
                  )}
                </ExpandableSection>

                {/* ── Attribution ── */}
                <p className="text-[10px] text-muted-foreground/50 text-center leading-relaxed">
                  Word data · Quran.com v4 API · Audio · QuranCDN
                  {lexEntry && " · Lexical data · Quran Al-Falah dictionary"}
                  {" · Occurrences · AlQuran.cloud · Tafseer · Quran.com"}
                </p>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
