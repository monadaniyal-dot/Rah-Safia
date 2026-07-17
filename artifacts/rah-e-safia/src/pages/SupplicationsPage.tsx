import { useState, useMemo, useCallback, memo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Bookmark, BookmarkCheck, Share2, Copy, Check,
  ChevronDown, ChevronUp, ChevronRight, ArrowLeft,
  Heart, Volume2, ALargeSmall,
} from "lucide-react";
import {
  DUA_CATEGORIES,
  DUA_SUBCATEGORIES,
  DUA_ITEMS,
  getSubcategoriesByCategory,
  getDuasBySubcategory,
  getDuaCountBySubcategory,
  searchDuas,
  type DuaItem,
  type DuaCategory,
  type DuaSubcategory,
} from "@/lib/dua-data";
import { useSupplicationBookmarks } from "@/lib/supplications-bookmarks";
import { useSettings } from "@/lib/use-settings";
import { cn } from "@/lib/utils";

// ─── View types ───────────────────────────────────────────────────────────────

type View =
  | { kind: "categories" }
  | { kind: "subcategories"; category: DuaCategory }
  | { kind: "duas"; subcategory: DuaSubcategory; category: DuaCategory };

type Tab = "library" | "favourites";

// ─── Color map ────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<
  string,
  { badge: string; border: string; accent: string; header: string; tag: string; glow: string }
> = {
  amber: {
    badge:  "bg-amber-500/15 text-amber-300 border-amber-500/25",
    border: "border-amber-500/20",
    accent: "bg-amber-500/10",
    header: "from-amber-900/60 to-amber-950/80",
    tag:    "bg-amber-500/15 text-amber-300",
    glow:   "shadow-amber-500/10",
  },
  emerald: {
    badge:  "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    border: "border-emerald-500/20",
    accent: "bg-emerald-500/10",
    header: "from-emerald-900/60 to-emerald-950/80",
    tag:    "bg-emerald-500/15 text-emerald-300",
    glow:   "shadow-emerald-500/10",
  },
  teal: {
    badge:  "bg-teal-500/15 text-teal-300 border-teal-500/25",
    border: "border-teal-500/20",
    accent: "bg-teal-500/10",
    header: "from-teal-900/60 to-teal-950/80",
    tag:    "bg-teal-500/15 text-teal-300",
    glow:   "shadow-teal-500/10",
  },
  sky: {
    badge:  "bg-sky-500/15 text-sky-300 border-sky-500/25",
    border: "border-sky-500/20",
    accent: "bg-sky-500/10",
    header: "from-sky-900/60 to-sky-950/80",
    tag:    "bg-sky-500/15 text-sky-300",
    glow:   "shadow-sky-500/10",
  },
  rose: {
    badge:  "bg-rose-500/15 text-rose-300 border-rose-500/25",
    border: "border-rose-500/20",
    accent: "bg-rose-500/10",
    header: "from-rose-900/60 to-rose-950/80",
    tag:    "bg-rose-500/15 text-rose-300",
    glow:   "shadow-rose-500/10",
  },
  violet: {
    badge:  "bg-violet-500/15 text-violet-300 border-violet-500/25",
    border: "border-violet-500/20",
    accent: "bg-violet-500/10",
    header: "from-violet-900/60 to-violet-950/80",
    tag:    "bg-violet-500/15 text-violet-300",
    glow:   "shadow-violet-500/10",
  },
  green: {
    badge:  "bg-green-500/15 text-green-300 border-green-500/25",
    border: "border-green-500/20",
    accent: "bg-green-500/10",
    header: "from-green-900/60 to-green-950/80",
    tag:    "bg-green-500/15 text-green-300",
    glow:   "shadow-green-500/10",
  },
  indigo: {
    badge:  "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
    border: "border-indigo-500/20",
    accent: "bg-indigo-500/10",
    header: "from-indigo-900/60 to-indigo-950/80",
    tag:    "bg-indigo-500/15 text-indigo-300",
    glow:   "shadow-indigo-500/10",
  },
};

function getColors(color: string) {
  return COLOR_MAP[color] ?? COLOR_MAP.emerald;
}

// ─── Audio toast ──────────────────────────────────────────────────────────────

function AudioToast({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap
                 bg-popover border border-border rounded-full px-3 py-1.5
                 text-[10px] font-semibold text-muted-foreground shadow-md z-50"
    >
      🔊 Audio coming soon
    </motion.div>
  );
}

// ─── Dua Card ─────────────────────────────────────────────────────────────────

