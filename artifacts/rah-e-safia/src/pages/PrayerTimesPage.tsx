import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Clock, Sun, Sunrise, Sunset, Moon, Star, LocateFixed, Loader2, AlertCircle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PrayerInfo {
  id: string;
  name: string;
  arabicName: string;
  time24: string;   // "HH:MM"
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  period: "dawn" | "midday" | "afternoon" | "evening" | "night";
}

interface ReadyData {
  prayers: PrayerInfo[];
  hijriDate: string;
  gregorianDate: string;
  city: string;
}

type PageState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "fetching" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ReadyData };

// ─── Constants ───────────────────────────────────────────────────────────────

const PRAYER_META = [
  { id: "Fajr",    name: "Fajr",    arabicName: "الفجر",  icon: Star,    period: "dawn"      },
  { id: "Dhuhr",   name: "Dhuhr",   arabicName: "الظهر",  icon: Sun,     period: "midday"    },
  { id: "Asr",     name: "Asr",     arabicName: "العصر",  icon: Sunrise, period: "afternoon" },
  { id: "Maghrib", name: "Maghrib", arabicName: "المغرب", icon: Sunset,  period: "evening"   },
  { id: "Isha",    name: "Isha",    arabicName: "العشاء", icon: Moon,    period: "night"     },
] as const;

