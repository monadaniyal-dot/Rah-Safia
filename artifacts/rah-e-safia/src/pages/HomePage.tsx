import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, BookOpen, BookMarked, ArrowRight, Clock } from "lucide-react";
import { useLocation } from "wouter";
import FeatureCard from "@/components/ui/FeatureCard";
import ThemeToggle from "@/components/ui/ThemeToggle";
import DailyInspiration from "@/components/ui/DailyInspiration";
import { featureCards } from "@/lib/constants";
import { useReadingProgress, relativeTime, type ProgressEntry } from "@/lib/reading-progress";

// ─── Continue Reading card ────────────────────────────────────────────────────
function ProgressCard({
  entry,
  type,
  onPress,
}: {
  entry: ProgressEntry;
  type: "quran" | "tafseer";
  onPress: () => void;
}) {
  const Icon = type === "quran" ? BookOpen : BookMarked;
  const label = type === "quran" ? "Qur'an" : "Tafseer";
  const sub = type === "tafseer" && entry.sourceName ? entry.sourceName : label;

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={onPress}
      className="w-full text-left rounded-2xl bg-card border border-primary/15 shadow-sm overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
    >
      <div className="h-0.5 gradient-primary" />
      <div className="p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-sm">
          <Icon className="w-4.5 h-4.5 text-white" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">{sub}</span>
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Clock className="w-2.5 h-2.5" strokeWidth={2} />
              {relativeTime(entry.timestamp)}
            </span>
          </div>
          <p className="font-semibold text-foreground text-sm leading-tight truncate">
            {entry.surahName}
          </p>
          <p className="font-arabic text-xs text-muted-foreground leading-tight mt-0.5" dir="rtl">
            {entry.surahArabicName}
          </p>
        </div>
        <ArrowRight
          className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
          strokeWidth={2}
        />
      </div>
    </motion.button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [, navigate] = useLocation();
  const progress = useReadingProgress();
  const hasProgress = !!(progress.quran || progress.tafseer);

  return (
    <div className="min-h-full flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-base shrink-0 shadow-sm">
            🌙
          </div>
          <div>
            <h1 className="font-semibold text-foreground text-sm leading-tight">Rah-e-Safia</h1>
            <p className="font-arabic text-muted-foreground text-xs leading-tight" dir="rtl">
              راہِ صافیہ
            </p>
          </div>
        </div>
        <ThemeToggle compact />
      </header>

      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-2xl lg:max-w-none mx-auto w-full">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          {/* Basmala */}
          <div className="text-center mb-6">
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-arabic text-2xl lg:text-3xl text-primary leading-relaxed"
              dir="rtl"
            >
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </motion.p>
            <p className="text-xs text-muted-foreground mt-1">
              In the name of Allah, the Most Gracious, the Most Merciful
            </p>
          </div>

          {/* Decorative divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="text-gold text-base">✦</div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* Welcome banner */}
          <div className="relative rounded-2xl overflow-hidden gradient-primary islamic-pattern p-6 text-white shadow-lg">
            {/* Glow effect */}
            <div
              className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)",
                transform: "translate(30%, -30%)",
              }}
              aria-hidden="true"
            />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-300" strokeWidth={1.8} />
                    <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                      Your Islamic Companion
                    </span>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-white mb-1 leading-tight">
                    Assalamu Alaikum
                  </h2>
                  <p className="font-arabic text-lg text-white/80 leading-relaxed" dir="rtl">
                    اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ
                  </p>
                </div>
                <div className="text-5xl shrink-0 opacity-90">🕌</div>
              </div>

              {/* Sadaqah Jariyah note */}
              <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-red-300 fill-red-300 shrink-0" />
                <p className="text-xs text-white/70 leading-snug">
                  A Sadaqah Jariyah dedicated to the loving memory of{" "}
                  <span className="text-white font-medium">Safia Bano</span>
                  {" "}— may Allah shower her with His mercy.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Inspiration */}
        <DailyInspiration />

        {/* Continue Reading */}
        <AnimatePresence>
          {hasProgress && (
            <motion.section
              key="continue-reading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Continue Reading</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Pick up where you left off</p>
                </div>
                <div className="font-arabic text-muted-foreground text-sm" dir="rtl">
                  متابعة القراءة
                </div>
              </div>
              <div className="space-y-2.5">
                {progress.quran && (
                  <ProgressCard
                    entry={progress.quran}
                    type="quran"
                    onPress={() => navigate(progress.quran!.path)}
                  />
                )}
                {progress.tafseer && (
                  <ProgressCard
                    entry={progress.tafseer}
                    type="tafseer"
                    onPress={() => navigate(progress.tafseer!.path)}
                  />
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-between mb-4"
        >
          <div>
            <h2 className="text-base font-semibold text-foreground">Explore</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Islamic tools and resources</p>
          </div>
          <div className="font-arabic text-muted-foreground text-sm" dir="rtl">
            تصفح
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          {featureCards.map((card, index) => (
            <FeatureCard
              key={card.id}
              card={card}
              index={index}
              onClick={() => navigate(card.path)}
            />
          ))}
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="font-arabic text-muted-foreground text-sm" dir="rtl">
            رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            "My Lord, forgive me and my parents"
          </p>
          <p className="text-xs text-muted-foreground/50 mt-4 flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400 inline" /> for Safia Bano
          </p>
        </motion.div>
      </div>
    </div>
  );
}
