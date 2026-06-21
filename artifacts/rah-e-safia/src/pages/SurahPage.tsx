import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Languages } from "lucide-react";
import { surahs } from "@/lib/quran-data";
import {
  getTranslations,
  showUrdu,
  showEnglish,
  TRANSLATION_MODES,
  type TranslationMode,
} from "@/lib/surah-translations";
import { cn } from "@/lib/utils";

/* ---------- Arabic-only ayah text ---------- */
const PLACEHOLDER_ARABIC = [
  "أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ ۝ هَذَا نَصٌّ تَجْرِيبِيٌّ مُؤَقَّتٌ",
  "إِنَّ هَذَا النَّصَّ سَيُسْتَبْدَلُ بِالنَّصِّ الْقُرْآنِيِّ الْكَامِلِ قَرِيبًا",
  "وَهَذِهِ آيَةٌ تَجْرِيبِيَّةٌ لِعَرْضِ تَصْمِيمِ الصَّفْحَةِ",
  "سَيَتِمُّ رَبْطُ هَذِهِ الصَّفْحَةِ بِقَاعِدَةِ بَيَانَاتِ الْقُرْآنِ الْكَرِيمِ",
  "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ نَصٌّ عَرَبِيٌّ تَجْرِيبِيٌّ",
];

const FATIHAH_ARABIC = [
  "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
  "الرَّحْمَٰنِ الرَّحِيمِ",
  "مَالِكِ يَوْمِ الدِّينِ",
  "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
  "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
  "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
];

export default function SurahPage() {
  const { number } = useParams<{ number: string }>();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<TranslationMode>("arabic");

  const surahNum = parseInt(number ?? "1", 10);
  const surah = surahs.find((s) => s.number === surahNum);

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

  const isFatihah = surah.number === 1;
  const hasBismillah = surah.number !== 9;
  const arabicLines = isFatihah ? FATIHAH_ARABIC : PLACEHOLDER_ARABIC;
  const translations = getTranslations(surah.number, surah.verses);
  const displayUrdu = showUrdu(mode);
  const displayEnglish = showEnglish(mode);
  const ayahCount = arabicLines.length;

  return (
    <div className="min-h-full flex flex-col">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">

        {/* Row 1: Back + title + Arabic name */}
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
              Surah {surah.number} · {surah.verses} verses · {surah.type}
            </p>
          </div>
          <p className="font-arabic text-lg text-foreground shrink-0" dir="rtl">
            {surah.arabicName}
          </p>
        </div>

        {/* Row 2: Language toggle */}
        <div className="px-4 lg:px-8 pb-3 flex items-center gap-2">
          <Languages className="w-3.5 h-3.5 text-muted-foreground shrink-0" strokeWidth={1.8} />
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
              <span>Surah #{surah.number}</span>
              <span>Page {surah.page}</span>
              <span>{surah.type} revelation</span>
            </div>
          </div>
        </motion.div>

        {/* ── Bismillah (all surahs except At-Tawbah, and not Fatihah whose verse 1 is Bismillah) ── */}
        {hasBismillah && !isFatihah && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="text-center mb-6 py-5 px-4 rounded-2xl bg-gold-muted/60 border border-gold/20"
          >
            <p className="font-arabic text-3xl text-primary leading-loose" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            {displayEnglish && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                In the name of Allah, the Most Gracious, the Most Merciful
              </p>
            )}
            {displayUrdu && (
              <p className="font-arabic text-base text-muted-foreground mt-1 leading-relaxed" dir="rtl">
                اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے
              </p>
            )}
          </motion.div>
        )}

        {/* ── Placeholder notice (not for Fatihah) ── */}
        {!isFatihah && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-start gap-2 rounded-xl bg-secondary/60 border border-border px-4 py-3 mb-5"
          >
            <span className="text-gold text-base shrink-0 mt-0.5">📖</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Placeholder content.</strong> Showing{" "}
              {PLACEHOLDER_ARABIC.length} sample ayahs with placeholder translations. Full
              Qur'an text and certified translations will be connected in a future update.
            </p>
          </motion.div>
        )}

        {/* ── Ayah list ── */}
        <div className="space-y-4">
          {arabicLines.map((arabic, idx) => {
            const ayahNum = idx + 1;
            const translation = translations[idx];
            const isPlaceholder = !isFatihah;

            return (
              <motion.article
                key={ayahNum}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.12 + idx * 0.06 }}
                className={cn(
                  "rounded-2xl border overflow-hidden",
                  isPlaceholder
                    ? "bg-secondary/30 border-border"
                    : "bg-card border-primary/15 shadow-sm"
                )}
              >
                {/* Ayah header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2">
                    {/* Octagonal ayah number */}
                    <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-bold">{ayahNum}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {surah.name} {ayahNum}:{surah.number}
                    </span>
                  </div>
                  {isPlaceholder && (
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Placeholder
                    </span>
                  )}
                </div>

                <div className="px-4 pb-4 space-y-0">

                  {/* ── Arabic text ── */}
                  <div className="py-3">
                    <p
                      className="font-arabic text-2xl text-foreground leading-[2.2] text-right"
                      dir="rtl"
                      lang="ar"
                    >
                      {arabic}
                    </p>
                  </div>

                  <AnimatePresence>

                    {/* ── Urdu translation ── */}
                    {displayUrdu && translation && (
                      <motion.div
                        key="urdu"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/60 pt-3 pb-1">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-wide">
                              اردو
                            </span>
                          </div>
                          <p
                            className="font-arabic text-base text-foreground/85 leading-[2] text-right"
                            dir="rtl"
                            lang="ur"
                          >
                            {translation.urdu}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* ── English translation ── */}
                    {displayEnglish && translation && (
                      <motion.div
                        key="english"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/60 pt-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-wide">
                              English
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {translation.english}
                          </p>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* ── More ayahs notice ── */}
        {!isFatihah && surah.verses > PLACEHOLDER_ARABIC.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="text-center mt-6 py-4 rounded-xl bg-secondary/40 border border-dashed border-border"
          >
            <p className="text-sm text-muted-foreground">
              …and {surah.verses - PLACEHOLDER_ARABIC.length} more ayahs
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">Full text coming soon</p>
          </motion.div>
        )}

        <div className="h-10" />
      </div>
    </div>
  );
}