const periodStyles: Record<string, { bg: string; iconColor: string }> = {
  dawn:      { bg: "from-indigo-950 to-blue-900",  iconColor: "text-blue-300"   },
  midday:    { bg: "from-amber-600 to-orange-700",  iconColor: "text-yellow-200" },
  afternoon: { bg: "from-sky-600 to-cyan-700",      iconColor: "text-sky-200"    },
  evening:   { bg: "from-rose-700 to-orange-800",   iconColor: "text-rose-200"   },
  night:     { bg: "from-slate-800 to-indigo-950",  iconColor: "text-slate-300"  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse "HH:MM" into minutes since midnight */
function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Format "HH:MM" → { h: "04", m: "30", suffix: "AM" } */
function parseTime(t: string) {
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  return {
    display: `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${mStr}`,
    suffix: h >= 12 ? "PM" : "AM",
  };
}

/** Current time in minutes since midnight */
function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/** Find index of the next prayer (wraps to 0 if past Isha) */
function nextPrayerIndex(prayers: PrayerInfo[]): number {
  const cur = nowMinutes();
  const idx = prayers.findIndex((p) => toMinutes(p.time24) > cur);
  return idx === -1 ? 0 : idx;
}

/** Seconds until next prayer time (always positive) */
function secondsUntil(time24: string, isWrapped: boolean): number {
  const target = toMinutes(time24) * 60;
  const now = new Date();
  const nowSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const diff = target - nowSecs;
  return isWrapped ? diff + 86400 : diff;
}

function formatCountdown(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

// ─── API ─────────────────────────────────────────────────────────────────────

async function fetchPrayerData(lat: number, lon: number): Promise<ReadyData> {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();

  const url =
    `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}` +
    `?latitude=${lat}&longitude=${lon}&method=2`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(json.status ?? "API error");

  const timings = json.data.timings as Record<string, string>;
  const hijri = json.data.date.hijri;
  const greg = json.data.date.gregorian;

  const prayers: PrayerInfo[] = PRAYER_META.map((meta) => ({
    id: meta.id,
    name: meta.name,
    arabicName: meta.arabicName,
    time24: timings[meta.id].slice(0, 5), // strip " (EET)" suffixes if any
    icon: meta.icon,
    period: meta.period,
  }));

  const hijriDate = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
  const gregorianDate = greg.date; // "DD-MM-YYYY"
  const city = json.data.meta.timezone ?? "";

  return { prayers, hijriDate, gregorianDate, city };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PrayerCard({
  prayer,
  index,
  isNext,
  countdown,
}: {
  prayer: PrayerInfo;
  index: number;
  isNext: boolean;
  countdown: string;
}) {
  const Icon = prayer.icon;
  const style = periodStyles[prayer.period];
  const { display, suffix } = parseTime(prayer.time24);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.07, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-md",
        style.bg,
        isNext && "ring-2 ring-white/50 shadow-lg scale-[1.02]"
      )}
    >
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
          <p className="text-base font-semibold text-white leading-tight">{prayer.name}</p>
          {isNext && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-semibold">
              Next prayer
            </span>
          )}
        </div>

        {/* Time + countdown */}
        <div className="shrink-0 text-right">
          <p className="text-xl font-bold text-white tracking-wide">{display}</p>
          <p className="text-xs text-white/60 font-medium">{suffix}</p>
          {isNext && (
            <p className="text-[10px] text-white/80 font-mono mt-0.5 tabular-nums">
              in {countdown}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PrayerTimesPage() {
  const [state, setState] = useState<PageState>({ status: "idle" });
  const [countdown, setCountdown] = useState("--:--");
  const [nextIdx, setNextIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown ticker — runs whenever we have ready data
  const startTicker = useCallback((prayers: PrayerInfo[]) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const tick = () => {
      const idx = nextPrayerIndex(prayers);
      const wrapped = idx === 0 && nowMinutes() > toMinutes(prayers[prayers.length - 1].time24);
      const secs = secondsUntil(prayers[idx].time24, wrapped);
      setNextIdx(idx);
      setCountdown(formatCountdown(Math.max(0, secs)));
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: "error", message: "Geolocation is not supported by your browser." });
      return;
    }
    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setState({ status: "fetching" });
        try {
          const data = await fetchPrayerData(pos.coords.latitude, pos.coords.longitude);
          setState({ status: "ready", data });
          startTicker(data.prayers);
        } catch {
          setState({ status: "error", message: "Could not fetch prayer times. Please check your internet connection and try again." });
        }
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: "Location permission was denied. Please allow location access in your browser and try again.",
          2: "Your location could not be determined. Please try again.",
          3: "Location request timed out. Please try again.",
        };
        setState({ status: "error", message: msgs[err.code] ?? "An unknown error occurred." });
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, [startTicker]);

  const isReady = state.status === "ready";
  const prayers = isReady ? state.data.prayers : [];

  // Gregorian date for the banner
  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-full flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white shrink-0 shadow-sm">
          <Clock className="w-4 h-4" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="font-semibold text-foreground text-sm leading-tight">Prayer Times</h1>
          <p className="font-arabic text-muted-foreground text-xs leading-tight" dir="rtl">مواقيت الصلاة</p>
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
              <span className="text-white text-base font-bold leading-none">{now.getDate()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{dateLabel}</p>
              {isReady ? (
                <p className="font-arabic text-xs text-muted-foreground mt-0.5" dir="rtl">
                  {state.data.hijriDate}
                </p>
              ) : (
                <p className="font-arabic text-xs text-muted-foreground mt-0.5" dir="rtl">
                  الجدول اليومي للصلاة
                </p>
              )}
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

        {/* ── Location / status panel ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="mb-5"
        >
          {state.status === "idle" && (
            <div className="rounded-2xl border border-border bg-secondary/40 p-5 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-md">
                <LocateFixed className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Share your location</p>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
                  Allow location access so we can fetch accurate prayer times for your city.
                </p>
              </div>
              <button
                onClick={requestLocation}
                className="mt-1 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                Get Prayer Times
              </button>
            </div>
          )}

          {(state.status === "locating" || state.status === "fetching") && (
            <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">
                {state.status === "locating" ? "Detecting your location…" : "Fetching prayer times…"}
              </p>
            </div>
          )}

          {state.status === "error" && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-destructive">Could not load prayer times</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{state.message}</p>
              </div>
              <button
                onClick={requestLocation}
                className="shrink-0 text-xs font-semibold text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {state.status === "ready" && (
            <div className="rounded-2xl border border-border bg-secondary/40 p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Prayer times for your location</p>
                <p className="text-xs font-medium text-foreground truncate">
                  {state.data.city || "Your location"} · {state.data.hijriDate}
                </p>
              </div>
              <button
                onClick={requestLocation}
                className="shrink-0 text-xs font-semibold text-primary hover:underline"
              >
                Refresh
              </button>
            </div>
          )}
        </motion.div>

        {/* ── Prayer cards ── */}
        {isReady ? (
          <div className="space-y-3">
            {prayers.map((prayer, index) => (
              <PrayerCard
                key={prayer.id}
                prayer={prayer}
                index={index}
                isNext={index === nextIdx}
                countdown={countdown}
              />
            ))}
          </div>
        ) : (
          /* Skeleton placeholders while not ready */
          <div className="space-y-3">
            {PRAYER_META.map((meta, i) => {
              const style = periodStyles[meta.period];
              return (
                <div
                  key={meta.id}
                  className={cn(
                    "relative overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-md opacity-30",
                    style.bg
                  )}
                >
                  <div className="absolute inset-0 islamic-pattern" aria-hidden="true" />
                  <div className="relative flex items-center gap-4 p-4 sm:p-5">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-white/10 border border-white/15" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-16 rounded bg-white/20" />
                      <div className="h-4 w-20 rounded bg-white/30" />
                    </div>
                    <div className="shrink-0 space-y-1 text-right">
                      <div className="h-6 w-14 rounded bg-white/20 ml-auto" />
                      <div className="h-3 w-8 rounded bg-white/15 ml-auto" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          {isReady
            ? `Prayer times via Aladhan · Method: ISNA · Times are local`
            : "Allow location access above to load accurate prayer times."}
        </motion.p>
      </div>
    </div>
  );
}
