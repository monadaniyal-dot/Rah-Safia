/**
 * RootMeaningSearchPage — reverse lookup: English keyword → Quranic Arabic roots.
 *
 * The user types English concepts (e.g. "mercy", "justice") and sees every
 * matching root from the curated qac-root-meanings table, together with the
 * total number of times that root appears in the Quran and a tap-through to
 * its first occurrence.
 */

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronRight,
  BookOpen,
  Loader2,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  searchRootsByMeaning,
  type RootSearchResult,
} from "@/lib/qac-root-meanings";
import { lookupRootOccurrences, preloadQACData } from "@/lib/word-study-api";

// ─── Suggestion chips ─────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "mercy", "forgiveness", "guidance", "justice", "patience",
  "paradise", "prayer", "knowledge", "truth", "creation",
  "faith", "gratitude", "light", "fear", "love",
];

// ─── Result row ───────────────────────────────────────────────────────────────

interface ResultRowProps {
  result: RootSearchResult;
  index: number;
  onNavigate: (surahNum: number, ayahNum: number) => void;
}

function ResultRow({ result, index, onNavigate }: ResultRowProps) {
  const [occCount, setOccCount] = useState<number | null>(null);
  const [occLoading, setOccLoading] = useState(true);
  const [firstPos, setFirstPos] = useState<[number, number] | null>(null);
  const fetched = useRef(false);

  // Lazy-load occurrence count for this root
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    lookupRootOccurrences(result.root)
      .then((entry) => {
        setOccLoading(false);
        if (entry) {
          setOccCount(entry.c);
          if (entry.w.length > 0) {
            const [s, a] = entry.w[0];
            setFirstPos([s, a]);
          }
        } else {
          setOccCount(null);
        }
      })
      .catch(() => {
        setOccLoading(false);
        setOccCount(null);
      });
  }, [result.root]);

  const handleClick = useCallback(() => {
    if (firstPos) onNavigate(firstPos[0], firstPos[1]);
  }, [firstPos, onNavigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.03, duration: 0.2 } }}
      className="rounded-2xl border border-border/60 bg-card overflow-hidden"
    >
      <div className="flex items-stretch">
        {/* Root badge */}
        <div className="shrink-0 w-16 flex flex-col items-center justify-center gap-0.5 bg-primary/8 border-r border-border/50 py-3">
          <span
            className="font-arabic text-lg font-bold text-primary leading-none"
            dir="rtl"
            lang="ar"
          >
            {result.root}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 px-3 py-3 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-snug">
            {result.meaning.en}
          </p>
          {result.meaning.ur && (
            <p
              className="text-xs text-muted-foreground font-arabic mt-0.5 leading-relaxed"
              dir="rtl"
              lang="ur"
            >
              {result.meaning.ur}
            </p>
          )}

          {/* Occurrence count */}
          <div className="flex items-center gap-2 mt-2">
            {occLoading ? (
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/50" strokeWidth={2} />
            ) : occCount !== null ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary/80 bg-primary/8 border border-primary/15 px-2 py-0.5 rounded-full">
                <BookOpen className="w-2.5 h-2.5" strokeWidth={2} />
                {occCount.toLocaleString()} occurrence{occCount !== 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground/50 italic">
                Count unavailable
              </span>
            )}
          </div>
        </div>

        {/* Tap to navigate */}
        {firstPos && (
          <button
            onClick={handleClick}
            className="shrink-0 flex flex-col items-center justify-center gap-0.5 px-3 border-l border-border/50 hover:bg-accent transition-colors duration-150 group"
            aria-label={`Navigate to first occurrence of root ${result.root}`}
          >
            <ChevronRight
              className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors"
              strokeWidth={2}
            />
            <span className="text-[9px] text-muted-foreground/40 group-hover:text-primary/60 uppercase tracking-wide leading-none transition-colors">
              Go
            </span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RootMeaningSearchPage() {
  const search = useSearch();
  const initialQuery = new URLSearchParams(search).get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  // Kick off QAC root data loading immediately on mount so that by the time
  // results appear the cache is already warm and all ResultRow occurrence
  // counts resolve simultaneously from the shared promise/cache.
  useEffect(() => {
    preloadQACData();
  }, []);

  // Debounce search input by 200 ms
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(id);
  }, [query]);

  const results: RootSearchResult[] = useMemo(
    () => (debouncedQuery.trim() ? searchRootsByMeaning(debouncedQuery.trim()) : []),
    [debouncedQuery],
  );

  const handleNavigate = useCallback(
    (surahNum: number, ayahNum: number) => {
      navigate(`/quran/${surahNum}?ayah=${ayahNum}`);
    },
    [navigate],
  );

  const handleSuggestion = useCallback((s: string) => {
    setQuery(s);
    inputRef.current?.focus();
  }, []);

  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <div className="min-h-full flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/quran")}
          className="w-8 h-8 rounded-lg bg-secondary hover:bg-accent flex items-center justify-center shrink-0 transition-colors"
          aria-label="Back to Quran"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground rotate-180" strokeWidth={2} />
        </button>
        <div>
          <h1 className="font-semibold text-foreground text-sm leading-tight">Root Meaning Search</h1>
          <p className="text-muted-foreground text-xs leading-tight">Find roots by English concept</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        {/* Sticky search section */}
        <div className="sticky top-[60px] lg:top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 lg:px-8 pt-5 lg:pt-8 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="hidden lg:flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <Search className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Root Meaning Search
              </span>
            </div>
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-foreground leading-tight">
                  Find Roots by Meaning
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Type an English concept to find matching Quranic roots
                </p>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                strokeWidth={1.8}
              />
              <input
                ref={inputRef}
                type="search"
                aria-label="Search roots by English meaning"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. mercy, justice, guidance…"
                autoFocus
                className={cn(
                  "w-full pl-10 pr-10 py-2.5 rounded-xl text-sm",
                  "bg-secondary border border-border",
                  "text-foreground placeholder:text-muted-foreground",
                  "outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
                  "transition-all duration-200",
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

            {hasQuery && (
              <p className="text-xs text-muted-foreground mt-2">
                {results.length === 0
                  ? "No roots found"
                  : `${results.length} root${results.length !== 1 ? "s" : ""} found`}
              </p>
            )}
          </motion.div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 lg:px-8 py-4 space-y-3">
          <AnimatePresence mode="wait">
            {/* Empty state — show suggestions */}
            {!hasQuery && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 pt-4"
              >
                {/* How it works */}
                <div className="rounded-2xl border border-border/50 bg-muted/20 px-4 py-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" strokeWidth={1.8} />
                    <p className="text-sm font-semibold text-foreground">How it works</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Type any English concept — like <em>mercy</em>, <em>patience</em>, or
                    <em> creation</em> — and this tool finds the Arabic roots from the Quran
                    that carry that meaning, along with how many times each root appears in
                    the Quran. Tap a result to navigate to its first occurrence.
                  </p>
                </div>

                {/* Suggestion chips */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    Try these
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestion(s)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-secondary border border-border text-foreground/75 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors duration-150"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* No results */}
            {hasQuery && results.length === 0 && (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center justify-center py-20 text-center gap-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-muted-foreground/40" strokeWidth={1.5} />
                </div>
                <div className="space-y-1.5">
                  <p className="font-medium text-foreground text-sm">
                    No roots found for{" "}
                    <span className="text-primary">"{debouncedQuery.trim()}"</span>
                  </p>
                  <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
                    Try a different English keyword, or use simpler terms like "mercy" or "light"
                  </p>
                </div>
                <button
                  onClick={() => setQuery("")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/8 hover:bg-primary/14 text-primary text-xs font-semibold transition-colors duration-200 border border-primary/15"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Clear search
                </button>
              </motion.div>
            )}

            {/* Results list */}
            {hasQuery && results.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-2.5"
              >
                {results.map((r, i) => (
                  <ResultRow
                    key={r.root}
                    result={r}
                    index={i}
                    onNavigate={handleNavigate}
                  />
                ))}

                {results.length >= 50 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Showing top 50 results — refine your search for more specific results
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
