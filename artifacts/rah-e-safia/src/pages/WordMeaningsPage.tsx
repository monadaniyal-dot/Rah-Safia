import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, X, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROOT_MEANINGS, type RootMeaning } from "@/lib/qac-root-meanings";

// ── Build sorted entry list once ──────────────────────────────────────────────
interface RootEntry {
  root: string;
  meaning: RootMeaning;
}

const ALL_ROOTS: RootEntry[] = Object.entries(ROOT_MEANINGS)
  .map(([root, meaning]) => ({ root, meaning }))
  .sort((a, b) => a.meaning.en.localeCompare(b.meaning.en));

// ── Accent palette (cycles across cards) ──────────────────────────────────────
const ACCENTS = [
  { border: "border-emerald-500/30", badge: "bg-emerald-500/15 text-emerald-400 dark:text-emerald-300" },
  { border: "border-teal-500/30",    badge: "bg-teal-500/15 text-teal-400 dark:text-teal-300"         },
  { border: "border-sky-500/30",     badge: "bg-sky-500/15 text-sky-400 dark:text-sky-300"            },
  { border: "border-violet-500/30",  badge: "bg-violet-500/15 text-violet-400 dark:text-violet-300"   },
  { border: "border-amber-500/30",   badge: "bg-amber-500/15 text-amber-400 dark:text-amber-300"      },
  { border: "border-rose-500/30",    badge: "bg-rose-500/15 text-rose-400 dark:text-rose-300"         },
];

// ── Root card ─────────────────────────────────────────────────────────────────
function RootCard({ entry, index }: { entry: RootEntry; index: number }) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.025, 0.5), ease: "easeOut" }}
      className={cn(
        "rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
        accent.border,
      )}
    >
      {/* Arabic root — large, RTL */}
      <p
        className="font-arabic text-right text-foreground leading-loose mb-2"
        dir="rtl"
        lang="ar"
        style={{ fontSize: "clamp(1.4rem, 5vw, 1.75rem)" }}
      >
        {entry.root}
      </p>

      {/* English meaning */}
      <p className="text-sm font-semibold text-foreground leading-snug mb-1">
        {entry.meaning.en}
      </p>

      {/* Urdu meaning — only if present */}
      {entry.meaning.ur && (
        <p
          className={cn("text-xs px-2 py-0.5 rounded-full inline-block mt-0.5 font-arabic", accent.badge)}
          dir="rtl"
          lang="ur"
        >
          {entry.meaning.ur}
        </p>
      )}
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WordMeaningsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ROOTS;
    return ALL_ROOTS.filter(
      ({ root, meaning }) =>
        root.includes(query) ||
        meaning.en.toLowerCase().includes(q) ||
        (meaning.ur && meaning.ur.includes(query)),
    );
  }, [query]);

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/60 px-4 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
            <Languages className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">Word Meanings</h1>
            <p className="text-xs text-muted-foreground">
              {ALL_ROOTS.length.toLocaleString()} Quranic roots · Arabic root meanings
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in Arabic or English…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            dir="auto"
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

        {/* Result count */}
        {query && (
          <p className="text-xs text-muted-foreground mt-2 px-1">
            {filtered.length === 0
              ? "No roots found"
              : `${filtered.length.toLocaleString()} result${filtered.length === 1 ? "" : "s"}`}
          </p>
        )}
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 px-4 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-arabic text-4xl text-muted-foreground/40 mb-3" dir="rtl" lang="ar">؟</p>
            <p className="text-sm text-muted-foreground">No roots match "{query}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((entry, i) => (
              <RootCard key={entry.root} entry={entry} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
