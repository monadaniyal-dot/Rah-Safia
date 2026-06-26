import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, RefreshCw, AlertCircle, Loader2, Bookmark as BookmarkIcon, BookmarkCheck } from "lucide-react";
import { surahs } from "@/lib/quran-data";
import { fetchSurah, isSajda, type AyahWithTranslations } from "@/lib/quran-api";
import { TRANSLATION_MODES, showUrdu, showEnglish, type TranslationMode } from "@/lib/surah-translations";
import { useBookmarks } from "@/lib/bookmarks";
import { cn } from "@/lib/utils";
import TafseerPanel from "@/components/ui/TafseerPanel";
import { saveQuranProgress } from "@/lib/reading-progress";

/* ── Skeleton loader ── */
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

/* ── Ayah card ── */
function AyahCard({
  ayah,
  surahName,
  surahNumber,
  mode,
  index,
  bookmarked,
  onToggleBookmark,
}: {
  ayah: AyahWithTranslations;
  surahName: string;
  surahNumber: number;
  mode: TranslationMode;
  index: number;
  bookmarked: boolean;
  onToggleBookmark: () => void;
}) {
  const hasSajda = isSajda(ayah);
  const displayUrdu = showUrdu(mode);
  const displayEnglish = showEnglish(mode);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.035, 0.45) }}
      className="rounded-2xl border border-primary/12 bg-card shadow-sm overflow-hidden"
    >
      {/* Ayah header row */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm shrink-0">
            <span className="text-white text-xs font-bold">{ayah.numberInSurah}</span>
          </div>
          <div className="min-w-0">
            <span className="text-xs text-muted-foreground">
              {surahName} {surahNumber}:{ayah.numberInSurah}
            </span>
            <span className="text-[10px] text-muted-foreground/60 ml-2">
              Juz {ayah.juz} · P.{ayah.page}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {hasSajda && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gold-muted text-gold border border-gold/20">
              ۩ Sajda
            </span>
          )}
          <button
            onClick={onToggleBookmark}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark this ayah"}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
              bookmarked
                ? "bg-gold-muted hover:bg-gold/20"
                : "bg-secondary hover:bg-accent"
            )}
          >
            {bookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-gold fill-gold" strokeWidth={1.8} />
            ) : (
              <BookmarkIcon className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
            )}
          </button>
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* Arabic */}
        <p
          className="font-arabic text-2xl text-foreground leading-[2.2] text-right py-3"
          dir="rtl"
          lang="ar"
        >
          {ayah.arabic}
        </p>

        {/* Translations — animated in/out */}
        <AnimatePresence>

          {/* English (Sahih International) — shown first */}
          {displayEnglish && ayah.english && (
            <motion.div
              key="english"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="border-t border-border/60 pt-3 pb-1">
                <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-wide mb-1.5">
                  English — Sahih International
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {ayah.english}
                </p>
              </div>
            </motion.div>
          )}

          {/* Urdu (Jalandhri) — shown below English */}
          {displayUrdu && ayah.urdu && (
            <motion.div
              key="urdu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="border-t border-border/60 pt-3 pb-1">
                <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-wide mb-1.5">
                  اردو — جالندھری
                </p>
                <p
                  className="font-arabic text-base text-foreground/85 leading-[2] text-right"
                  dir="rtl"
                  lang="ur"
                >
                  {ayah.urdu}
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Tafseer — lazy-loaded, per-ayah */}
      <TafseerPanel surahNum={surahNumber} ayahNum={ayah.numberInSurah} />
    </motion.article>
  );
}

/* ── Main page ── */
export default function SurahPage() {
  const { number } = useParams<{ number: string }>();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<TranslationMode>("arabic");
  const [ayahs, setAyahs] = useState<AyahWithTranslations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const surahNum = parseInt(number ?? "1", 10);
  const surah = surahs.find((s) => s.number === surahNum);
  const { isBookmarked, toggleBookmark } = useBookmarks();

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

  // Save reading progress whenever this surah's ayahs load
  useEffect(() => {
    if (ayahs.length > 0 && surah) {
      saveQuranProgress(surahNum, surah.name, surah.arabicName, 1);
    }
  }, [ayahs.length, surahNum, surah]);

  if (!surah) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-4 p-8 text-center">
        <p className="font-arabic text-4xl text-muted-foreground/30" dir="rtl">؟</p>
        <p className="text-muted-foreground text-sm">Surah not found.</p>
        <button onClick={() => navigate("/quran")} className="text-sm text-primary hover:underline">
          ← Back to Qur'an
        </button>
      </div>
    );
  }

  // Surah 1 (Al-Fatiha): Bismillah IS verse 1 — show all ayahs, no banner.
  // Surah 9 (At-Tawbah): begins without Bismillah — no banner, show all ayahs.
  // All others (2–114 except 9): show decorative banner, skip API ayah 1 (duplicate Bismillah).
  const showBismillahBanner = surahNum !== 9 && surahNum !== 1;

  // When the banner is shown the API still returns Bismillah as ayah 1 —
  // filter it out so it doesn't duplicate the decorative header above.
  const displayedAyahs = showBismillahBanner
    ? ayahs.filter((a) => a.numberInSurah !== 1)
    : ayahs;

  return (
    <div className="min-h-full flex flex-col">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">

        {/* Row 1: back + title */}
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
              {isLoading ? "…" : surah.verses} verses · {surah.type}
            </p>
          </div>
          <p className="font-arabic text-lg text-foreground shrink-0" dir="rtl">
            {surah.arabicName}
          </p>
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

        {/* ── Translation selector ── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Translation
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TRANSLATION_MODES.map((tm) => (
              <button
                key={tm.id}
                onClick={() => setMode(tm.id)}
                className={cn(
                  "px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200 border",
                  mode === tm.id
                    ? "gradient-primary text-white border-primary/30 shadow-sm"
                    : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground hover:bg-accent"
                )}
              >
                {tm.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Bismillah banner (surahs 2–114, skip 1 & 9) ── */}
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
            {showEnglish(mode) && (
              <p className="text-sm text-muted-foreground mt-2">
                In the name of Allah, the Most Gracious, the Most Merciful
              </p>
            )}
            {showUrdu(mode) && (
              <p className="font-arabic text-base text-muted-foreground mt-2" dir="rtl">
                اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے
              </p>
            )}
          </motion.div>
        )}

        {/* ── Loading ── */}
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

        {/* ── Error ── */}
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
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
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
        {!isLoading && !error && displayedAyahs.length > 0 && (
          <>
            <div className="space-y-4">
              {displayedAyahs.map((ayah, idx) => (
                <AyahCard
                  key={ayah.number}
                  ayah={ayah}
                  surahName={surah.name}
                  surahNumber={surahNum}
                  mode={mode}
                  index={idx}
                  bookmarked={isBookmarked(surahNum, ayah.numberInSurah)}
                  onToggleBookmark={() =>
                    toggleBookmark({
                      surahNumber: surahNum,
                      surahName: surah.name,
                      surahArabicName: surah.arabicName,
                      ayahNumber: ayah.numberInSurah,
                      arabicText: ayah.arabic,
                    })
                  }
                />
              ))}
            </div>

            {/* Attribution footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 rounded-xl bg-secondary/40 border border-border px-4 py-3"
            >
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                Arabic: Uthmani script · English: Sahih International · Urdu: Fateh Muhammad Jalandhri
                <br />
                <span className="text-muted-foreground/60">via AlQuran.cloud API</span>
              </p>
            </motion.div>
          </>
        )}

        <div className="h-10" />
      </div>
    </div>
  );
}
