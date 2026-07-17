import { useState, useCallback, useRef, memo, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Bookmark,
  BookmarkCheck,
  Copy,
  Share2,
  Check,
  Volume2,
  ALargeSmall,
  Trash2,
  BookOpen,
  Sparkles,
  GraduationCap,
  Eye,
  EyeOff,
  RotateCcw,
  Star,
} from "lucide-react";
import { useSettings } from "@/lib/use-settings";
import {
  KALIMAS,
  SHAHADAH_DETAIL,
  TAWHEED_CARDS,
  KALIMA_COLOR_MAP,
  searchKalimas,
  type Kalima,
  type TawheedCard,
} from "@/lib/kalimas-data";
import {
  useKalimaBookmarks,
  loadProgress,
  saveProgress,
  type KalimaBookmark,
} from "@/lib/kalimas-bookmarks";

// ─── View state ───────────────────────────────────────────────────────────────

type View =
  | { kind: "home" }
  | { kind: "kalima"; index: number }
  | { kind: "shahadah" }
  | { kind: "tawheed" }
  | { kind: "learning" }
  | { kind: "favourites" };

// ─── Animation variants ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pageVariants: any = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.18 } },
};

// ─── Tooltip helper ────────────────────────────────────────────────────────────

function AudioButton({ className = "" }: { className?: string }) {
  const [tip, setTip] = useState(false);
  return (
    <div className="relative inline-flex">
      <button
        onClick={() => { setTip(true); setTimeout(() => setTip(false), 2200); }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/8 hover:bg-primary/14 text-primary text-xs font-medium transition-colors duration-200 ${className}`}
        aria-label="Audio recitation"
      >
        <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />
        Audio
      </button>
      <AnimatePresence>
        {tip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap px-2.5 py-1 rounded-lg bg-foreground text-background text-[10px] font-medium shadow-md z-20"
          >
            Audio coming soon
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Copy / Share helpers ──────────────────────────────────────────────────────

function useCopyShare(getText: () => string) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }, [getText]);
  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: getText() });
      } else {
        await navigator.clipboard.writeText(getText());
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch { /* ignore */ }
  }, [getText]);
  return { copied, shared, handleCopy, handleShare };
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── HOME — Kalima card ────────────────────────────────────────────────────────

/** Returns first `n` whitespace-delimited tokens of an Arabic string, with a trailing ellipsis if truncated. */
function arabicPreview(text: string, words = 6): string {
  const tokens = text.trim().split(/\s+/);
  if (tokens.length <= words) return text;
  return tokens.slice(0, words).join(" ") + "…";
}

const KalimaHomeCard = memo(function KalimaHomeCard({
  kalima,
  onSelect,
}: {
  kalima: Kalima;
  onSelect: (index: number) => void;
}) {
  const colors = KALIMA_COLOR_MAP[kalima.color];
  const handleClick = useCallback(() => onSelect(kalima.number - 1), [kalima.number, onSelect]);
  const preview = arabicPreview(kalima.arabic, 6);
  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left rounded-2xl border ${colors.border} ${colors.bg} p-4 transition-colors duration-200 hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-xl ${colors.number} flex items-center justify-center shrink-0 text-xs font-bold shadow-sm`}>
          {kalima.number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{kalima.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colors.badge} font-medium`}>
              {kalima.subtitle}
            </span>
          </div>
          <p className="text-[11px] font-arabic mt-1.5 text-foreground/70 text-right leading-snug" dir="rtl" lang="ar">
            {preview}
          </p>
        </div>
        <ChevronRight className={`w-4 h-4 ${colors.accent} shrink-0 mt-1`} strokeWidth={2} />
      </div>
    </motion.button>
  );
});

// ─── HOME — Featured action card ───────────────────────────────────────────────

function FeaturedCard({
  icon,
  iconBg,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left rounded-2xl border border-border/60 bg-card hover:shadow-md transition-all duration-200 p-4 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={2} />
    </motion.button>
  );
}

// ─── HOME view ─────────────────────────────────────────────────────────────────

function HomeView({
  onSelectKalima,
  onShahadah,
  onTawheed,
  onLearning,
  onFavourites,
  favouriteCount,
}: {
  onSelectKalima: (index: number) => void;
  onShahadah: () => void;
  onTawheed: () => void;
  onLearning: () => void;
  onFavourites: () => void;
  favouriteCount: number;
}) {
  const [tab, setTab] = useState<"library" | "favourites">("library");
  const { bookmarks } = useKalimaBookmarks();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchKalimas(query), [query]);

  return (
    <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">☪️</span>
          <h1 className="text-2xl font-bold text-foreground">Kalimas & Shahadah</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-11">الكلمات الإسلامية والشهادة</p>
        <p className="text-xs text-muted-foreground mt-1 ml-11">
          6 Kalimas · Shahadah · Tawheed · Learning Mode
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 bg-muted/40 rounded-2xl p-1">
        <button
          onClick={() => setTab("library")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
            tab === "library" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          📚 Library
        </button>
        <button
          onClick={() => setTab("favourites")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
            tab === "favourites" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Star className="w-3.5 h-3.5" strokeWidth={2} />
          Favourites
          {favouriteCount > 0 && (
            <span className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-[10px] font-bold">
              {favouriteCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === "library" ? (
          <motion.div key="library" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Kalimas in Arabic, English, or Urdu…"
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-border/60 bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              )}
            </div>

            {query ? (
              /* Search results */
              <div className="space-y-3">
                {results.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-10">No Kalimas match your search.</p>
                ) : (
                  results.map((k) => <KalimaHomeCard key={k.id} kalima={k} onSelect={onSelectKalima} />)
                )}
              </div>
            ) : (
              <>
                {/* Six Kalimas */}
                <section className="mb-8">
                  <SectionHeader
                    icon={<BookOpen className="w-4 h-4 text-primary" strokeWidth={2} />}
                    title="Six Kalimas"
                    sub="The fundamental statements of Islamic faith"
                  />
                  <div className="space-y-3">
                    {KALIMAS.map((k, i) => (
                      <KalimaHomeCard key={k.id} kalima={k} onSelect={onSelectKalima} />
                    ))}
                  </div>
                </section>

                {/* Shahadah */}
                <section className="mb-8">
                  <SectionHeader
                    icon={<span className="text-base">☪️</span>}
                    title="Shahadah"
                    sub="The declaration of faith — the first pillar of Islam"
                  />
                  <FeaturedCard
                    icon={<span className="text-2xl">🕌</span>}
                    iconBg="bg-emerald-500/15"
                    title="Shahadah — The Testimony"
                    description="Deep dive into the meaning, importance, Quranic verses, and Hadith references"
                    onClick={onShahadah}
                  />
                </section>

                {/* Tawheed */}
                <section className="mb-8">
                  <SectionHeader
                    icon={<span className="text-base">☝️</span>}
                    title="Importance of Tawheed"
                    sub="Understanding the Oneness of Allah and avoiding shirk"
                  />
                  <FeaturedCard
                    icon={<span className="text-2xl">📖</span>}
                    iconBg="bg-sky-500/15"
                    title="Tawheed — Complete Guide"
                    description="Categories of Tawheed, Quranic references, Hadith, and how to avoid shirk"
                    onClick={onTawheed}
                  />
                </section>

                {/* Learning Mode */}
                <section className="mb-4">
                  <SectionHeader
                    icon={<GraduationCap className="w-4 h-4 text-primary" strokeWidth={2} />}
                    title="Learning Mode"
                    sub="Practice and memorise the Kalimas"
                  />
                  <FeaturedCard
                    icon={<GraduationCap className="w-6 h-6 text-violet-600 dark:text-violet-400" strokeWidth={1.5} />}
                    iconBg="bg-violet-500/15"
                    title="Memorisation Practice"
                    description="Reveal-and-memorise practice cards, progress tracking, and audio playback"
                    onClick={onLearning}
                  />
                </section>
              </>
            )}
          </motion.div>
        ) : (
          /* Favourites tab */
          <motion.div key="favourites-tab" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <FavouritesView embedded bookmarks={bookmarks} onSelect={onSelectKalima} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── KALIMA DETAIL view ────────────────────────────────────────────────────────

function KalimaDetailView({
  kalima,
  onBack,
  onPrev,
  onNext,
}: {
  kalima: Kalima;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { settings } = useSettings();
  const [fontSize, setFontSize] = useState(settings.arabicFontSize ?? 32);
  const [showFontSlider, setShowFontSlider] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const colors = KALIMA_COLOR_MAP[kalima.color];
  const { isBookmarked, toggleBookmark } = useKalimaBookmarks();
  const bookmarked = isBookmarked(kalima.id);

  const getText = useCallback(
    () =>
      `${kalima.arabic}\n\n${kalima.transliteration}\n\n"${kalima.english}"\n\n— Kalima ${kalima.number}: ${kalima.name}\n\nShared from Quran Al-Falah · قرآن الفلاح`,
    [kalima]
  );
  const { copied, shared, handleCopy, handleShare } = useCopyShare(getText);

  const handleBookmark = useCallback(() => {
    toggleBookmark({
      id: kalima.id,
      number: kalima.number,
      name: kalima.name,
      nameUrdu: kalima.nameUrdu,
      subtitle: kalima.subtitle,
      arabic: kalima.arabic,
      transliteration: kalima.transliteration,
      english: kalima.english,
      color: kalima.color,
    });
  }, [kalima, toggleBookmark]);

  const hasPrev = kalima.number > 1;
  const hasNext = kalima.number < 6;

  return (
    <motion.div key={`kalima-${kalima.id}`} variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* Back + navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="p-1.5 rounded-lg hover:bg-muted/60 disabled:opacity-30 transition-colors"
            aria-label="Previous Kalima"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <span className="text-xs text-muted-foreground font-medium">{kalima.number} / 6</span>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="p-1.5 rounded-lg hover:bg-muted/60 disabled:opacity-30 transition-colors"
            aria-label="Next Kalima"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Title card */}
      <div className={`rounded-3xl border ${colors.border} ${colors.bg} p-5 mb-5`}>
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 rounded-2xl ${colors.number} flex items-center justify-center shrink-0 text-sm font-bold shadow-sm`}>
            {kalima.number}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {kalima.name} <span className="font-arabic text-lg">{kalima.nameUrdu}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{kalima.subtitle}</p>
          </div>
          {/* Font size toggle */}
          <button
            onClick={() => setShowFontSlider((s) => !s)}
            className="ml-auto p-2 rounded-xl bg-background/60 hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Adjust font size"
          >
            <ALargeSmall className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <AnimatePresence>
          {showFontSlider && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="mb-4 px-1"
            >
              <input
                type="range" min={20} max={52} step={2} value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-[10px] text-muted-foreground text-center mt-1">Font size: {fontSize}px</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Arabic text */}
        <p
          className="font-arabic leading-[2.1] text-foreground text-right mb-4"
          dir="rtl"
          lang="ar"
          style={{ fontSize: `${fontSize}px` }}
        >
          {kalima.arabic}
        </p>

        {/* Transliteration */}
        <p className="text-sm italic text-muted-foreground leading-relaxed mb-3">
          {kalima.transliteration}
        </p>

        {/* English */}
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          "{kalima.english}"
        </p>

        {/* Urdu */}
        <p className="font-urdu text-sm text-foreground/75 leading-relaxed text-right" dir="rtl" lang="ur">
          {kalima.urdu}
        </p>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        <AudioButton />
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-medium transition-colors duration-200"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} /> : <Copy className="w-3.5 h-3.5" strokeWidth={2} />}
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-medium transition-colors duration-200"
        >
          {shared ? <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} /> : <Share2 className="w-3.5 h-3.5" strokeWidth={2} />}
          Share
        </button>
        <button
          onClick={handleBookmark}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-200 ${
            bookmarked ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-muted/60 hover:bg-muted text-foreground"
          }`}
        >
          {bookmarked ? <BookmarkCheck className="w-3.5 h-3.5" strokeWidth={2} /> : <Bookmark className="w-3.5 h-3.5" strokeWidth={2} />}
          {bookmarked ? "Saved" : "Save"}
        </button>
      </div>

      {/* Word-by-word */}
      <CollapsibleSection
        id="words"
        title="Word-by-Word Meaning"
        expanded={expandedSection === "words"}
        onToggle={(id) => setExpandedSection((s) => (s === id ? null : id))}
      >
        <div className="flex flex-wrap gap-2">
          {kalima.words.map((w, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border/40 min-w-[80px] text-center"
            >
              <span className="font-arabic text-base text-foreground" dir="rtl" lang="ar">{w.arabic}</span>
              <span className="text-[10px] italic text-muted-foreground">{w.transliteration}</span>
              <span className="text-[11px] font-medium text-foreground/80">{w.meaning}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Explanation */}
      <CollapsibleSection
        id="explanation"
        title="Explanation"
        expanded={expandedSection === "explanation"}
        onToggle={(id) => setExpandedSection((s) => (s === id ? null : id))}
      >
        <p className="text-sm text-foreground/85 leading-relaxed">{kalima.explanation}</p>
      </CollapsibleSection>

      {/* Benefits */}
      <CollapsibleSection
        id="benefits"
        title="Benefits of Reciting"
        expanded={expandedSection === "benefits"}
        onToggle={(id) => setExpandedSection((s) => (s === id ? null : id))}
      >
        <ul className="space-y-2.5">
          {kalima.benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/85">
              <span className={`w-5 h-5 rounded-full ${colors.number} text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5`}>
                {i + 1}
              </span>
              {b}
            </li>
          ))}
        </ul>
      </CollapsibleSection>

      {/* Quranic references */}
      {kalima.quranRefs.length > 0 && (
        <CollapsibleSection
          id="quran"
          title="Quranic References"
          expanded={expandedSection === "quran"}
          onToggle={(id) => setExpandedSection((s) => (s === id ? null : id))}
        >
          <div className="space-y-4">
            {kalima.quranRefs.map((ref, i) => (
              <div key={i} className="rounded-xl border border-emerald-500/20 bg-emerald-500/6 p-3">
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">{ref.verse}</p>
                <p className="font-arabic text-base text-foreground leading-[1.9] text-right mb-2" dir="rtl" lang="ar">{ref.arabic}</p>
                <p className="text-xs text-foreground/80 italic leading-relaxed">"{ref.english}"</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Hadith references */}
      {kalima.hadithRefs.length > 0 && (
        <CollapsibleSection
          id="hadith"
          title="Hadith References"
          expanded={expandedSection === "hadith"}
          onToggle={(id) => setExpandedSection((s) => (s === id ? null : id))}
        >
          <div className="space-y-3">
            {kalima.hadithRefs.map((ref, i) => (
              <div key={i} className="rounded-xl border border-amber-500/20 bg-amber-500/6 p-3">
                <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1.5">{ref.source}</p>
                <p className="text-sm text-foreground/85 leading-relaxed italic">"{ref.english}"</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </motion.div>
  );
}

// ─── Collapsible section ───────────────────────────────────────────────────────

function CollapsibleSection({
  id, title, expanded, onToggle, children,
}: {
  id: string; title: string; expanded: boolean;
  onToggle: (id: string) => void; children: React.ReactNode;
}) {
  return (
    <div className="mb-3 rounded-2xl border border-border/50 overflow-hidden">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-muted/30 hover:bg-muted/50 transition-colors text-sm font-semibold text-foreground"
      >
        {title}
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} strokeWidth={2} />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1, transition: { duration: 0.22, ease: "easeOut" } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.16 } }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SHAHADAH view ─────────────────────────────────────────────────────────────

function ShahadahView({ onBack }: { onBack: () => void }) {
  const { settings } = useSettings();
  const [fontSize, setFontSize] = useState(settings.arabicFontSize ?? 32);
  const [showFontSlider, setShowFontSlider] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("tawheed");
  const s = SHAHADAH_DETAIL;

  return (
    <motion.div key="shahadah" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
        Back
      </button>

      <div className="flex items-center gap-3 mb-5">
        <span className="text-3xl">🕌</span>
        <div>
          <h2 className="text-xl font-bold text-foreground">Shahadah</h2>
          <p className="text-xs text-muted-foreground">The Declaration of Faith — First Pillar of Islam</p>
        </div>
      </div>

      {/* Arabic card */}
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/6 p-5 mb-5">
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setShowFontSlider((s) => !s)}
            className="p-2 rounded-xl bg-background/60 hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ALargeSmall className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
        <AnimatePresence>
          {showFontSlider && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="mb-4 px-1"
            >
              <input type="range" min={18} max={48} step={2} value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-primary" />
              <p className="text-[10px] text-muted-foreground text-center mt-1">Font size: {fontSize}px</p>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="font-arabic text-right leading-[2.1] text-foreground mb-4" dir="rtl" lang="ar" style={{ fontSize: `${fontSize}px` }}>
          {s.arabic}
        </p>
        <p className="text-sm italic text-muted-foreground leading-relaxed mb-3">{s.transliteration}</p>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">"{s.english}"</p>
        <p className="font-urdu text-sm text-foreground/75 leading-relaxed text-right" dir="rtl" lang="ur">{s.urdu}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <AudioButton />
      </div>

      {/* Tawheed explanation */}
      <CollapsibleSection id="tawheed" title="Explanation of Tawheed" expanded={expandedSection === "tawheed"}
        onToggle={(id) => setExpandedSection((s) => (s === id ? null : id))}>
        <div className="space-y-4">
          {s.tawheedExplanation.map((item, i) => (
            <div key={i} className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3.5">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-1.5">{item.title}</p>
              <p className="text-sm text-foreground/85 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Prophet explanation */}
      <CollapsibleSection id="prophet" title="Accepting the Prophet ﷺ as Messenger" expanded={expandedSection === "prophet"}
        onToggle={(id) => setExpandedSection((s) => (s === id ? null : id))}>
        <p className="text-sm text-foreground/85 leading-relaxed">{s.prophetExplanation}</p>
      </CollapsibleSection>

      {/* Importance */}
      <CollapsibleSection id="importance" title="Importance of the Shahadah" expanded={expandedSection === "importance"}
        onToggle={(id) => setExpandedSection((s) => (s === id ? null : id))}>
        <ul className="space-y-2.5">
          {s.importance.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/85">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </CollapsibleSection>

      {/* Quran refs */}
      <CollapsibleSection id="quran" title="Quranic References" expanded={expandedSection === "quran"}
        onToggle={(id) => setExpandedSection((s) => (s === id ? null : id))}>
        <div className="space-y-4">
          {s.quranRefs.map((ref, i) => (
            <div key={i} className="rounded-xl border border-emerald-500/20 bg-emerald-500/6 p-3">
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">{ref.verse}</p>
              <p className="font-arabic text-base text-foreground leading-[1.9] text-right mb-2" dir="rtl" lang="ar">{ref.arabic}</p>
              <p className="text-xs text-foreground/80 italic leading-relaxed">"{ref.english}"</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Hadith refs */}
      <CollapsibleSection id="hadith" title="Hadith References" expanded={expandedSection === "hadith"}
        onToggle={(id) => setExpandedSection((s) => (s === id ? null : id))}>
        <div className="space-y-3">
          {s.hadithRefs.map((ref, i) => (
            <div key={i} className="rounded-xl border border-amber-500/20 bg-amber-500/6 p-3">
              <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1.5">{ref.source}</p>
              <p className="text-sm text-foreground/85 leading-relaxed italic">"{ref.english}"</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </motion.div>
  );
}

// ─── TAWHEED view ──────────────────────────────────────────────────────────────

function TawheedView({ onBack }: { onBack: () => void }) {
  return (
    <motion.div key="tawheed" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
        Back
      </button>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">☝️</span>
        <div>
          <h2 className="text-xl font-bold text-foreground">Importance of Tawheed</h2>
          <p className="text-xs text-muted-foreground">The Oneness of Allah — foundation of all Islam</p>
        </div>
      </div>
      <div className="space-y-4">
        {TAWHEED_CARDS.map((card, i) => (
          <TawheedCardView key={card.id} card={card} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

const TawheedCardView = memo(function TawheedCardView({ card, index }: { card: TawheedCard; index: number }) {
  const [expanded, setExpanded] = useState(index < 2);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.06, duration: 0.25 } }}
      className="rounded-2xl border border-border/50 overflow-hidden"
    >
      <button
        onClick={() => setExpanded((s) => !s)}
        className="w-full flex items-center gap-3 px-4 py-4 bg-card hover:bg-muted/30 transition-colors text-left"
      >
        <span className="text-2xl shrink-0">{card.icon}</span>
        <span className="text-sm font-semibold text-foreground flex-1">{card.title}</span>
        <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} strokeWidth={2} />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1, transition: { duration: 0.22 } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.16 } }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line mb-3">{card.body}</p>
              {card.quranRef && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/6 p-3 mb-2">
                  <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">{card.quranRef.verse}</p>
                  <p className="font-arabic text-sm text-foreground leading-[1.9] text-right mb-2" dir="rtl" lang="ar">{card.quranRef.arabic}</p>
                  <p className="text-xs text-foreground/80 italic">"{card.quranRef.english}"</p>
                </div>
              )}
              {card.hadithRef && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/6 p-3">
                  <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1.5">{card.hadithRef.source}</p>
                  <p className="text-xs text-foreground/85 leading-relaxed italic">"{card.hadithRef.english}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// ─── LEARNING MODE view ────────────────────────────────────────────────────────

function LearningView({ onBack }: { onBack: () => void }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>(loadProgress);
  const kalima = KALIMAS[selectedIndex];
  const colors = KALIMA_COLOR_MAP[kalima.color];
  const count = progress[kalima.id] ?? 0;

  const handleReveal = () => setRevealed(true);

  const handleComplete = () => {
    const updated = { ...progress, [kalima.id]: count + 1 };
    setProgress(updated);
    saveProgress(updated);
    setRevealed(false);
    if (selectedIndex < 5) setSelectedIndex((i) => i + 1);
  };

  const handleReset = () => {
    setRevealed(false);
    setProgress({});
    saveProgress({});
  };

  useEffect(() => {
    setRevealed(false);
  }, [selectedIndex]);

  return (
    <motion.div key="learning" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
        Back
      </button>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-violet-500/15 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-violet-600 dark:text-violet-400" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Learning Mode</h2>
          <p className="text-xs text-muted-foreground">Memorise the Six Kalimas at your pace</p>
        </div>
      </div>

      {/* Kalima selector chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
        {KALIMAS.map((k, i) => {
          const c = KALIMA_COLOR_MAP[k.color];
          const done = (progress[k.id] ?? 0) > 0;
          return (
            <button
              key={k.id}
              onClick={() => setSelectedIndex(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors border ${
                selectedIndex === i
                  ? `${c.number} border-transparent shadow-sm`
                  : `${c.badge} ${c.border}`
              }`}
            >
              {done && <Check className="w-3 h-3" strokeWidth={2.5} />}
              {k.number}. {k.name}
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
          <span>Progress</span>
          <span>{Object.values(progress).filter((v) => v > 0).length} / 6 Kalimas practised</span>
        </div>
        <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
          <motion.div
            className="h-full bg-violet-500 rounded-full"
            animate={{ width: `${(Object.values(progress).filter((v) => v > 0).length / 6) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Practice card */}
      <div className={`rounded-3xl border-2 ${colors.border} ${colors.bg} p-5 mb-5`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl ${colors.number} flex items-center justify-center text-xs font-bold`}>
              {kalima.number}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{kalima.name}</p>
              <p className="text-[10px] text-muted-foreground">{kalima.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{count}× completed</span>
          </div>
        </div>

        {/* Arabic (always shown) */}
        <p className="font-arabic text-2xl leading-[2] text-foreground text-right mb-4" dir="rtl" lang="ar">
          {kalima.arabic}
        </p>

        {/* Hidden content — reveal on tap */}
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.button
              key="hidden"
              onClick={handleReveal}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-border/50 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Eye className="w-4 h-4" strokeWidth={2} />
              Tap to reveal transliteration & translation
            </motion.button>
          ) : (
            <motion.div key="revealed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-sm italic text-muted-foreground leading-relaxed mb-2">
                {kalima.transliteration}
              </p>
              <p className="text-sm text-foreground/85 leading-relaxed mb-2">"{kalima.english}"</p>
              <p className="font-urdu text-sm text-foreground/70 text-right leading-relaxed" dir="rtl" lang="ur">
                {kalima.urdu}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <AudioButton />
        {revealed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={handleComplete}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-semibold transition-colors hover:bg-violet-700"
          >
            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
            I've memorised this
            {selectedIndex < 5 && " — Next"}
          </motion.button>
        )}
        {!revealed && (
          <button
            onClick={() => setRevealed(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-medium"
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={2} />
            Show answer
          </button>
        )}
        <button
          onClick={() => { setRevealed(false); setSelectedIndex((i) => i === 0 ? i : i - 1); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-medium"
          disabled={selectedIndex === 0}
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Previous
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
          Reset progress
        </button>
      </div>

      {/* Per-Kalima progress list */}
      <div className="rounded-2xl border border-border/50 overflow-hidden">
        <div className="px-4 py-3 bg-muted/30 border-b border-border/40">
          <p className="text-xs font-semibold text-foreground">Memorisation Progress</p>
        </div>
        {KALIMAS.map((k) => {
          const c = KALIMA_COLOR_MAP[k.color];
          const n = progress[k.id] ?? 0;
          return (
            <div key={k.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-b-0">
              <div className={`w-6 h-6 rounded-lg ${c.number} flex items-center justify-center text-[10px] font-bold shrink-0`}>
                {k.number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{k.name}</p>
                <p className="text-[10px] text-muted-foreground">{k.subtitle}</p>
              </div>
              {n > 0 ? (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                  {n}× done
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground">Not yet</span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── FAVOURITES view ───────────────────────────────────────────────────────────

function FavouritesView({
  embedded,
  bookmarks,
  onSelect,
  onBack,
}: {
  embedded?: boolean;
  bookmarks: KalimaBookmark[];
  onSelect: (index: number) => void;
  onBack?: () => void;
}) {
  const { removeBookmark } = useKalimaBookmarks();
  const sorted = useMemo(() => [...bookmarks].sort((a, b) => b.timestamp - a.timestamp), [bookmarks]);

  const handleSelect = useCallback((id: string) => {
    const idx = KALIMAS.findIndex((k) => k.id === id);
    if (idx !== -1) onSelect(idx);
  }, [onSelect]);

  return (
    <motion.div key="favourites" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {!embedded && onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          Back
        </button>
      )}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Star className="w-10 h-10 text-muted-foreground/30" strokeWidth={1} />
          <p className="text-sm font-medium text-foreground">No saved Kalimas yet</p>
          <p className="text-xs text-muted-foreground">Open a Kalima and tap Save to bookmark it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((b, i) => {
            const colors = KALIMA_COLOR_MAP[b.color];
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                layout
                className={`rounded-2xl border ${colors.border} ${colors.bg} overflow-hidden`}
              >
                <div className="h-0.5 bg-gradient-to-r from-amber-500/60 via-amber-400/30 to-transparent" />
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-7 h-7 rounded-xl ${colors.number} flex items-center justify-center text-[11px] font-bold shrink-0`}>
                      {b.number}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{b.name}</p>
                      <p className="text-[10px] text-muted-foreground">{b.subtitle}</p>
                    </div>
                  </div>
                  <p className="font-arabic text-base text-foreground text-right leading-[1.9] mb-2 line-clamp-2" dir="rtl" lang="ar">
                    {b.arabic}
                  </p>
                  <p className="text-xs italic text-muted-foreground line-clamp-1 mb-3">{b.transliteration}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSelect(b.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${colors.badge} border text-xs font-medium transition-colors`}
                    >
                      <BookOpen className="w-3 h-3" strokeWidth={2} />
                      View
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={() => removeBookmark(b.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive/8 hover:bg-destructive/16 text-destructive text-xs font-medium transition-colors"
                    >
                      <Trash2 className="w-3 h-3" strokeWidth={2} />
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function KalimasPage() {
  const [view, setView] = useState<View>({ kind: "home" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const { bookmarks } = useKalimaBookmarks();

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goHome = useCallback(() => { setView({ kind: "home" }); scrollToTop(); }, [scrollToTop]);

  const handleSelectKalima = useCallback(
    (index: number) => { setView({ kind: "kalima", index }); scrollToTop(); },
    [scrollToTop]
  );

  const handlePrevKalima = useCallback(() => {
    if (view.kind === "kalima" && view.index > 0) {
      setView({ kind: "kalima", index: view.index - 1 });
      scrollToTop();
    }
  }, [view, scrollToTop]);

  const handleNextKalima = useCallback(() => {
    if (view.kind === "kalima" && view.index < 5) {
      setView({ kind: "kalima", index: view.index + 1 });
      scrollToTop();
    }
  }, [view, scrollToTop]);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          {view.kind === "home" && (
            <HomeView
              key="home"
              onSelectKalima={handleSelectKalima}
              onShahadah={() => { setView({ kind: "shahadah" }); scrollToTop(); }}
              onTawheed={() => { setView({ kind: "tawheed" }); scrollToTop(); }}
              onLearning={() => { setView({ kind: "learning" }); scrollToTop(); }}
              onFavourites={() => { setView({ kind: "favourites" }); scrollToTop(); }}
              favouriteCount={bookmarks.length}
            />
          )}
          {view.kind === "kalima" && (
            <KalimaDetailView
              key={`kalima-${view.index}`}
              kalima={KALIMAS[view.index]}
              onBack={goHome}
              onPrev={handlePrevKalima}
              onNext={handleNextKalima}
            />
          )}
          {view.kind === "shahadah" && <ShahadahView key="shahadah" onBack={goHome} />}
          {view.kind === "tawheed" && <TawheedView key="tawheed" onBack={goHome} />}
          {view.kind === "learning" && <LearningView key="learning" onBack={goHome} />}
          {view.kind === "favourites" && (
            <FavouritesView key="favourites" bookmarks={bookmarks} onSelect={handleSelectKalima} onBack={goHome} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
