import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookMarked,
  Search,
  X,
  Quote,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import {
  fetchCollection,
  COLLECTIONS,
  SMART_CATEGORIES,
  bestGrade,
  classifyGrade,
  type CollectionId,
  type HadithEntry,
} from "@/lib/hadith-api";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 30;

// ─── Grade badge ─────────────────────────────────────────────────────────────
const GRADE_STYLES: Record<string, string> = {
  sahih:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  hasan:   "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  daif:    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  mawdu:   "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  unknown: "bg-secondary text-muted-foreground",
};

function GradeBadge({ grades }: { grades: HadithEntry["grades"] }) {
  const g = bestGrade(grades);
  if (!g) return null;
  const level = classifyGrade(g.grade);
  return (
    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1", GRADE_STYLES[level])}>
      <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2.5} />
      {g.grade}
    </span>
  );
}

// ─── Hadith card ─────────────────────────────────────────────────────────────
function HadithCard({
  hadith,
  collectionLabel,
  idx,
}: {
  hadith: HadithEntry;
  collectionLabel: string;
  idx: number;
}) {
  const [arabicExpanded, setArabicExpanded] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, delay: Math.min(idx * 0.03, 0.3) }}
      className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden"
    >
      <div className="h-1 gradient-primary" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <GradeBadge grades={hadith.grades} />
            <span className="text-[10px] text-muted-foreground">{collectionLabel}</span>
          </div>
          <div className="shrink-0 flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded-md">
              #{hadith.hadithnumber}
            </span>
            <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
              <Quote className="w-3.5 h-3.5 text-primary/60" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Arabic block */}
        {hadith.arabicText && (
          <div className="rounded-xl bg-gold-muted/50 border border-gold/15 px-4 py-3 mb-4">
            <p
              className={cn(
                "font-arabic text-base text-primary leading-loose text-right",
                !arabicExpanded && "line-clamp-3"
              )}
              dir="rtl"
              lang="ar"
            >
              {hadith.arabicText}
            </p>
            {hadith.arabicText.length > 240 && (
              <button
                onClick={() => setArabicExpanded((v) => !v)}
                className="mt-1.5 text-[10px] text-primary/70 hover:text-primary transition-colors flex items-center gap-1 ml-auto"
              >
                {arabicExpanded ? "Show less" : "Show full Arabic"}
                <ChevronDown
                  className={cn("w-3 h-3 transition-transform", arabicExpanded && "rotate-180")}
                  strokeWidth={2}
                />
              </button>
            )}
          </div>
        )}

        {/* English text */}
        <p className="text-sm text-foreground leading-relaxed mb-4">{hadith.text}</p>

        {/* Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {hadith.narrator ? (
              <>
                <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <span className="text-white text-[9px] font-bold">
                    {hadith.narrator.charAt(0)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  Narrated by{" "}
                  <span className="font-medium text-foreground">{hadith.narrator}</span>
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic">Narrator not specified</p>
            )}
          </div>
          {hadith.reference?.book != null && (
            <span className="shrink-0 text-[10px] text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded-md">
              Book {hadith.reference.book}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HadithPage() {
  const [activeCollection, setActiveCollection] = useState<CollectionId>("bukhari");
  const [allHadiths, setAllHadiths] = useState<HadithEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  const load = useCallback(
    async (id: CollectionId) => {
      setLoading(true);
      setError(null);
      setAllHadiths([]);
      setDisplayCount(PAGE_SIZE);
      try {
        const entries = await fetchCollection(id);
        setAllHadiths(entries);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load hadith collection.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load(activeCollection);
  }, [activeCollection, load]);

  const collectionMeta = COLLECTIONS.find((c) => c.id === activeCollection)!;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cat = activeCategory;

    return allHadiths.filter((h) => {
      if (cat !== "All") {
        const catDef = SMART_CATEGORIES.find((sc) => sc.label === cat);
        if (catDef) {
          const haystack = (h.text + " " + h.narrator).toLowerCase();
          const matches = catDef.keywords.some((kw) => haystack.includes(kw));
          if (!matches) return false;
        }
      }
      if (!q) return true;
      const haystack = (h.text + " " + h.narrator).toLowerCase();
      return haystack.includes(q);
    });
  }, [allHadiths, query, activeCategory]);

  const displayed = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  function switchCollection(id: CollectionId) {
    if (id === activeCollection) return;
    setActiveCollection(id);
    setQuery("");
    setActiveCategory("All");
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 shadow-sm">
          <BookMarked className="w-4 h-4 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="font-semibold text-foreground text-sm leading-tight">Hadith</h1>
          <p className="font-arabic text-muted-foreground text-xs leading-tight" dir="rtl">
            الحديث الشريف
          </p>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        {/* Sticky controls */}
        <div className="sticky top-[60px] lg:top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="px-4 lg:px-8 pt-5 lg:pt-8 pb-4 space-y-4">

            {/* Page heading */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="hidden lg:flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                  <BookMarked className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  Hadith
                </span>
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-foreground leading-tight">
                Hadith Collections
              </h2>
              <p className="font-arabic text-muted-foreground text-base mt-0.5" dir="rtl">
                الحديث الشريف
              </p>
            </motion.div>

            {/* Collection selector — horizontally scrollable pills */}
            <div className="-mx-4 px-4 lg:-mx-8 lg:px-8">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {COLLECTIONS.map((col) => {
                  const isActive = activeCollection === col.id;
                  return (
                    <button
                      key={col.id}
                      onClick={() => switchCollection(col.id)}
                      className={cn(
                        "shrink-0 flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 border",
                        isActive
                          ? "gradient-primary text-white border-transparent shadow-sm"
                          : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30 hover:bg-accent"
                      )}
                    >
                      <span className={cn("text-xs font-semibold leading-tight", isActive ? "text-white" : "")}>
                        {col.shortLabel}
                      </span>
                      <span
                        className={cn(
                          "font-arabic text-[11px] leading-tight mt-0.5",
                          isActive ? "text-white/70" : "text-muted-foreground"
                        )}
                        dir="rtl"
                      >
                        {col.arabic}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                strokeWidth={1.8}
              />
              <input
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setDisplayCount(PAGE_SIZE); }}
                placeholder={`Search ${collectionMeta.label}…`}
                disabled={loading}
                className={cn(
                  "w-full pl-10 pr-10 py-2.5 rounded-xl text-sm",
                  "bg-secondary border border-border",
                  "text-foreground placeholder:text-muted-foreground",
                  "outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
                  "transition-all duration-200 disabled:opacity-50"
                )}
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setDisplayCount(PAGE_SIZE); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Smart category chips */}
            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none -mx-4 px-4 lg:-mx-8 lg:px-8">
              {(["All", ...SMART_CATEGORIES.map((c) => c.label)] as const).map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setDisplayCount(PAGE_SIZE); }}
                    disabled={loading}
                    className={cn(
                      "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border disabled:opacity-40",
                      isActive
                        ? "gradient-primary text-white border-primary/30 shadow-sm"
                        : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 px-4 lg:px-8 py-5">

          {/* Loading state */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 gap-4"
            >
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                <Loader2 className="w-6 h-6 text-white animate-spin" strokeWidth={2} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Loading {collectionMeta.label}</p>
                <p className="text-xs text-muted-foreground mt-1 font-arabic" dir="rtl">
                  {collectionMeta.arabic}
                </p>
              </div>
              <p className="text-xs text-muted-foreground max-w-xs text-center">
                {collectionMeta.description}
              </p>
            </motion.div>
          )}

          {/* Error state */}
          {!loading && error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" strokeWidth={1.8} />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Could not load collection</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">{error}</p>
              </div>
              <button
                onClick={() => load(activeCollection)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium gradient-primary text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
                Try again
              </button>
            </motion.div>
          )}

          {/* Collection info banner */}
          {!loading && !error && allHadiths.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-5 rounded-2xl bg-primary/5 border border-primary/10 px-5 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-primary" strokeWidth={1.8} />
                    <span className="text-sm font-semibold text-foreground">{collectionMeta.label}</span>
                    <span className="font-arabic text-xs text-muted-foreground" dir="rtl">{collectionMeta.arabic}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {collectionMeta.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {collectionMeta.compiler} · {collectionMeta.died}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="flex items-center gap-1 justify-end text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                    <span className="text-[10px] font-semibold">Available</span>
                  </div>
                  <p className="text-xs font-bold text-foreground mt-0.5">
                    {allHadiths.length.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">hadiths</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results count */}
          {!loading && !error && allHadiths.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground">
                {filtered.length === 0
                  ? "No hadiths found"
                  : query || activeCategory !== "All"
                    ? `${filtered.length.toLocaleString()} result${filtered.length !== 1 ? "s" : ""}${query ? ` for "${query}"` : ""}${activeCategory !== "All" ? ` · ${activeCategory}` : ""}`
                    : `Showing ${Math.min(displayed.length, filtered.length).toLocaleString()} of ${filtered.length.toLocaleString()} hadiths`}
              </p>
              {(query || activeCategory !== "All") && (
                <button
                  onClick={() => { setQuery(""); setActiveCategory("All"); setDisplayCount(PAGE_SIZE); }}
                  className="text-xs text-primary hover:underline underline-offset-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Hadith cards */}
          <AnimatePresence mode="popLayout">
            {!loading && !error && filtered.length === 0 && allHadiths.length > 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <p className="font-arabic text-4xl text-muted-foreground/30 mb-3" dir="rtl">؟</p>
                <p className="text-sm text-muted-foreground">No hadiths match your search</p>
                <button
                  onClick={() => { setQuery(""); setActiveCategory("All"); }}
                  className="mt-3 text-xs text-primary underline-offset-2 hover:underline"
                >
                  Clear filters
                </button>
              </motion.div>
            )}

            {!loading && !error && (
              <div className="space-y-4">
                {displayed.map((hadith, idx) => (
                  <HadithCard
                    key={`${activeCollection}-${hadith.hadithnumber}`}
                    hadith={hadith}
                    collectionLabel={collectionMeta.shortLabel}
                    idx={idx}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Load more */}
          {!loading && !error && hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 flex flex-col items-center gap-2"
            >
              <button
                onClick={() => setDisplayCount((n) => n + PAGE_SIZE)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium gradient-primary text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                <ChevronDown className="w-4 h-4" strokeWidth={2} />
                Load more ({(filtered.length - displayCount).toLocaleString()} remaining)
              </button>
              <p className="text-xs text-muted-foreground">
                Showing {displayCount.toLocaleString()} of {filtered.length.toLocaleString()}
              </p>
            </motion.div>
          )}

          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
