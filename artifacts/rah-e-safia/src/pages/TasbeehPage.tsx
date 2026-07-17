import { useState, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Bookmark, BookmarkCheck, Share2, Copy, Check,
  ExternalLink, ChevronDown, ChevronUp,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  DHIKR_CATEGORIES,
  DHIKR_ITEMS,
  getItemsByCategory,
  searchDhikr,
  type DhikrItem,
  type DhikrCategory,
} from "@/lib/tasbeeh-data";
import { useTasbeehBookmarks } from "@/lib/tasbeeh-bookmarks";
import { cn } from "@/lib/utils";

// ─── Color maps ───────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, {
  badge: string;
  border: string;
  accent: string;
  header: string;
  tag: string;
}> = {
  emerald: {
    badge:  "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    border: "border-emerald-500/20",
    accent: "bg-emerald-500/10",
    header: "from-emerald-900/60 to-emerald-950/80",
    tag:    "bg-emerald-500/15 text-emerald-300",
  },
  amber: {
    badge:  "bg-amber-500/15 text-amber-300 border-amber-500/25",
    border: "border-amber-500/20",
    accent: "bg-amber-500/10",
    header: "from-amber-900/60 to-amber-950/80",
    tag:    "bg-amber-500/15 text-amber-300",
  },
  indigo: {
    badge:  "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
    border: "border-indigo-500/20",
    accent: "bg-indigo-500/10",
    header: "from-indigo-900/60 to-indigo-950/80",
    tag:    "bg-indigo-500/15 text-indigo-300",
  },
  rose: {
    badge:  "bg-rose-500/15 text-rose-300 border-rose-500/25",
    border: "border-rose-500/20",
    accent: "bg-rose-500/10",
    header: "from-rose-900/60 to-rose-950/80",
    tag:    "bg-rose-500/15 text-rose-300",
  },
  teal: {
    badge:  "bg-teal-500/15 text-teal-300 border-teal-500/25",
    border: "border-teal-500/20",
    accent: "bg-teal-500/10",
    header: "from-teal-900/60 to-teal-950/80",
    tag:    "bg-teal-500/15 text-teal-300",
  },
  sky: {
    badge:  "bg-sky-500/15 text-sky-300 border-sky-500/25",
    border: "border-sky-500/20",
    accent: "bg-sky-500/10",
    header: "from-sky-900/60 to-sky-950/80",
    tag:    "bg-sky-500/15 text-sky-300",
  },
  green: {
    badge:  "bg-green-500/15 text-green-300 border-green-500/25",
    border: "border-green-500/20",
    accent: "bg-green-500/10",
    header: "from-green-900/60 to-green-950/80",
    tag:    "bg-green-500/15 text-green-300",
  },
  violet: {
    badge:  "bg-violet-500/15 text-violet-300 border-violet-500/25",
    border: "border-violet-500/20",
    accent: "bg-violet-500/10",
    header: "from-violet-900/60 to-violet-950/80",
    tag:    "bg-violet-500/15 text-violet-300",
  },
};

function getColors(color: string) {
  return COLOR_MAP[color] ?? COLOR_MAP.emerald;
}

// ─── Dhikr Card ───────────────────────────────────────────────────────────────

type CopyState = "idle" | "copied";
type ShareState = "idle" | "shared";

