import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  BookMarked, ChevronRight, CheckCircle2, Clock, Globe,
  Languages, Search, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TAFSEER_SOURCES, type TafseerSource } from "@/lib/tafseer-api";
import { surahs } from "@/lib/quran-data";

// ─── Language badge ───────────────────────────────────────────────────────────

const langLabel: Record<string, string> = { urdu: "اردو", english: "English", arabic: "عربي" };
const langIcon = { urdu: Languages, english: Globe, arabic: Languages };

// ─── Source card ──────────────────────────────────────────────────────────────

function SourceCard({
  source,
  index,
  selected,
  onSelect,
}: {
  source: TafseerSource;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const LangIcon = langIcon[source.lang];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border bg-card overflow-hidden shadow-sm transition-all",
        source.status === "available"
          ? selected
            ? "border-primary shadow-md ring-2 ring-primary/20"
            : "border-primary/20 hover:shadow-md hover:border-primary/40"
          : "border-border opacity-80"
      )}
    >
      <div className={cn("h-1 w-full", source.status === "available" ? "gradient-primary" : "bg-muted")} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h3 className="font-semibold text-foreground text-sm leading-tight">{source.name}</h3>
              <span className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1",
                source.status === "available"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              )}>
                {source.status === "available"
                  ? <><CheckCircle2 className="w-2.5 h-2.5" /> Available</>
                  : <><Clock className="w-2.5 h-2.5" /> Soon</>}
              </span>
            </div>
            <p className="font-arabic text-muted-foreground text-xs leading-none" dir="rtl">
              {source.urduName}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1 bg-secondary rounded-lg px-2 py-1">
            <LangIcon className="w-3 h-3 text-muted-foreground" strokeWidth={1.8} />
            <span className={cn("text-[10px] font-medium text-muted-foreground", source.lang === "urdu" && "font-arabic")}
              dir={source.lang === "urdu" ? "rtl" : "ltr"}>
              {langLabel[source.lang]}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/80 leading-relaxed mb-0.5">
          {source.author}
          <span className="font-arabic mx-1" dir="rtl"> · {source.authorUrdu}</span>
        </p>

        {/* Coming-soon note toggle */}
        {source.status === "coming-soon" && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] text-primary hover:underline mt-1 flex items-center gap-1"
            >
              {expanded ? "Hide details" : "What's needed?"}
              <ChevronRight className={cn("w-3 h-3 transition-transform", expanded && "rotate-90")} />
            </button>
            <AnimatePresence>
              {expanded && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[11px] text-muted-foreground bg-secondary/50 rounded-xl px-3 py-2 leading-relaxed mt-2 overflow-hidden"
                >
                  {source.dataNote}
                </motion.p>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Action */}
        {source.status === "available" ? (
          <button
            onClick={onSelect}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold mt-3 transition-all",
              selected
                ? "gradient-primary text-white shadow-sm"
                : "bg-primary/10 text-primary hover:bg-primary/15"
            )}
          >
            <BookMarked className="w-3.5 h-3.5" strokeWidth={2} />
            {selected ? "Browsing Surahs ↓" : "Browse Surahs"}
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-secondary border border-border text-muted-foreground text-xs font-medium mt-3">
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
            Dataset needed
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TafseerPage() {
  const [, navigate] = useLocation();
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const available = TAFSEER_SOURCES.filter((s) => s.status === "available");
  const upcoming  = TAFSEER_SOURCES.filter((s) => s.status === "coming-soon");

  const selectedSource = selectedSourceId
    ? TAFSEER_SOURCES.find((s) => s.id === selectedSourceId) ?? null
    : null;

  const filteredSurahs = useMemo(() => {
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

  const handleSourceSelect = (srcId: string) => {
    if (selectedSourceId === srcId) {
      setSelectedSourceId(null);
      return;
    }
    setSelectedSourceId(srcId);
    setTimeout(() => {
      document.getElementById("tafseer-surah-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleSurahClick = (surahNumber: number) => {
    const sourceParam = selectedSourceId ? `?source=${selectedSourceId}` : "";
    navigate(`/tafseer/surah/${surahNumber}${sourceParam}`);
  };

  return (
    <div className="min-h-full flex flex-col">

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white shrink-0 shadow-sm">
          <BookMarked className="w-4 h-4" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="font-semibold text-foreground text-sm leading-tight">Tafseer</h1>
          <p className="font-arabic text-muted-foreground text-xs leading-tight" dir="rtl">تفسیر القرآن</p>
        </div>
      </header>

      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-3xl mx-auto w-full">

        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-5"
        >
          <div className="hidden lg:flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <BookMarked className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Tafseer</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground leading-tight">Tafseer Library</h2>
          <p className="font-arabic text-muted-foreground text-base mt-0.5" dir="rtl">تفسیر القرآن الکریم</p>

          {/* Hero banner */}
          <div
            className="mt-4 relative rounded-2xl overflow-hidden shadow-md"
            style={{ background: "linear-gradient(135deg, #0f2d20 0%, #1a3a2a 50%, #0a2018 100%)" }}
          >
            <div className="absolute inset-0 islamic-pattern opacity-30" aria-hidden="true" />
            <div className="relative px-5 py-4">
              <p className="font-arabic text-white text-center leading-loose mb-1.5 text-base" dir="rtl">
                كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ
              </p>
              <p className="text-white/55 text-xs text-center">
                "A Book We have revealed to you, so they may ponder its verses." — Quran 38:29
              </p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <div className="text-center px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
                  <p className="text-white text-lg font-bold leading-none">{available.length}</p>
                  <p className="text-white/50 text-[10px] mt-0.5">Available now</p>
                </div>
                <div className="text-center px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
                  <p className="text-white text-lg font-bold leading-none">{upcoming.length}</p>
                  <p className="text-white/50 text-[10px] mt-0.5">Coming soon</p>
                </div>
                <div className="text-center px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
                  <p className="text-white text-lg font-bold leading-none">114</p>
                  <p className="text-white/50 text-[10px] mt-0.5">Surahs</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Available sources ── */}
        {available.length > 0 && (
          <section className="mb-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
              Available Now — select a source to browse
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {available.map((src, i) => (
                <SourceCard
                  key={src.id}
                  source={src}
                  index={i}
                  selected={selectedSourceId === src.id}
                  onSelect={() => handleSourceSelect(src.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Surah browser (appears when a source is selected) ── */}
        <AnimatePresence>
          {selectedSource && (
            <motion.section
              id="tafseer-surah-list"
              key="surah-browser"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mb-6"
            >
              <div className="rounded-2xl border border-primary/20 bg-card shadow-sm overflow-hidden">

                {/* Browser header */}
                <div className="px-4 pt-4 pb-3 border-b border-border/60 bg-primary/5">
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-2">
                    <span className="text-primary font-semibold">Tafseer</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-foreground font-medium">{selectedSource.name}</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>Select a Surah</span>
                  </div>

                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                        Browse Surahs
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Reading with <strong>{selectedSource.name}</strong>
                      </p>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      Live · {selectedSource.name}
                    </span>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" strokeWidth={1.8} />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search Surah by name or number…"
                      className="w-full pl-9 pr-8 py-2 rounded-xl text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    />
                    {query && (
                      <button
                        onClick={() => setQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {query && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {filteredSurahs.length === 0 ? "No surahs found" : `${filteredSurahs.length} surah${filteredSurahs.length !== 1 ? "s" : ""} found`}
                    </p>
                  )}
                </div>

                {/* Surah list */}
                <div className="divide-y divide-border/60 max-h-[480px] overflow-y-auto">
                  {filteredSurahs.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="font-arabic text-2xl text-muted-foreground/30 mb-2" dir="rtl">؟</p>
                      <p className="text-sm text-muted-foreground">No surahs match</p>
                    </div>
                  ) : (
                    filteredSurahs.map((surah, idx) => (
                      <motion.button
                        key={surah.number}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15, delay: Math.min(idx * 0.008, 0.2) }}
                        onClick={() => handleSurahClick(surah.number)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors duration-100 group"
                      >
                        {/* Number badge */}
                        <div className="shrink-0 w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
                          <span className="text-white text-xs font-bold">{surah.number}</span>
                        </div>

                        {/* Names */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">{surah.name}</span>
                            <span className={cn(
                              "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                              surah.type === "Meccan"
                                ? "bg-primary/10 text-primary"
                                : "bg-gold-muted text-gold"
                            )}>
                              {surah.type}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{surah.englishName}</p>
                        </div>

                        {/* Arabic + verse count */}
                        <div className="shrink-0 flex items-center gap-3">
                          <div className="hidden sm:block text-right">
                            <p className="font-arabic text-base text-foreground leading-none" dir="rtl">
                              {surah.arabicName}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{surah.verses} ayahs</p>
                          </div>
                          <ChevronRight
                            className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                            strokeWidth={2}
                          />
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Coming soon sources ── */}
        {upcoming.length > 0 && (
          <section className="mb-6">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
              Coming Soon
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {upcoming.map((src, i) => (
                <SourceCard
                  key={src.id}
                  source={src}
                  index={available.length + i}
                  selected={false}
                  onSelect={() => {}}
                />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          Maarif-ul-Quran via Quran.com API · Architecture ready for additional sources
        </motion.p>

      </div>
    </div>
  );
}
