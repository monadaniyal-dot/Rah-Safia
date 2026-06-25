import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { BookMarked, ChevronRight, CheckCircle2, Clock, Globe, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { TAFSEER_SOURCES, type TafseerSource } from "@/lib/tafseer-api";

const langLabel: Record<string, string> = {
  urdu: "اردو",
  english: "English",
  arabic: "عربي",
};

const langIcon = { urdu: Languages, english: Globe, arabic: Languages };

function SourceCard({ source, index, onBrowse }: { source: TafseerSource; index: number; onBrowse: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const LangIcon = langIcon[source.lang];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border bg-card overflow-hidden shadow-sm transition-shadow hover:shadow-md",
        source.status === "available" ? "border-primary/20" : "border-border"
      )}
    >
      {/* Top accent bar */}
      <div className={cn("h-1 w-full", source.status === "available" ? "gradient-primary" : "bg-muted")} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h3 className="font-semibold text-foreground text-sm leading-tight">{source.name}</h3>
              <span
                className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1",
                  source.status === "available"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                )}
              >
                {source.status === "available"
                  ? <><CheckCircle2 className="w-2.5 h-2.5" /> Available</>
                  : <><Clock className="w-2.5 h-2.5" /> Coming Soon</>}
              </span>
            </div>
            <p
              className="font-arabic text-muted-foreground text-sm leading-none"
              dir="rtl"
            >
              {source.urduName}
            </p>
          </div>

          {/* Language badge */}
          <div className="shrink-0 flex items-center gap-1 bg-secondary rounded-lg px-2 py-1">
            <LangIcon className="w-3 h-3 text-muted-foreground" strokeWidth={1.8} />
            <span className={cn(
              "text-[10px] font-medium text-muted-foreground",
              source.lang === "urdu" && "font-arabic"
            )} dir={source.lang === "urdu" ? "rtl" : "ltr"}>
              {langLabel[source.lang]}
            </span>
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">{source.author}</span>
            <span className="font-arabic mx-1 text-muted-foreground/60">·</span>
            <span className="font-arabic" dir="rtl">{source.authorUrdu}</span>
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {source.description}
        </p>

        {/* Data note for coming-soon */}
        {source.status === "coming-soon" && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] text-primary hover:underline mb-2 flex items-center gap-1"
          >
            {expanded ? "Hide" : "What's needed to activate?"}
            <ChevronRight className={cn("w-3 h-3 transition-transform", expanded && "rotate-90")} />
          </button>
        )}
        {expanded && source.dataNote && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-[11px] text-muted-foreground bg-secondary/50 rounded-xl px-3 py-2 leading-relaxed mb-3"
          >
            {source.dataNote}
          </motion.p>
        )}

        {/* Action button */}
        {source.status === "available" ? (
          <button
            onClick={onBrowse}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-xs font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <BookMarked className="w-3.5 h-3.5" strokeWidth={2} />
            Browse Surahs with this Tafseer
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary border border-border text-muted-foreground text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
            Dataset needed — coming soon
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function TafseerPage() {
  const [, navigate] = useLocation();

  const available = TAFSEER_SOURCES.filter((s) => s.status === "available");
  const upcoming  = TAFSEER_SOURCES.filter((s) => s.status === "coming-soon");

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

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="hidden lg:flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <BookMarked className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Tafseer</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground leading-tight">
            Tafseer Library
          </h2>
          <p className="font-arabic text-muted-foreground text-base mt-0.5" dir="rtl">
            تفسیر القرآن الکریم
          </p>

          {/* Hero banner */}
          <div
            className="mt-4 relative rounded-2xl overflow-hidden shadow-md"
            style={{ background: "linear-gradient(135deg, #0f2d20 0%, #1a3a2a 50%, #0a2018 100%)" }}
          >
            <div className="absolute inset-0 islamic-pattern opacity-30" aria-hidden="true" />
            <div className="relative px-5 py-5">
              <p className="font-arabic text-white text-center leading-loose mb-2" style={{ fontSize: "clamp(0.95rem, 3.5vw, 1.15rem)" }} dir="rtl">
                كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ
              </p>
              <p className="text-white/60 text-xs text-center">
                "A Book We have revealed to you, full of blessings, so they may ponder its verses." — Quran 38:29
              </p>
              <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
                <div className="text-center px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
                  <p className="text-white text-lg font-bold leading-none">{available.length}</p>
                  <p className="text-white/50 text-[10px] mt-0.5">Available now</p>
                </div>
                <div className="text-center px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
                  <p className="text-white text-lg font-bold leading-none">{upcoming.length}</p>
                  <p className="text-white/50 text-[10px] mt-0.5">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* How to use */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="mb-6 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 flex items-start gap-3"
        >
          <BookMarked className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={1.8} />
          <p className="text-xs text-foreground/75 leading-relaxed">
            Tafseer is also available <strong>inline</strong> inside every Surah. Open any surah from the{" "}
            <button onClick={() => navigate("/quran")} className="text-primary font-semibold hover:underline">
              Qur'an section
            </button>
            , then tap <strong>"View Tafseer"</strong> below any ayah to read it with your chosen source.
          </p>
        </motion.div>

        {/* Available sources */}
        {available.length > 0 && (
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={2} />
              Available Now
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {available.map((src, i) => (
                <SourceCard
                  key={src.id}
                  source={src}
                  index={i}
                  onBrowse={() => navigate("/quran")}
                />
              ))}
            </div>
          </section>
        )}

        {/* Coming soon sources */}
        {upcoming.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" strokeWidth={2} />
              Coming Soon
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {upcoming.map((src, i) => (
                <SourceCard
                  key={src.id}
                  source={src}
                  index={available.length + i}
                  onBrowse={() => navigate("/quran")}
                />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-muted-foreground mt-10"
        >
          Available Tafseer text via AlQuran.cloud · Architecture scalable for additional sources
        </motion.p>
      </div>
    </div>
  );
}
