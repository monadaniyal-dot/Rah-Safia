import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookMarked, ChevronDown, ChevronUp, Loader2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TAFSEER_SOURCES,
  fetchTafseer,
  type TafseerResult,
} from "@/lib/tafseer-api";

interface TafseerPanelProps {
  surahNum: number;
  ayahNum: number;
}

export default function TafseerPanel({ surahNum, ayahNum }: TafseerPanelProps) {
  const [open, setOpen] = useState(false);
  const [sourceId, setSourceId] = useState(TAFSEER_SOURCES[0].id);
  const [result, setResult] = useState<TafseerResult | null>(null);
  const [loading, setLoading] = useState(false);
  // Cache per source so switching sources doesn't refetch
  const [cache, setCache] = useState<Record<string, TafseerResult>>({});

  const load = useCallback(
    async (sid: string) => {
      if (cache[sid]) {
        setResult(cache[sid]);
        return;
      }
      setLoading(true);
      setResult(null);
      const res = await fetchTafseer(surahNum, ayahNum, sid);
      setCache((prev) => ({ ...prev, [sid]: res }));
      setResult(res);
      setLoading(false);
    },
    [surahNum, ayahNum, cache]
  );

  const handleToggle = () => {
    if (!open) {
      setOpen(true);
      load(sourceId);
    } else {
      setOpen(false);
    }
  };

  const handleSourceChange = (sid: string) => {
    setSourceId(sid);
    if (open) load(sid);
  };

  return (
    <div className="border-t border-border/60">
      {/* Toggle button */}
      <button
        onClick={handleToggle}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors duration-150",
          open ? "bg-primary/5" : "hover:bg-secondary/40"
        )}
      >
        <BookMarked
          className={cn("w-3.5 h-3.5 shrink-0", open ? "text-primary" : "text-muted-foreground")}
          strokeWidth={1.8}
        />
        <span className={cn("text-xs font-semibold flex-1", open ? "text-primary" : "text-muted-foreground")}>
          View Tafseer
        </span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
          : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 bg-primary/3">

              {/* Source selector */}
              <div className="mb-3">
                <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-widest mb-2">
                  Tafseer Source
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {TAFSEER_SOURCES.map((src) => (
                    <button
                      key={src.id}
                      onClick={() => handleSourceChange(src.id)}
                      className={cn(
                        "text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all duration-150",
                        sourceId === src.id
                          ? "gradient-primary text-white border-primary/30 shadow-sm"
                          : "bg-secondary/80 text-muted-foreground border-border hover:text-foreground",
                        src.status === "coming-soon" && sourceId !== src.id && "opacity-60"
                      )}
                    >
                      {src.name}
                      {src.status === "coming-soon" && (
                        <span className="ml-1 opacity-70">·</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content area */}
              <div className="rounded-xl border border-border bg-card p-3 min-h-[64px] flex flex-col justify-center">
                {loading && (
                  <div className="flex items-center gap-2 text-muted-foreground py-2">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span className="text-xs">Loading tafseer…</span>
                  </div>
                )}

                {!loading && result?.kind === "text" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-widest">
                        {result.source.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50">·</span>
                      <span className="text-[10px] text-muted-foreground">{result.source.author}</span>
                    </div>
                    <p
                      className={cn(
                        "text-sm text-foreground/85 leading-relaxed",
                        result.source.lang === "urdu" && "font-arabic text-right text-base leading-[2]"
                      )}
                      dir={result.source.lang === "urdu" ? "rtl" : "ltr"}
                      lang={result.source.lang === "urdu" ? "ur" : "en"}
                    >
                      {result.text}
                    </p>
                  </motion.div>
                )}

                {!loading && result?.kind === "unavailable" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      <p className="text-xs font-semibold text-foreground">
                        {result.source.name} — Coming Soon
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {result.source.dataNote}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <p className="text-[10px] text-muted-foreground">
                        Try <strong>Tafhim-ul-Quran</strong> — available now via AlQuran.cloud
                      </p>
                    </div>
                  </motion.div>
                )}

                {!loading && result?.kind === "error" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-destructive">Could not load tafseer</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{result.message}</p>
                      <button
                        onClick={() => load(sourceId)}
                        className="text-xs text-primary hover:underline mt-1"
                      >
                        Retry
                      </button>
                    </div>
                  </motion.div>
                )}

                {!loading && !result && (
                  <p className="text-xs text-muted-foreground text-center py-2">Select a source above</p>
                )}
              </div>

              {/* Attribution */}
              {result?.kind === "text" && (
                <p className="text-[10px] text-muted-foreground/50 mt-1.5 text-right">
                  via AlQuran.cloud · {result.source.name}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
