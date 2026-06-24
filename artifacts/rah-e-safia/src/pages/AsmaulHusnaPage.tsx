import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAMES_OF_ALLAH, type Name } from "@/lib/asmaul-husna";

// ─── Name Card ────────────────────────────────────────────────────────────────

// Subtle color palette cycling through 6 tones so cards feel distinct
const CARD_ACCENTS = [
  { border: "border-emerald-500/30", badge: "bg-emerald-500/15 text-emerald-300", ring: "ring-emerald-500/20" },
  { border: "border-teal-500/30",    badge: "bg-teal-500/15 text-teal-300",       ring: "ring-teal-500/20"    },
  { border: "border-sky-500/30",     badge: "bg-sky-500/15 text-sky-300",         ring: "ring-sky-500/20"     },
  { border: "border-violet-500/30",  badge: "bg-violet-500/15 text-violet-300",   ring: "ring-violet-500/20"  },
  { border: "border-amber-500/30",   badge: "bg-amber-500/15 text-amber-300",     ring: "ring-amber-500/20"   },
  { border: "border-rose-500/30",    badge: "bg-rose-500/15 text-rose-300",       ring: "ring-rose-500/20"    },
];

function NameCard({ name, index }: { name: Name; index: number }) {
  const accent = CARD_ACCENTS[(name.number - 1) % CARD_ACCENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4), ease: "easeOut" }}
      className={cn(
        "relative group rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
        accent.border
      )}
    >
      {/* Number badge */}
      <span
        className={cn(
          "absolute top-3 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
          accent.badge
        )}
      >
        {name.number}
      </span>

      {/* Arabic name */}
      <p
        className="font-arabic text-right text-foreground leading-loose mb-1 pr-8"
        dir="rtl"
        style={{ fontSize: "clamp(1.15rem, 4vw, 1.45rem)" }}
      >
        {name.arabic}
      </p>

      {/* Transliteration */}
      <p className="text-[11px] font-semibold text-primary/80 uppercase tracking-widest mb-0.5">
        {name.transliteration}
      </p>

      {/* English meaning */}
      <p className="text-sm font-semibold text-foreground leading-tight mb-2">
        {name.meaning}
      </p>

      {/* Explanation */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        {name.explanation}
      </p>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AsmaulHusnaPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAMES_OF_ALLAH;
    return NAMES_OF_ALLAH.filter(
      (n) =>
        n.arabic.includes(query) ||
        n.transliteration.toLowerCase().includes(q) ||
        n.meaning.toLowerCase().includes(q) ||
        n.explanation.toLowerCase().includes(q) ||
        String(n.number) === q
    );
  }, [query]);

  return (
    <div className="min-h-full flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white shrink-0 shadow-sm">
          <Sparkles className="w-4 h-4" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="font-semibold text-foreground text-sm leading-tight">Names of Allah</h1>
          <p className="font-arabic text-muted-foreground text-xs leading-tight" dir="rtl">
            أسماء الله الحسنى
          </p>
        </div>
      </header>

      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto w-full">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="hidden lg:flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Names of Allah
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground leading-tight">
            Asma-ul-Husna
          </h2>
          <p className="font-arabic text-muted-foreground text-base mt-0.5" dir="rtl">
            أسماء الله الحسنى
          </p>

          {/* Hero banner */}
          <div className="mt-4 relative rounded-2xl overflow-hidden shadow-md"
            style={{ background: "linear-gradient(135deg, #0f2d20 0%, #1a3a2a 50%, #0a2018 100%)" }}
          >
            <div className="absolute inset-0 islamic-pattern opacity-30" aria-hidden="true" />
            <div
              className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-10 pointer-events-none"
              style={{ background: "radial-gradient(circle, #d4af37 0%, transparent 70%)" }}
              aria-hidden="true"
            />
            <div className="relative px-5 py-5">
              <p className="font-arabic text-white text-center leading-loose mb-2" style={{ fontSize: "clamp(1rem, 4vw, 1.25rem)" }} dir="rtl">
                وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا
              </p>
              <p className="text-white/60 text-xs text-center">
                "And to Allah belong the Most Beautiful Names, so call upon Him by them." — Quran 7:180
              </p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <div className="text-center px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
                  <p className="text-white text-lg font-bold leading-none">99</p>
                  <p className="text-white/50 text-[10px] mt-0.5">Names</p>
                </div>
                <div className="text-center px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
                  <p className="text-white text-lg font-bold leading-none font-arabic" dir="rtl">الحُسْنى</p>
                  <p className="text-white/50 text-[10px] mt-0.5">Al-Husna (The Most Beautiful)</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-5 relative"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, meaning, or number…"
            className="w-full rounded-2xl border border-border bg-card pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        {/* Result count */}
        {query && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground mb-4"
          >
            {filtered.length === 0
              ? "No names found."
              : `${filtered.length} name${filtered.length !== 1 ? "s" : ""} found`}
          </motion.p>
        )}

        {/* Names grid */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {filtered.map((name, i) => (
                <NameCard key={name.number} name={name} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="font-arabic text-muted-foreground text-2xl mb-2" dir="rtl">لا نتائج</p>
              <p className="text-sm text-muted-foreground">
                No names matched "{query}". Try a transliteration like "Rahman" or a meaning like "merciful".
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="font-arabic text-muted-foreground text-sm" dir="rtl">
            إِنَّ لِلَّهِ تِسْعَةً وَتِسْعِينَ اسْمًا مَنْ أَحْصَاهَا دَخَلَ الْجَنَّةَ
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            "Allah has ninety-nine names. Whoever encompasses them will enter Paradise." — Sahih Muslim 2677
          </p>
        </motion.div>
      </div>
    </div>
  );
}
