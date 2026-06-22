import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Languages, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { surahs } from "@/lib/quran-data";
import { fetchSurah, isSajda, type ApiAyah } from "@/lib/quran-api";
import {
  TRANSLATION_MODES,
  showUrdu,
  showEnglish,
  type TranslationMode,
} from "@/lib/surah-translations";
import { cn } from "@/lib/utils";

/* ── Ayah skeleton loader ── */
function AyahSkeleton({ index }: { index: number }) {
  return (
    <div
      className="rounded-2xl border border-border bg-secondary/30 p-4 animate-pulse"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-muted" />
        <div className="h-3 w-28 rounded-full bg-muted" />
      </div>
      <div className="space-y-2 text-right">
        <div className="h-5 w-full rounded-full bg-muted ml-auto" />
        <div className="h-5 w-4/5 rounded-full bg-muted ml-auto" />
        <div className="h-5 w-3/5 rounded-full bg-muted ml-auto" />
      </div>
    </div>
  );
}

/* ── Single ayah card ── */
function AyahCard({
  ayah,
  surahName,
  surahNumber,
  mode,
  index,
}: {
  ayah: ApiAyah;
  surahName: string;
  surahNumber: number;
  mode: TranslationMode;
  index: number;
}) {
  const hasSajda = isSajda(ayah);
  const displayUrdu = showUrdu(mode);
  const displayEnglish = showEnglish(mode);
  const showTranslation = displayUrdu || displayEnglish;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.5) }}
      className="rounded-2xl border border-primary/12 bg-card shadow-sm overflow-hidden"
    >
      {/* Ayah header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm shrink-0">
            <span className="text-white text-xs font-bold">{ayah.numberInSurah}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">
              {surahName} {surahNumber}:{ayah.numberInSurah}
            </span>
            <span className="text-[10px] text-muted-foreground/60 ml-2">
              Juz {ayah.juz} · P.{ayah.page}
            </span>
          </div>
        </div>
        {hasSajda && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gold-muted text-gold border border-gold/20">
            ۩ Sajda
          </span>
        )}
      </div>

      <div className="px-4 pb-4">
        {/* Arabic text */}
        <p
          className="font-arabic text-2xl text-foreground leading-[2.2] text-right py-3"
          dir="rtl"
          lang="ar"
        >
          {ayah.text}
        </p>

        {/* Translation section */}
        <AnimatePresence>
          {showTranslation && (
            <motion.div
              key="translation-note"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border/60 pt-3">
                {displayUrdu && (
                  <div className="mb-2">
                    <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-wide">
                      اردو
                    </span>
                    <p className="text-xs text-muted-foreground italic mt-1">
                      Urdu translation coming soon
                    </p>
                  </div>
                )}
                {displayEnglish && (
                  <div>
                    <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-wide">
                      English
                    </span>
                    <p className="text-xs text-muted-foreground italic mt-1">
                      English translation coming soon
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

/* ── Main page ── */
export default function SurahPage() {
  const { number } = useParams<{ number: string }>();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<TranslationMode>("arabic");
  const [ayahs, setAyahs] = useState<ApiAyah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const surahNum = parseInt(number ?? "1", 10);
  const surah = surahs.find((s) => s.number === surahNum);

  const load = (num: number) => {
    setIsLoading(true);
    setError(null);
    fetchSurah(num)
      .then((data) => {
        setAyahs(data.ayahs);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message ?? "Failed to load surah");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    setAyahs([]);
    load(surahNum);
  }, [surahNum]);

  if (!surah) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-4 p-8 text-center">
        <p className="font-arabic text-4xl text-muted-foreground/30" dir="rtl">؟</p>
        <p className="text-muted-foreground text-sm">Surah not found.</p>
        <button
          onClick={() => navigate("/quran")}
          className="text-sm text-primary hover:underline"
        >
          ← Back to Qur'an
        </button>
      </div>
    );
  }

  const hasBismillah = surahNum !== 9;
  const showBismillahBanner = hasBismillah && surahNum !== 1;

  return (
    <div className="min-h-full flex flex-col">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">

        {/* Row 1: Back + surah title */}
        <div className="px-4 lg:px-8 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/quran")}
            className="w-8 h-8 rounded-lg bg-secondary hover:bg-accent flex items-center justify-center shrink-0 transition-colors"
            aria-label="Back to Qur'an"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" strokeWidth={2} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-foreground text-sm leading-tight truncate">
              {surah.name}
            </h1>
            <p className="text-xs text-muted-foreground leading-tight">
              Surah {surahNum} ·{" "}
              {isLoading ? "…" : `${ayahs.length} of ${surah.verses}`} verses · {surah.type}
            </p>
          </div>
          <p className="font-arabic text-lg text-foreground shrink-0" dir="rtl">
            {surah.arabicName}
          </p>
        </div>

        {/* Row 2: Language toggle */}
        <div className="px-4 lg:px-8 pb-3 flex items-center gap-2">
          <Languages
            className="w-3.5 h-3.5 text-muted-foreground shrink-0"
            strokeWidth={1.8}
          />
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {TRANSLATION_MODES.map((tm) => (
              <button
                key={tm.id}
                onClick={() => setMode(tm.id)}
                title={tm.label}
                className={cn(
                  "shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 border whitespace-nowrap",
                  mode === tm.id
                    ? "gradient-primary text-white border-primary/30 shadow-sm"
                    : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:bg-accent"
                )}
              >
                {tm.shortLabel}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 lg:px-8 py-6 max-w-2xl mx-auto w-full">

        {/* ── Surah info banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl overflow-hidden gradient-primary islamic-pattern text-white shadow-lg mb-6"
        >
          <div className="relative p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center">
                    <BookOpen className="w-3 h-3 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-xs text-white/70 uppercase tracking-wider font-medium">
                    {surah.type}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">{surah.name}</h2>
                <p className="text-white/70 text-sm mt-0.5">{surah.englishName}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-arabic text-2xl text-white leading-none" dir="rtl">
                  {surah.arabicName}
                </p>
                <p className="text-white/60 text-xs mt-1">{surah.verses} Ayahs</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/20 flex gap-4 text-xs text-white/60">
              <span>Surah #{surahNum}</span>
              <span>Page {surah.page}</span>
              <span>{surah.type} revelation</span>
            </div>
          </div>
        </motion.div>

        {/* ── Bismillah banner (surahs 2–114 except 9) ── */}
        {showBismillahBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="text-center mb-6 py-5 px-4 rounded-2xl bg-gold-muted/60 border border-gold/20"
          >
            <p className="font-arabic text-3xl text-primary leading-loose" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </motion.div>
        )}

        {/* ── Loading state ── */}
        {isLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
              <span className="text-sm">Loading {surah.name}…</span>
            </div>
            {Array.from({ length: Math.min(surah.verses, 5) }).map((_, i) => (
              <AyahSkeleton key={i} index={i} />
            ))}
          </div>
        )}

        {/* ── Error state ── */}
        {!isLoading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-16 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-destructive" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Could not load surah</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                {error}. Please check your connection and try again.
              </p>
            </div>
            <button
              onClick={() => load(surahNum)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
              Try again
            </button>
          </motion.div>
        )}

        {/* ── Ayah list ── */}
        {!isLoading && !error && ayahs.length > 0 && (
          <div className="space-y-4">
            {ayahs.map((ayah, idx) => (
              <AyahCard
                key={ayah.number}
                ayah={ayah}
                surahName={surah.name}
                surahNumber={surahNum}
                mode={mode}
                index={idx}
              />
            ))}
          </div>
        )}

        {/* ── Source attribution ── */}
        {!isLoading && !error && ayahs.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-muted-foreground mt-8"
          >
            Arabic text: Uthmani script via AlQuran.cloud API
          </motion.p>
        )}

        <div className="h-10" />
      </div>
    </div>
  );
}