const DhikrCard = memo(function DhikrCard({
  item,
  index,
  color,
}: {
  item: DhikrItem;
  index: number;
  color: string;
}) {
  const { isBookmarked, toggleBookmark } = useTasbeehBookmarks();
  const [expanded, setExpanded] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [shareState, setShareState] = useState<ShareState>("idle");

  const bookmarked = isBookmarked(item.id);
  const colors = getColors(color);

  const shareText = useMemo(
    () =>
      `${item.arabic}\n\n${item.transliteration}\n\n"${item.english}"\n\n— ${item.reference}\n\nShared from Quran Al-Falah · قرآن الفلاح`,
    [item]
  );

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try { await navigator.share({ text: shareText }); return; } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setShareState("shared");
      setTimeout(() => setShareState("idle"), 2000);
    } catch { /* blocked */ }
  }, [shareText]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch { /* blocked */ }
  }, [shareText]);

  const handleBookmark = useCallback(() => {
    toggleBookmark({
      id: item.id,
      arabic: item.arabic,
      transliteration: item.transliteration,
      english: item.english,
      categoryId: item.categoryId,
    });
  }, [item, toggleBookmark]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.04, 0.3), ease: "easeOut" }}
      className={cn(
        "rounded-2xl bg-card border shadow-sm overflow-hidden",
        colors.border
      )}
      style={{ transform: "translateZ(0)" }}
    >
      {/* Colour accent bar */}
      <div className={cn("h-0.5 w-full bg-gradient-to-r", `from-transparent via-${color}-400/60 to-transparent`)} />

      <div className="p-5">
        {/* Top row: reference + count badge + bookmark */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", colors.badge)}>
              {item.reference}
            </span>
            {item.count && item.count !== "—" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {item.count}
              </span>
            )}
          </div>
          <button
            onClick={handleBookmark}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
            className={cn(
              "shrink-0 p-1.5 rounded-full transition-all",
              bookmarked
                ? "text-amber-400 bg-amber-400/15"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {bookmarked
              ? <BookmarkCheck className="w-4 h-4" strokeWidth={2} />
              : <Bookmark className="w-4 h-4" strokeWidth={2} />}
          </button>
        </div>

        {/* Arabic text */}
        <p
          className="font-arabic text-right text-foreground leading-loose mb-3 w-full"
          dir="rtl"
          style={{ fontSize: "clamp(1.25rem, 4vw, 1.6rem)", fontWeight: 700 }}
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
          className="font-arabic text-right text-muted-foreground text-sm leading-relaxed mb-3"
          dir="rtl"
        >
          {item.urdu}
        </p>

        {/* Expandable explanation */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-1"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
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
              <p className={cn("text-xs leading-relaxed text-muted-foreground rounded-xl p-3 mt-2", colors.accent)}>
                {item.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 px-5 pb-4 pt-1 border-t border-border/50">
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
          {copyState === "copied"
            ? <Check className="w-3 h-3 text-green-500" strokeWidth={2.5} />
            : <Copy className="w-3 h-3" strokeWidth={2} />}
          {copyState === "copied" ? "Copied!" : "Copy"}
        </button>
      </div>
    </motion.article>
  );
});

// ─── Category section ─────────────────────────────────────────────────────────

const CategorySection = memo(function CategorySection({
  category,
  items,
}: {
  category: DhikrCategory;
  items: DhikrItem[];
}) {
  const colors = getColors(category.color);

  if (items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mb-10"
    >
      {/* Section header */}
      <div className={cn("rounded-2xl p-4 mb-4 bg-gradient-to-br border", colors.border, colors.header)}>
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-hidden="true">{category.icon}</span>
          <div>
            <h2 className="text-base font-bold text-foreground leading-tight">{category.title}</h2>
            <p className="font-arabic text-sm text-muted-foreground" dir="rtl">{category.arabicTitle}</p>
          </div>
          <span className={cn("ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full", colors.tag)}>
            {items.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{category.description}</p>
      </div>

      {/* Dhikr cards */}
      <div className="grid gap-3 sm:grid-cols-1">
        {items.map((item, i) => (
          <DhikrCard key={item.id} item={item} index={i} color={category.color} />
        ))}
      </div>
    </motion.section>
  );
});

// ─── Asma ul Husna link card ──────────────────────────────────────────────────

function AsmaulHusnaCard() {
  const [, navigate] = useLocation();
  const colors = getColors("violet");

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mb-10"
    >
      {/* Section header */}
      <div className={cn("rounded-2xl p-4 mb-4 bg-gradient-to-br border", colors.border, colors.header)}>
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-hidden="true">✨</span>
          <div>
            <h2 className="text-base font-bold text-foreground leading-tight">Names of Allah</h2>
            <p className="font-arabic text-sm text-muted-foreground" dir="rtl">أسماء الله الحسنى</p>
          </div>
          <span className={cn("ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full", colors.tag)}>
            99
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          All 99 beautiful names of Allah with Arabic, transliteration, meaning, and explanation
        </p>
      </div>

      {/* Link card */}
      <button
        onClick={() => navigate("/asmaul-husna")}
        className={cn(
          "w-full text-left rounded-2xl bg-card border shadow-sm overflow-hidden transition-shadow hover:shadow-md",
          colors.border
        )}
      >
        <div className={cn("h-0.5 w-full bg-gradient-to-r", "from-transparent via-violet-400/60 to-transparent")} />
        <div className="p-5 flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0", colors.accent)}>
            ✨
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-sm">Asma ul Husna — 99 Names of Allah</p>
            <p className="font-arabic text-right text-muted-foreground text-sm mt-0.5" dir="rtl">أسماء الله الحسنى</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Browse all 99 names with full Arabic, transliteration, meaning, and explanation — searchable and beautifully presented.
            </p>
          </div>
          <ExternalLink className={cn("w-4 h-4 shrink-0", "text-violet-400")} strokeWidth={2} />
        </div>
      </button>
    </motion.section>
  );
}

// ─── Category filter chips ────────────────────────────────────────────────────

