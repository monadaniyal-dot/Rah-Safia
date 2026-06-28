import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookMarked, ChevronDown, ChevronUp, Loader2, AlertCircle, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TAFSEER_SOURCES,
  fetchTafseer,
  type TafseerResult,
} from "@/lib/tafseer-api";

interface TafseerPanelProps {
  surahNum: number;
  ayahNum: number;
  /** Pre-select a tafseer source by id (e.g. "maarif") */
  defaultSource?: string;
  /** Auto-open the panel on mount */
  autoOpen?: boolean;
}

/** Strip any <script>/<style> tags from quran.com HTML for safety */
function sanitize(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
}

export default function TafseerPanel({ surahNum, ayahNum, defaultSource, autoOpen = false }: TafseerPanelProps) {
  const resolvedDefault = defaultSource ?? TAFSEER_SOURCES[0].id;
  const [open, setOpen] = useState(autoOpen);
  const [sourceId, setSourceId] = useState(resolvedDefault);
  const [result, setResult] = useState<TafseerResult | null>(null);
  const [loading, setLoading] = useState(false);
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

  // Auto-load when autoOpen is true
  useEffect(() => {
    if (autoOpen) {
      load(resolvedDefault);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If defaultSource changes externally, update sourceId and reload
  useEffect(() => {
    if (defaultSource && defaultSource !== sourceId) {
      setSourceId(defaultSource);
      if (open) load(defaultSource);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSource]);

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
          {open ? "Hide Tafseer" : "View Tafseer"}
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
                      title={src.status === "coming-soon" ? "Coming soon — dataset needed" : undefined}
                      className={cn(
                        "text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all duration-150 flex items-center gap-1",
                        sourceId === src.id
                          ? "gradient-primary text-white border-primary/30 shadow-sm"
                          : "bg-secondary/80 text-muted-foreground border-border hover:text-foreground",
                        src.status === "coming-soon" && sourceId !== src.id && "opacity-55"
                      )}
                    >
                      {src.name}
                      {src.status === "available" && sourceId !== src.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content area */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">

                {/* Loading */}
                {loading && (
                  <div className="flex items-center gap-2 text-muted-foreground p-4">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span className="text-xs">Loading tafseer…</span>
                  </div>
                )}

                {/* ── Real tafseer text (HTML from quran.com) ── */}
                {!loading && result?.kind === "text" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Source header */}
                    <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-border/60 bg-secondary/30">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-primary uppercase tracking-widest">
                          {result.source.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {result.source.author}
                        </p>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                        Live
                      </span>
                    </div>

                    {/* Tafseer prose */}
                    <div
                      className={cn(
                        "tafseer-prose px-4 py-3 text-foreground/85 leading-relaxed max-h-[420px] overflow-y-auto",
                        result.source.lang === "arabic"
                          ? "font-arabic text-lg leading-[2.1] text-right"
                          : "text-sm leading-relaxed"
                      )}
                      dir={result.source.lang === "arabic" ? "rtl" : "ltr"}
                      dangerouslySetInnerHTML={{ __html: sanitize(result.text) }}
                    />

                    {/* Attribution */}
                    <div className="px-4 py-2 border-t border-border/40 bg-secondary/20">
                      <p className="text-[10px] text-muted-foreground/60">
                        {result.source.name} · {result.source.author} · via Quran.com
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Coming soon */}
                {!loading && result?.kind === "unavailable" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      <p className="text-xs font-semibold text-foreground">
                        {result.source.name} — Not yet available
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {result.source.dataNote}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <p className="text-[10px] text-muted-foreground">
                        Try <strong>Maarif-ul-Quran</strong> — available now with full commentary
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Error */}
                {!loading && result?.kind === "error" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-destructive">Could not load tafseer</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{result.message}</p>
                      <button
                        onClick={() => {
                          setCache((prev) => { const n = { ...prev }; delete n[sourceId]; return n; });
                          load(sourceId);
                        }}
                        className="flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                      >
                        <RefreshCw className="w-3 h-3" strokeWidth={2} />
                        Retry
                      </button>
                    </div>
                  </motion.div>
                )}

                {!loading && !result && (
                  <p className="text-xs text-muted-foreground text-center p-4">Select a source above</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
