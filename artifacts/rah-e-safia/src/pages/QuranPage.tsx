import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, Search, X, ChevronRight } from "lucide-react";
import { surahs } from "@/lib/quran-data";
import { cn } from "@/lib/utils";

export default function QuranPage() {
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return surahs;
    const num = parseInt(q, 10);
    return surahs.filter(
      (s) =>
        (!isNaN(num) && s.number === num) ||
        s.name.toLowerCase().includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        s.arabicName.includes(query.trim())
    );
  }, [query]);

  return (
    <div className="min-h-full flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 shadow-sm">
          <BookOpen className="w-4 h-4 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="font-semibold text-foreground text-sm leading-tight">Qur'an</h1>
          <p className="font-arabic text-muted-foreground text-xs leading-tight" dir="rtl">
            القرآن الكريم
          </p>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        {/* Sticky top section: heading + search */}
        <div className="sticky top-[60px] lg:top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 lg:px-8 pt-5 lg:pt-8 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="hidden lg:flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Qur'an
              </span>
            </div>
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-foreground leading-tight">
                  The Holy Qur'an
                </h2>
                <p className="font-arabic text-muted-foreground text-base mt-0.5" dir="rtl">
                  القرآن الكريم
                </p>
              </div>
              <p className="text-xs text-muted-foreground shrink-0 pb-1">
                114 Surahs
              </p>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" strokeWidth={1.8} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or number…"
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

            {query && (
              <p className="text-xs text-muted-foreground mt-2">
                {filtered.length === 0
                  ? "No surahs found"
                  : `${filtered.length} surah${filtered.length !== 1 ? "s" : ""} found`}
              </p>
            )}
          </motion.div>
        </div>

        {/* Surah list */}
        <div className="flex-1 px-4 lg:px-8 py-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="font-arabic text-3xl text-muted-foreground/40 mb-3" dir="rtl">؟</p>
              <p className="text-sm text-muted-foreground">No surahs match your search</p>
              <button
                onClick={() => setQuery("")}
                className="mt-3 text-xs text-primary underline-offset-2 hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((surah, idx) => (
                <motion.button
                  key={surah.number}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.012, 0.3) }}
                  onClick={() => navigate(`/quran/${surah.number}`)}
                  className="w-full flex items-center gap-4 py-3 text-left group hover:bg-secondary/50 rounded-xl px-2 -mx-2 transition-colors duration-150"
                >
                  {/* Surah number badge */}
                  <div className="shrink-0 w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-bold">{surah.number}</span>
                  </div>

                  {/* Names */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{surah.name}</span>
                      <span
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                          surah.type === "Meccan"
                            ? "bg-primary/10 text-primary"
                            : "bg-gold-muted text-gold"
                        )}
                      >
                        {surah.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{surah.englishName}</p>
                  </div>

                  {/* Arabic name + verse count */}
                  <div className="shrink-0 text-right flex items-center gap-3">
                    <div className="hidden sm:block">
                      <p className="font-arabic text-base text-foreground leading-none" dir="rtl">
                        {surah.arabicName}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {surah.verses} verses
                      </p>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-150"
                      strokeWidth={2}
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