const ALL_ID = "__all__";
const ASMAUL_ID = "asmaul-husna";

type FilterId = string;

function CategoryChips({
  active,
  onChange,
}: {
  active: FilterId;
  onChange: (id: FilterId) => void;
}) {
  const all = [
    { id: ALL_ID, title: "All", icon: "📿" },
    ...DHIKR_CATEGORIES,
    { id: ASMAUL_ID, title: "Names of Allah", icon: "✨" },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:-mx-8 lg:px-8">
      {all.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={cn(
            "shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border",
            active === cat.id
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
          )}
        >
          <span role="img" aria-hidden="true">{cat.icon}</span>
          {cat.title}
        </button>
      ))}
    </div>
  );
}

// ─── Empty search state ───────────────────────────────────────────────────────

function EmptySearch({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center gap-4"
    >
      <span className="text-4xl" role="img" aria-label="search">🔍</span>
      <div>
        <p className="font-semibold text-foreground">No dhikr found</p>
        <p className="text-sm text-muted-foreground mt-1">
          No results for "<span className="text-primary">{query}</span>"
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Try searching in English, Arabic, or transliteration
        </p>
      </div>
    </motion.div>
  );
}

// ─── Search results view ──────────────────────────────────────────────────────

function SearchResults({ items }: { items: DhikrItem[] }) {
  // Resolve category color per result
  const catMap = useMemo(
    () => Object.fromEntries(DHIKR_CATEGORIES.map((c) => [c.id, c.color])),
    []
  );

  return (
    <div className="grid gap-3">
      {items.map((item, i) => (
        <DhikrCard
          key={item.id}
          item={item}
          index={i}
          color={catMap[item.categoryId] ?? "emerald"}
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TasbeehPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterId>(ALL_ID);

  const isSearching = query.trim().length > 0;

  const searchResults = useMemo(
    () => (isSearching ? searchDhikr(query) : []),
    [query, isSearching]
  );

  // For non-search filtered view
  const visibleCategories = useMemo(() => {
    if (activeFilter === ALL_ID) return DHIKR_CATEGORIES;
    if (activeFilter === ASMAUL_ID) return [];
    return DHIKR_CATEGORIES.filter((c) => c.id === activeFilter);
  }, [activeFilter]);

  const showAsmaulHusna =
    !isSearching && (activeFilter === ALL_ID || activeFilter === ASMAUL_ID);

  const handleFilterChange = useCallback((id: FilterId) => {
    setActiveFilter(id);
    setQuery("");
  }, []);

  const handleClearQuery = useCallback(() => setQuery(""), []);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* ── Sticky header ── */}
      <header className="lg:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="flex flex-col min-w-0">
          <h1 className="font-bold text-foreground text-base leading-tight">Tasbeeh & Dhikr</h1>
          <p className="font-arabic text-muted-foreground text-xs" dir="rtl">التسبيح والذكر</p>
        </div>
        <div className="ml-auto font-arabic text-muted-foreground text-xs" dir="rtl">
          {DHIKR_ITEMS.length} ذكر
        </div>
      </header>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 pt-6 lg:pt-8 pb-24">

          {/* Desktop title */}
          <div className="hidden lg:flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tasbeeh & Dhikr</h1>
              <p className="font-arabic text-muted-foreground text-base mt-0.5" dir="rtl">
                التسبيح والذكر
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {DHIKR_ITEMS.length} authentic remembrances across {DHIKR_CATEGORIES.length} categories
              </p>
            </div>
            <span className="text-4xl mt-1" role="img" aria-hidden="true">📿</span>
          </div>

          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dhikr in Arabic, English, or transliteration…"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
            {query && (
              <button
                onClick={handleClearQuery}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category filter chips (hidden while searching) */}
          <AnimatePresence>
            {!isSearching && (
              <motion.div
                key="chips"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-6 overflow-hidden"
              >
                <CategoryChips active={activeFilter} onChange={handleFilterChange} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Search results ── */}
          {isSearching && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`search-${query}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {searchResults.length === 0 ? (
                  <EmptySearch query={query} />
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground mb-4">
                      {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "
                      <span className="text-primary font-medium">{query}</span>"
                    </p>
                    <SearchResults items={searchResults} />
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* ── Category sections ── */}
          {!isSearching && (
            <>
              {visibleCategories.map((cat) => (
                <CategorySection
                  key={cat.id}
                  category={cat}
                  items={getItemsByCategory(cat.id)}
                />
              ))}

              {showAsmaulHusna && <AsmaulHusnaCard />}

              {visibleCategories.length === 0 && !showAsmaulHusna && (
                <div className="py-20 text-center text-muted-foreground text-sm">
                  No dhikr in this category yet.
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
