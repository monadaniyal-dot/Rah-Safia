import { motion } from "framer-motion";
import { Clock, Sun, Sunrise, Sunset, Moon, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Prayer {
  id: string;
  name: string;
  arabicName: string;
  time: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  period: "dawn" | "midday" | "afternoon" | "evening" | "night";
}

const prayers: Prayer[] = [
  {
    id: "fajr",
    name: "Fajr",
    arabicName: "الفجر",
    time: "04:30 AM",
    icon: Star,
    period: "dawn",
  },
  {
    id: "dhuhr",
    name: "Dhuhr",
    arabicName: "الظهر",
    time: "12:15 PM",
    icon: Sun,
    period: "midday",
  },
  {
    id: "asr",
    name: "Asr",
    arabicName: "العصر",
    time: "04:45 PM",
    icon: Sunrise,
    period: "afternoon",
  },
  {
    id: "maghrib",
    name: "Maghrib",
    arabicName: "المغرب",
    time: "07:10 PM",
    icon: Sunset,
    period: "evening",
  },
  {
    id: "isha",
    name: "Isha",
    arabicName: "العشاء",
    time: "08:40 PM",
    icon: Moon,
    period: "night",
  },
];

const periodStyles: Record<Prayer["period"], { bg: string; iconColor: string; badge: string }> = {
  dawn:      { bg: "from-indigo-950 to-blue-900",   iconColor: "text-blue-300",   badge: "bg-blue-400/20 text-blue-200" },
  midday:    { bg: "from-amber-600 to-orange-700",   iconColor: "text-yellow-200", badge: "bg-yellow-400/20 text-yellow-100" },
  afternoon: { bg: "from-sky-600 to-cyan-700",       iconColor: "text-sky-200",    badge: "bg-sky-400/20 text-sky-100" },
  evening:   { bg: "from-rose-700 to-orange-800",    iconColor: "text-rose-200",   badge: "bg-rose-400/20 text-rose-100" },
  night:     { bg: "from-slate-800 to-indigo-950",   iconColor: "text-slate-300",  badge: "bg-slate-400/20 text-slate-200" },
};

const now = new Date();
const dateLabel = now.toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

function PrayerCard({ prayer, index }: { prayer: Prayer; index: number }) {
  const Icon = prayer.icon;
  const style = periodStyles[prayer.period];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.07, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-md",
        style.bg
      )}
    >
      {/* Subtle islamic pattern overlay */}
      <div className="absolute inset-0 islamic-pattern" aria-hidden="true" />

      <div className="relative flex items-center gap-4 p-4 sm:p-5">
        {/* Icon */}
        <div className="shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center">
          <Icon className={cn("w-6 h-6", style.iconColor)} strokeWidth={1.6} />
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="font-arabic text-sm text-white/70 leading-none mb-0.5" dir="rtl">
            {prayer.arabicName}
          </p>
          <p className="text-base font-semibold text-white leading-tight">
            {prayer.name}
          </p>
        </div>

        {/* Time */}
        <div className="shrink-0 text-right">
          <p className="text-xl font-bold text-white tracking-wide">
            {prayer.time.split(" ")[0]}
          </p>
          <p className="text-xs text-white/60 font-medium">
            {prayer.time.split(" ")[1]}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function PrayerTimesPage() {
  return (
    <div className="min-h-full flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white shrink-0 shadow-sm">
          <Clock className="w-4 h-4" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="font-semibold text-foreground text-sm leading-tight">Prayer Times</h1>
          <p className="font-arabic text-muted-foreground text-xs leading-tight" dir="rtl">
            مواقيت الصلاة
          </p>
        </div>
      </header>

      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-xl lg:max-w-2xl mx-auto w-full">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="hidden lg:flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  Prayer Times
                </span>
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-foreground leading-tight">
                Daily Salah Schedule
              </h2>
              <p className="font-arabic text-muted-foreground text-base mt-0.5" dir="rtl">
                مواقيت الصلاة اليومية
              </p>
            </div>
          </div>

          {/* Date banner */}
          <div className="rounded-2xl bg-primary/8 border border-primary/15 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <span className="text-white text-base font-bold leading-none">
                {now.getDate()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{dateLabel}</p>
              <p className="font-arabic text-xs text-muted-foreground mt-0.5" dir="rtl">
                الجدول اليومي للصلاة
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quranic verse */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-center mb-6 py-4 px-4 rounded-2xl bg-gold-muted/60"
        >
          <p className="font-arabic text-primary text-lg leading-relaxed" dir="rtl">
            إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            "Indeed, prayer has been decreed upon the believers a decree of specified times." — Quran 4:103
          </p>
        </motion.div>

        {/* Prayer cards */}
        <div className="space-y-3">
          {prayers.map((prayer, index) => (
            <PrayerCard key={prayer.id} prayer={prayer} index={index} />
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          Times shown are placeholder values. Location-based times coming soon.
        </motion.p>
      </div>
    </div>
  );
}