type CopyState = "idle" | "copied";
type ShareState = "idle" | "shared";

interface DuaCardProps {
  item: DuaItem;
  index: number;
  color: string;
  arabicFontSize: number;
}

const DuaCard = memo(function DuaCard({ item, index, color, arabicFontSize }: DuaCardProps) {
  const { isBookmarked, toggleBookmark } = useSupplicationBookmarks();
  const [expanded, setExpanded] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [shareState, setShareState] = useState<ShareState>("idle");
  const [showAudioToast, setShowAudioToast] = useState(false);

  const bookmarked = isBookmarked(item.id);
  const colors = getColors(color);

  const shareText = useMemo(
    () =>
      `${item.arabic}\n\n${item.transliteration}\n\n"${item.english}"\n\n— ${item.reference}\n\nShared from Quran Al-Falah · قرآن الفلاح`,
    [item]
  );

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setShareState("shared");
      setTimeout(() => setShareState("idle"), 2000);
    } catch {
      /* blocked */
    }
  }, [shareText]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      /* blocked */
    }
  }, [shareText]);

  const handleBookmark = useCallback(() => {
    toggleBookmark({
      id: item.id,
      arabic: item.arabic,
      transliteration: item.transliteration,
      english: item.english,
      subcategoryId: item.subcategoryId,
      categoryId: item.categoryId,
    });
  }, [item, toggleBookmark]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.05, 0.35), ease: "easeOut" }}
      className={cn(
        "rounded-2xl bg-card border shadow-sm overflow-hidden",
        colors.border
      )}
      style={{ transform: "translateZ(0)" }}
    >
      {/* Colour accent bar */}
      <div
        className={cn(
          "h-0.5 w-full bg-gradient-to-r",
          `from-transparent via-${color}-400/60 to-transparent`
        )}
      />

      <div className="p-5">
        {/* Top row: reference badge + bookmark */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
              colors.badge
            )}
          >
            {item.reference}
          </span>
          <button
            onClick={handleBookmark}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark this dua"}
            className={cn(
              "shrink-0 p-1.5 rounded-full transition-all",
              bookmarked
                ? "text-amber-400 bg-amber-400/15"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {bookmarked ? (
              <BookmarkCheck className="w-4 h-4" strokeWidth={2} />
            ) : (
              <Bookmark className="w-4 h-4" strokeWidth={2} />
            )}
          </button>
        </div>

        {/* Arabic text */}
        <p
          className="font-arabic text-right text-foreground leading-[2] mb-3 w-full select-text"
          dir="rtl"
          style={{ fontSize: arabicFontSize, fontWeight: 700 }}
        >
          {item.arabic}
        </p>

        {/* Transliteration */}
        <p className="text-xs font-medium text-primary/80 italic mb-2 leading-relaxed">
          {item.transliteration}
        </p>

        {/* English */}
        <p className="text-sm text-foreground font-medium leading-relaxed mb-1">
          "{item.english}"
        </p>

        {/* Urdu */}
        <p
          className="font-arabic text-right text-muted-foreground text-sm leading-loose mb-3"
          dir="rtl"
        >
          {item.urdu}
        </p>

        {/* Expandable explanation */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-1"
        >
          {expanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          {expanded ? "Hide explanation" : "Show explanation"}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              key="explanation"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <p
                className={cn(
                  "text-xs leading-relaxed text-muted-foreground rounded-xl p-3 mt-2",
                  colors.accent
                )}
              >
                {item.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 px-5 pb-4 pt-1 border-t border-border/50 flex-wrap">
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground text-[11px] font-semibold"
        >
          <Share2 className="w-3 h-3" strokeWidth={2} />
          {shareState === "shared" ? "Shared!" : "Share"}
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground text-[11px] font-semibold"
        >
          {copyState === "copied" ? (
            <Check className="w-3 h-3 text-green-500" strokeWidth={2.5} />
          ) : (
            <Copy className="w-3 h-3" strokeWidth={2} />
          )}
          {copyState === "copied" ? "Copied!" : "Copy"}
        </button>
        {/* Audio — coming soon */}
        <div className="relative">
          <button
            onClick={() => setShowAudioToast((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground text-[11px] font-semibold"
          >
            <Volume2 className="w-3 h-3" strokeWidth={2} />
            Audio
          </button>
          <AnimatePresence>
            {showAudioToast && (
              <AudioToast onClose={() => setShowAudioToast(false)} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
});

// ─── Category Card ────────────────────────────────────────────────────────────

const CategoryCard = memo(function CategoryCard({
  category,
  onSelect,
}: {
  category: DuaCategory;
  onSelect: (cat: DuaCategory) => void;
}) {
  const colors = getColors(category.color);
  const totalDuas = useMemo(
    () =>
      DUA_ITEMS.filter((d) => d.categoryId === category.id).length,
    [category.id]
  );

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => onSelect(category)}
      className={cn(
        "w-full text-left rounded-2xl bg-card border shadow-sm overflow-hidden",
        "hover:shadow-md transition-shadow group",
        colors.border
      )}
      style={{ transform: "translateZ(0)" }}
    >
      {/* Top accent */}
      <div
        className={cn(
          "h-0.5 w-full bg-gradient-to-r",
          `from-transparent via-${category.color}-400/60 to-transparent`
        )}
      />

      <div
        className={cn(
          "p-4 bg-gradient-to-br border-b border-border/30",
          colors.header
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-hidden="true">
            {category.icon}
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-foreground text-sm leading-tight">
              {category.title}
            </h2>
            <p
              className="font-arabic text-muted-foreground text-xs mt-0.5"
              dir="rtl"
            >
              {category.arabicTitle}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                colors.tag
              )}
            >
              {totalDuas} duas
            </span>
            <ChevronRight
              className={cn(
                "w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors",
              )}
              strokeWidth={2.5}
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-2.5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {category.description}
        </p>
      </div>
    </motion.button>
  );
});

// ─── Subcategory Row ──────────────────────────────────────────────────────────

const SubcategoryRow = memo(function SubcategoryRow({
  subcategory,
  color,
  onSelect,
}: {
  subcategory: DuaSubcategory;
  color: string;
  onSelect: (sub: DuaSubcategory) => void;
}) {
  const colors = getColors(color);
  const count = useMemo(
    () => getDuaCountBySubcategory(subcategory.id),
    [subcategory.id]
  );

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onClick={() => onSelect(subcategory)}
      className={cn(
        "w-full text-left flex items-center gap-3 p-3.5 rounded-xl",
        "bg-card border hover:bg-muted/40 transition-colors group",
        colors.border
      )}
      style={{ transform: "translateZ(0)" }}
    >
      <span
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0",
          colors.accent
        )}
        role="img"
        aria-hidden="true"
      >
        {subcategory.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground leading-tight">
          {subcategory.title}
        </p>
        <p
          className="font-arabic text-xs text-muted-foreground mt-0.5"
          dir="rtl"
        >
          {subcategory.arabicTitle}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", colors.tag)}>
          {count}
        </span>
        <ChevronRight
          className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors"
          strokeWidth={2.5}
        />
      </div>
    </motion.button>
  );
});

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function Breadcrumb({
  view,
  onBack,
}: {
  view: View;
  onBack: () => void;
}) {
  if (view.kind === "categories") return null;

  const label =
    view.kind === "subcategories"
      ? view.category.title
      : view.subcategory.title;

  return (
    <button
      onClick={onBack}
      className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors mb-4"
    >
      <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
      <span>Back</span>
      <span className="text-muted-foreground font-normal">· {label}</span>
    </button>
  );
}

// ─── Font size control ────────────────────────────────────────────────────────

function FontSizeControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5 border border-border">
      <ALargeSmall className="w-3.5 h-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
      <input
        type="range"
        min={16}
        max={36}
        step={2}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 h-1.5 accent-primary cursor-pointer"
        aria-label="Arabic font size"
      />
      <span className="text-[10px] font-bold text-muted-foreground w-6 text-right">
        {value}
      </span>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptySearch({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center gap-4"
    >
      <span className="text-4xl" role="img" aria-label="search">🔍</span>
      <div>
        <p className="font-semibold text-foreground">No duas found</p>
        <p className="text-sm text-muted-foreground mt-1">
          No results for "<span className="text-primary">{query}</span>"
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Try searching in English, Arabic, Urdu, or by category name
        </p>
      </div>
    </motion.div>
  );
}

function EmptyFavourites() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center gap-4"
    >
      <span className="text-4xl" role="img" aria-label="bookmark">🤲</span>
      <div>
        <p className="font-semibold text-foreground">No favourite duas yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Tap the bookmark icon on any dua to save it here
        </p>
      </div>
    </motion.div>
  );
}

// ─── Favourites view ──────────────────────────────────────────────────────────

function FavouritesView({ arabicFontSize }: { arabicFontSize: number }) {
  const { bookmarks } = useSupplicationBookmarks();

  const catColorMap = useMemo(
    () => Object.fromEntries(DUA_CATEGORIES.map((c) => [c.id, c.color])),
    []
  );

  const enriched = useMemo(
    () =>
      bookmarks
        .map((b) => DUA_ITEMS.find((d) => d.id === b.id))
        .filter((d): d is DuaItem => d !== undefined),
    [bookmarks]
  );

  if (enriched.length === 0) return <EmptyFavourites />;

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-4">
        {enriched.length} saved {enriched.length === 1 ? "dua" : "duas"} · most recent first
      </p>
      <div className="grid gap-3">
        {enriched.map((item, i) => (
          <DuaCard
            key={item.id}
            item={item}
            index={i}
            color={catColorMap[item.categoryId] ?? "emerald"}
            arabicFontSize={arabicFontSize}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Search results ───────────────────────────────────────────────────────────

function SearchResultsView({
  items,
  arabicFontSize,
}: {
  items: DuaItem[];
  arabicFontSize: number;
}) {
  const catColorMap = useMemo(
    () => Object.fromEntries(DUA_CATEGORIES.map((c) => [c.id, c.color])),
    []
  );

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-4">
        {items.length} {items.length === 1 ? "result" : "results"}
      </p>
      <div className="grid gap-3">
        {items.map((item, i) => (
          <DuaCard
            key={item.id}
            item={item}
            index={i}
            color={catColorMap[item.categoryId] ?? "emerald"}
            arabicFontSize={arabicFontSize}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SupplicationsPage() {
  const { settings } = useSettings();
  const [tab, setTab] = useState<Tab>("library");
  const [view, setView] = useState<View>({ kind: "categories" });
  const [query, setQuery] = useState("");
  const [arabicFontSize, setArabicFontSize] = useState(
    () => settings?.arabicFontSize ?? 24
  );
  const [showFontControl, setShowFontControl] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isSearching = query.trim().length > 0;

  const searchResults = useMemo(
    () => (isSearching ? searchDuas(query) : []),
    [query, isSearching]
  );

  // Derived state for category/subcategory views
  const currentCategory =
    view.kind === "subcategories"
      ? view.category
      : view.kind === "duas"
      ? view.category
      : null;

  const subcategories = useMemo(
    () =>
      currentCategory
        ? getSubcategoriesByCategory(currentCategory.id)
        : [],
    [currentCategory]
  );

  const duas = useMemo(
    () =>
      view.kind === "duas"
        ? getDuasBySubcategory(view.subcategory.id)
        : [],
    [view]
  );

  const handleSelectCategory = useCallback((cat: DuaCategory) => {
    setView({ kind: "subcategories", category: cat });
    setQuery("");
    contentRef.current?.scrollTo({ top: 0 });
  }, []);

  const handleSelectSubcategory = useCallback(
    (sub: DuaSubcategory) => {
      if (view.kind === "subcategories") {
        setView({ kind: "duas", subcategory: sub, category: view.category });
        contentRef.current?.scrollTo({ top: 0 });
      }
    },
    [view]
  );

  const handleBack = useCallback(() => {
    if (view.kind === "duas") {
      setView({ kind: "subcategories", category: view.category });
      contentRef.current?.scrollTo({ top: 0 });
    } else if (view.kind === "subcategories") {
      setView({ kind: "categories" });
      contentRef.current?.scrollTo({ top: 0 });
    }
  }, [view]);

  const handleTabChange = useCallback((t: Tab) => {
    setTab(t);
    setQuery("");
    setView({ kind: "categories" });
  }, []);

  const handleClearSearch = useCallback(() => {
    setQuery("");
    searchRef.current?.focus();
  }, []);

  // Page title based on current view
  const pageTitle =
    view.kind === "categories"
      ? "Supplications"
      : view.kind === "subcategories"
      ? view.category.title
      : view.subcategory.title;

  const pageSubtitle =
    view.kind === "categories"
      ? "أدعية من الكتاب والسنة"
      : view.kind === "subcategories"
      ? view.category.arabicTitle
      : view.subcategory.arabicTitle;

  const totalDuas = DUA_ITEMS.length;

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/60 shadow-sm lg:static lg:border-none lg:shadow-none lg:bg-transparent">
        <div className="px-4 pt-4 pb-3 lg:px-8 lg:pt-6 lg:pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-2xl" role="img" aria-hidden="true">🤲</span>
                <h1 className="text-xl font-bold text-foreground truncate">{pageTitle}</h1>
              </div>
              <p className="font-arabic text-sm text-muted-foreground mt-0.5" dir="rtl">
                {pageSubtitle}
              </p>
              {view.kind === "categories" && tab === "library" && !isSearching && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {totalDuas} authentic duas across {DUA_CATEGORIES.length} categories
                </p>
              )}
              {view.kind === "duas" && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {duas.length} {duas.length === 1 ? "dua" : "duas"}
                </p>
              )}
            </div>

            {/* Font size toggle — only show in dua list view */}
            {view.kind === "duas" && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowFontControl((p) => !p)}
                  className={cn(
                    "p-2 rounded-full border transition-colors",
                    showFontControl
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-muted border-border text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="Adjust Arabic font size"
                >
                  <ALargeSmall className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            )}
          </div>

          {/* Font size slider */}
          <AnimatePresence>
            {showFontControl && view.kind === "duas" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden mt-2"
              >
                <div className="flex items-center gap-3">
                  <FontSizeControl value={arabicFontSize} onChange={setArabicFontSize} />
                  <p className="text-[11px] text-muted-foreground">Arabic font size</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto px-4 pb-24 lg:px-8 lg:pb-12"
      >
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/40 border border-border/60 mb-4 mt-3">
          {(["library", "favourites"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all",
                tab === t
                  ? "bg-card shadow-sm text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "library" ? (
                <>🤲 Library</>
              ) : (
                <>
                  <Heart className="w-3 h-3" strokeWidth={2} />
                  Favourites
                </>
              )}
            </button>
          ))}
        </div>

        {/* Search bar — only in library tab */}
        {tab === "library" && (
          <div className="relative mb-4">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
              strokeWidth={2}
            />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search duas in Arabic, English, Urdu, or by category…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(
                "w-full bg-muted/40 border border-border rounded-xl pl-10 pr-9 py-2.5",
                "text-sm text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60",
                "transition-colors"
              )}
            />
            {query && (
              <button
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            )}
          </div>
        )}

        {/* ── Favourites tab ───────────────────────────────────────── */}
        {tab === "favourites" && <FavouritesView arabicFontSize={arabicFontSize} />}

        {/* ── Library tab ──────────────────────────────────────────── */}
        {tab === "library" && (
          <>
            {/* Search results */}
            {isSearching ? (
              searchResults.length > 0 ? (
                <SearchResultsView
                  items={searchResults}
                  arabicFontSize={arabicFontSize}
                />
              ) : (
                <EmptySearch query={query} />
              )
            ) : (
              <AnimatePresence mode="wait">
                {/* Category grid */}
                {view.kind === "categories" && (
                  <motion.div
                    key="categories"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.22 }}
                  >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {DUA_CATEGORIES.map((cat) => (
                        <CategoryCard
                          key={cat.id}
                          category={cat}
                          onSelect={handleSelectCategory}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Subcategory list */}
                {view.kind === "subcategories" && (
                  <motion.div
                    key="subcategories"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.22 }}
                  >
                    <Breadcrumb view={view} onBack={handleBack} />

                    {/* Category header banner */}
                    <div
                      className={cn(
                        "rounded-2xl p-4 mb-4 bg-gradient-to-br border",
                        getColors(view.category.color).border,
                        getColors(view.category.color).header
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl" role="img" aria-hidden="true">
                          {view.category.icon}
                        </span>
                        <div>
                          <h2 className="text-base font-bold text-foreground">
                            {view.category.title}
                          </h2>
                          <p
                            className="font-arabic text-sm text-muted-foreground"
                            dir="rtl"
                          >
                            {view.category.arabicTitle}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full",
                            getColors(view.category.color).tag
                          )}
                        >
                          {subcategories.length} topics
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        {view.category.description}
                      </p>
                    </div>

                    <div className="grid gap-2.5">
                      {subcategories.map((sub) => (
                        <SubcategoryRow
                          key={sub.id}
                          subcategory={sub}
                          color={view.category.color}
                          onSelect={handleSelectSubcategory}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Dua list */}
                {view.kind === "duas" && (
                  <motion.div
                    key="duas"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.22 }}
                  >
                    <Breadcrumb view={view} onBack={handleBack} />

                    {duas.length > 0 ? (
                      <div className="grid gap-3">
                        {duas.map((dua, i) => (
                          <DuaCard
                            key={dua.id}
                            item={dua}
                            index={i}
                            color={view.category.color}
                            arabicFontSize={arabicFontSize}
                          />
                        ))}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 gap-4 text-center"
                      >
                        <span className="text-4xl">🤲</span>
                        <p className="text-muted-foreground text-sm">
                          No duas found for this subcategory.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </>
        )}
      </div>
    </div>
  );
}
