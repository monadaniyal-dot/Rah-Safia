import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookMarked, Search, X, Quote } from "lucide-react";
import {
  hadiths,
  CATEGORIES,
  COLLECTIONS,
  type HadithCollection,
  type HadithCategory,
} from "@/lib/hadith-data";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  Faith:     "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  Prayer:    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Fasting:   "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  Charity:   "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  Pilgrimage:"bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  Manners:   "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
  Knowledge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400",
  Dhikr:     "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
};

export default function HadithPage() {
  const [activeCollection, setActiveCollection] = useState<HadithCollection>("bukhari");
  const [activeCategory, setActiveCategory] = useState<HadithCategory | "All">("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return hadiths.filter((h) => {
      if (h.collection !== activeCollection) return false;
      if (activeCategory !== "All" && h.category !== activeCategory) return false;
      if (!q) return true;
      return (
        h.title.toLowerCase().includes(q) ||
        h.narrator.toLowerCase().includes(q) ||
        h.text.toLowerCase().includes(q)
      );
    });
  }, [activeCollection, activeCategory, query]);

  /* category counts for the active collection */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: 0 };
    hadiths.forEach((h) => {
      if (h.collection !== activeCollection) return;
      counts.All = (counts.All ?? 0) + 1;
      counts[h.category] = (counts[h.category] ?? 0) + 1;
    });
    return counts;
  }, [activeCollection]);

  const activeCollectionMeta = COLLECTIONS.find((c) => c.id === activeCollection)!;

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
        {/* Sticky controls: heading + tabs + search + category filters */}
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

            {/* Collection tabs */}
            <div className="flex gap-2 p-1 bg-secondary rounded-xl w-full">
              {COLLECTIONS.map((col) => (
                <button
                  key={col.id}
                  onClick={() => {
                    setActiveCollection(col.id);
                    setActiveCategory("All");
                    setQuery("");
                  }}
                  className={cn(
                    "flex-1 flex flex-col items-center py-2 px-3 rounded-lg text-center transition-all duration-200",
                    activeCollection === col.id
                      ? "gradient-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                  )}
                >
                  <span className="text-xs font-semibold leading-tight">{col.label}</span>
                  <span
                    className={cn(
                      "font-arabic text-[11px] leading-tight mt-0.5",
                      activeCollection === col.id ? "text-white/70" : "text-muted-foreground"
                    )}
                    dir="rtl"
                  >
                    {col.arabic}
                  </span>
                </button>
              ))}
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
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${activeCollectionMeta.label}…`}
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

            {/* Category filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none -mx-4 px-4 lg:-mx-8 lg:px-8">
              {(["All", ...CATEGORIES] as const).map((cat) => {
                const count = categoryCounts[cat] ?? 0;
                if (cat !== "All" && count === 0) return null;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                      isActive
                        ? "gradient-primary text-white border-primary/30 shadow-sm"
                        : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <span>{cat}</span>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-1 py-px rounded-full",
                        isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results area */}
        <div className="flex-1 px-4 lg:px-8 py-5">

          {/* Result count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-muted-foreground">
              {filtered.length === 0
                ? "No hadiths found"
                : `${filtered.length} hadith${filtered.length !== 1 ? "s" : ""}${query ? ` for "${query}"` : ""}`}
            </p>
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs text-primary hover:underline underline-offset-2"
              >
                Clear
              </button>
            )}
          </div>

          {/* Hadith cards */}
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
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
            ) : (
              <div className="space-y-4">
                {filtered.map((hadith, idx) => (
                  <motion.article
                    key={`${hadith.collection}-${hadith.id}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.24) }}
                    className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden group"
                  >
                    {/* Card top accent bar */}
                    <div className="h-1 gradient-primary" />

                    <div className="p-5">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={cn(
                                "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                                CATEGORY_COLORS[hadith.category] ??
                                  "bg-muted text-muted-foreground"
                              )}
                            >
                              {hadith.category}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {activeCollectionMeta.label}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground text-sm leading-snug">
                            {hadith.title}
                          </h3>
                        </div>

                        {/* Quote icon */}
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                          <Quote className="w-4 h-4 text-primary/60" strokeWidth={1.5} />
                        </div>
                      </div>

                      {/* Arabic excerpt */}
                      <div className="rounded-xl bg-gold-muted/50 border border-gold/15 px-4 py-3 mb-4">
                        <p
                          className="font-arabic text-base text-primary leading-loose text-right"
                          dir="rtl"
                          lang="ar"
                        >
                          {hadith.arabic}
                        </p>
                      </div>

                      {/* English text */}
                      <p className="text-sm text-foreground leading-relaxed mb-4">
                        {hadith.text}
                      </p>

                      {/* Footer */}
                      <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center shrink-0">
                            <span className="text-white text-[9px] font-bold">
                              {hadith.narrator.charAt(0)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            Narrated by{" "}
                            <span className="font-medium text-foreground">
                              {hadith.narrator}
                            </span>
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded-md">
                          {hadith.reference}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </AnimatePresence>

          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
