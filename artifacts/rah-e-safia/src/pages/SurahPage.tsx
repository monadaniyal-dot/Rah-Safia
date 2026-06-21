import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import { surahs } from "@/lib/quran-data";
import { cn } from "@/lib/utils";

/* ---------- placeholder ayah data ---------- */
const PLACEHOLDER_AYAHS = [
  {
    number: 1,
    arabic:
      "أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ ۝ هَذَا نَصٌّ تَجْرِيبِيٌّ مُؤَقَّتٌ",
    placeholder: true,
  },
  {
    number: 2,
    arabic:
      "إِنَّ هَذَا النَّصَّ سَيُسْتَبْدَلُ بِالنَّصِّ الْقُرْآنِيِّ الْكَامِلِ قَرِيبًا",
    placeholder: true,
  },
  {
    number: 3,
    arabic: "وَهَذِهِ آيَةٌ تَجْرِيبِيَّةٌ لِعَرْضِ تَصْمِيمِ الصَّفْحَةِ",
    placeholder: true,
  },
  {
    number: 4,
    arabic: "سَيَتِمُّ رَبْطُ هَذِهِ الصَّفْحَةِ بِقَاعِدَةِ بَيَانَاتِ الْقُرْآنِ الْكَرِيمِ",
    placeholder: true,
  },
  {
    number: 5,
    arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ نَصٌّ عَرَبِيٌّ تَجْرِيبِيٌّ",
    placeholder: true,
  },
];

/* Al-Fatihah — real text (first surah, universally known) */
const FATIHAH_AYAHS = [
  { number: 1,  arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",                                                                       placeholder: false },
  { number: 2,  arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",                                                                         placeholder: false },
  { number: 3,  arabic: "الرَّحْمَٰنِ الرَّحِيمِ",                                                                                       placeholder: false },
  { number: 4,  arabic: "مَالِكِ يَوْمِ الدِّينِ",                                                                                        placeholder: false },
  { number: 5,  arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",                                                                    placeholder: false },
  { number: 6,  arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",                                                                           placeholder: false },
  { number: 7,  arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",               placeholder: false },
];

export default function SurahPage() {
  const { number } = useParams<{ number: string }>();
  const [, navigate] = useLocation();

  const surahNum = parseInt(number ?? "1", 10);
  const surah = surahs.find((s) => s.number === surahNum);

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

  const hasBismillah = surah.number !== 9;
  const ayahs = surah.number === 1 ? FATIHAH_AYAHS : PLACEHOLDER_AYAHS;

  return (
    <div className="min-h-full flex flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
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
      </header>

      <div className="flex-1 px-4 lg:px-8 py-6 max-w-2xl mx-auto w-full">

        {/* Surah info banner */}
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

        {/* Bismillah (all surahs except At-Tawbah) */}
        {hasBismillah && surah.number !== 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="text-center mb-6 py-4 px-4 rounded-2xl bg-gold-muted/60 border border-gold/20"
          >
            <p className="font-arabic text-2xl text-primary leading-relaxed" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              In the name of Allah, the Most Gracious, the Most Merciful
            </p>
          </motion.div>
        )}

        {/* Placeholder notice (not shown for Al-Fatihah) */}
        {surah.number !== 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-start gap-2 rounded-xl bg-secondary/60 border border-border px-4 py-3 mb-5"
          >
            <span className="text-gold text-base shrink-0 mt-0.5">📖</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Placeholder content.</strong> Showing{" "}
              {PLACEHOLDER_AYAHS.length} sample ayahs. The full Qur'an text will be
              connected in a future update.
            </p>
          </motion.div>
        )}

        {/* Ayah list */}
        <div className="space-y-3">
          {ayahs.map((ayah, idx) => (
            <motion.div
              key={ayah.number}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.12 + idx * 0.06 }}
              className={cn(
                "rounded-2xl border p-4",
                ayah.placeholder
                  ? "bg-secondary/40 border-border"
                  : "bg-card border-primary/15 shadow-sm"
              )}
            >
              {/* Ayah number badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{ayah.number}</span>
                </div>
                {ayah.placeholder && (
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    Placeholder
                  </span>
                )}
              </div>

              {/* Arabic text */}
              <p
                className="font-arabic text-xl text-foreground leading-loose text-right"
                dir="rtl"
                lang="ar"
              >
                {ayah.arabic}
              </p>

              {/* Translation placeholder */}
              {!ayah.placeholder && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground italic">
                    Translation coming soon
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Continue notice */}
        {surah.number !== 1 && surah.verses > PLACEHOLDER_AYAHS.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="text-center mt-6 py-4 rounded-xl bg-secondary/40 border border-dashed border-border"
          >
            <p className="text-sm text-muted-foreground">
              …and {surah.verses - PLACEHOLDER_AYAHS.length} more ayahs
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Full text loading coming soon
            </p>
          </motion.div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
