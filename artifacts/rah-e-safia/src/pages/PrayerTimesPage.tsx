import { useState, useEffect, useCallback, useRef } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Sun, CloudSun, Sunset, Moon, Star,
  LocateFixed, Loader2, AlertCircle, MapPin, RefreshCw, Search,
  Sunrise, Settings,
} from "lucide-react";
import { getNativeLocation } from "@/lib/native-location";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/use-settings";
import { getSavedLocation } from "@/lib/location-store";
import { schedulePrayerNotifications, getNotificationPermission } from "@/lib/prayer-notifications";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PrayerInfo {
  id: string;
  name: string;
  arabicName: string;
  time24: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  period: "dawn" | "midday" | "afternoon" | "evening" | "night";
}

interface LocationInfo {
  lat: number;
  lon: number;
  cityName: string;
}

interface ReadyData {
  prayers: PrayerInfo[];
  sunriseTime24: string;
  hijriDate: string;
  location: LocationInfo;
}

type PageState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "fetching"; location: LocationInfo }
  | { status: "error"; message: string; permDenied?: boolean }
  | { status: "ready"; data: ReadyData };

type PeriodKey = "midnight" | "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

interface LiveStatus {
  period: PeriodKey;
  label: string;
  arabicLabel: string;
  emoji: string;
  justStarted: boolean;        // first 90 s of this period — show "Time Has Begun"
  currentPrayerIdx: number;    // -1 for midnight / sunrise
  nextPrayerIdx: number;       // index in prayers[]
  nextIsWrapped: boolean;      // next prayer is tomorrow's Fajr
  countdownSecs: number;
  progressFraction: number;    // 0–1 — for animated progress bar
  // notificationKey exposed so future notification logic can subscribe
  notificationKey: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRAYER_META = [
  { id: "Fajr",    name: "Fajr",    arabicName: "الفجر",  icon: Star,    period: "dawn"      },
  { id: "Dhuhr",   name: "Dhuhr",   arabicName: "الظهر",  icon: Sun,     period: "midday"    },
  { id: "Asr",     name: "Asr",     arabicName: "العصر",  icon: CloudSun, period: "afternoon" },
  { id: "Maghrib", name: "Maghrib", arabicName: "المغرب", icon: Sunset,  period: "evening"   },
  { id: "Isha",    name: "Isha",    arabicName: "العشاء", icon: Moon,    period: "night"     },
] as const;

const ALADHAN_METHOD: Record<string, number> = {
  MWL: 1, ISNA: 2, Egypt: 3, Makkah: 4, Karachi: 5,
};

const ALADHAN_SCHOOL: Record<string, number> = {
  shafi: 0, hanafi: 1,
};

const METHOD_LABELS: Record<string, string> = {
  MWL: "Muslim World League",
  ISNA: "ISNA",
  Egypt: "Egyptian Authority",
  Makkah: "Umm al-Qura",
  Karachi: "Karachi",
};

const PERIOD_META: Record<PeriodKey, { emoji: string; label: string; arabicLabel: string; accentFrom: string; accentTo: string; textAccent: string; glow: string }> = {
  midnight: { emoji: "🌙", label: "Tonight · Awaiting Fajr", arabicLabel: "انتظار الفجر",  accentFrom: "from-slate-900",   accentTo: "to-indigo-950", textAccent: "text-indigo-300", glow: "shadow-indigo-500/15" },
  fajr:     { emoji: "🌅", label: "Time for Fajr",           arabicLabel: "وقت الفجر",      accentFrom: "from-indigo-950",  accentTo: "to-blue-900",   textAccent: "text-blue-300",   glow: "shadow-blue-500/15"   },
  sunrise:  { emoji: "☀️", label: "Sunrise · Waiting for Dhuhr", arabicLabel: "شروق الشمس", accentFrom: "from-amber-900",  accentTo: "to-orange-900", textAccent: "text-amber-300",  glow: "shadow-amber-500/15"  },
  dhuhr:    { emoji: "🌞", label: "Time for Dhuhr",          arabicLabel: "وقت الظهر",      accentFrom: "from-amber-600",   accentTo: "to-orange-700", textAccent: "text-yellow-200", glow: "shadow-amber-500/15"  },
  asr:      { emoji: "🌤", label: "Time for Asr",            arabicLabel: "وقت العصر",      accentFrom: "from-sky-700",     accentTo: "to-cyan-800",   textAccent: "text-sky-200",    glow: "shadow-sky-500/15"    },
  maghrib:  { emoji: "🌇", label: "Time for Maghrib",        arabicLabel: "وقت المغرب",     accentFrom: "from-rose-800",    accentTo: "to-orange-900", textAccent: "text-rose-200",   glow: "shadow-rose-500/15"   },
  isha:     { emoji: "🌙", label: "Time for Isha",           arabicLabel: "وقت العشاء",     accentFrom: "from-slate-800",   accentTo: "to-indigo-950", textAccent: "text-slate-300",  glow: "shadow-slate-500/15"  },
};

const JUST_STARTED_MESSAGES: Record<PeriodKey, string> = {
  midnight: "",
  fajr:     "Fajr Time Has Begun",
  sunrise:  "Sunrise Has Arrived",
  dhuhr:    "Dhuhr Time Has Begun",
  asr:      "Asr Time Has Begun",
  maghrib:  "Maghrib Time Has Begun",
  isha:     "Isha Time Has Begun",
};

const periodStyles: Record<string, { bg: string; iconColor: string }> = {
  dawn:      { bg: "from-indigo-950 to-blue-900",  iconColor: "text-blue-300"   },
  midday:    { bg: "from-amber-600 to-orange-700",  iconColor: "text-yellow-200" },
  afternoon: { bg: "from-sky-600 to-cyan-700",      iconColor: "text-sky-200"    },
  evening:   { bg: "from-rose-700 to-orange-800",   iconColor: "text-rose-200"   },
  night:     { bg: "from-slate-800 to-indigo-950",  iconColor: "text-slate-300"  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function toSeconds(t: string): number {
  return toMinutes(t) * 60;
}

function parseTime(t: string) {
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  return {
    display: `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${mStr}`,
    suffix: h >= 12 ? "PM" : "AM",
  };
}

function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function nowSeconds(): number {
  const d = new Date();
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
}

function nextPrayerIndex(prayers: PrayerInfo[]): number {
  const cur = nowMinutes();
  const idx = prayers.findIndex((p) => toMinutes(p.time24) > cur);
  return idx === -1 ? 0 : idx;
}

function secondsUntil(time24: string, isWrapped: boolean): number {
  const target = toSeconds(time24);
  const diff = target - nowSeconds();
  return isWrapped ? diff + 86400 : diff;
}

/** HH:MM:SS format for the live countdown */
function formatCountdown(secs: number): string {
  const s = Math.max(0, Math.floor(secs));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function fmtCoord(n: number, pos: string, neg: string) {
  return `${Math.abs(n).toFixed(4)}° ${n >= 0 ? pos : neg}`;
}

/**
 * Compute the full live status from current time + prayer data.
 * This is the single source of truth for the dashboard.
 * No prayer calculation logic is modified here — we only interpret the times.
 */
function computeLiveStatus(prayers: PrayerInfo[], sunriseTime24: string): LiveStatus {
  const nowSecs = nowSeconds();

  // Convert all key times to seconds-since-midnight
  const fajrSecs    = toSeconds(prayers[0].time24);
  const sunriseSecs = toSeconds(sunriseTime24);
  const dhuhrSecs   = toSeconds(prayers[1].time24);
  const asrSecs     = toSeconds(prayers[2].time24);
  const maghribSecs = toSeconds(prayers[3].time24);
  const ishaSecs    = toSeconds(prayers[4].time24);

  const JUST_STARTED_WINDOW = 90; // seconds

  let period: PeriodKey;
  let currentPrayerIdx: number;
  let nextPrayerIdx: number;
  let nextIsWrapped: boolean;
  let periodStartSecs: number;
  let periodEndSecs: number;

  if (nowSecs < fajrSecs) {
    // Midnight zone: before today's Fajr
    period           = "midnight";
    currentPrayerIdx = -1;
    nextPrayerIdx    = 0; // Fajr
    nextIsWrapped    = false;
    periodStartSecs  = ishaSecs - 86400; // yesterday's Isha (approx)
    periodEndSecs    = fajrSecs;
  } else if (nowSecs < sunriseSecs) {
    period           = "fajr";
    currentPrayerIdx = 0;
    nextPrayerIdx    = -1; // next notable time is Sunrise, not a prayer
    nextIsWrapped    = false;
    periodStartSecs  = fajrSecs;
    periodEndSecs    = sunriseSecs;
  } else if (nowSecs < dhuhrSecs) {
    period           = "sunrise";
    currentPrayerIdx = -1;
    nextPrayerIdx    = 1; // Dhuhr
    nextIsWrapped    = false;
    periodStartSecs  = sunriseSecs;
    periodEndSecs    = dhuhrSecs;
  } else if (nowSecs < asrSecs) {
    period           = "dhuhr";
    currentPrayerIdx = 1;
    nextPrayerIdx    = 2; // Asr
    nextIsWrapped    = false;
    periodStartSecs  = dhuhrSecs;
    periodEndSecs    = asrSecs;
  } else if (nowSecs < maghribSecs) {
    period           = "asr";
    currentPrayerIdx = 2;
    nextPrayerIdx    = 3; // Maghrib
    nextIsWrapped    = false;
    periodStartSecs  = asrSecs;
    periodEndSecs    = maghribSecs;
  } else if (nowSecs < ishaSecs) {
    period           = "maghrib";
    currentPrayerIdx = 3;
    nextPrayerIdx    = 4; // Isha
    nextIsWrapped    = false;
    periodStartSecs  = maghribSecs;
    periodEndSecs    = ishaSecs;
  } else {
    // After Isha — counting down to tomorrow's Fajr
    period           = "isha";
    currentPrayerIdx = 4;
    nextPrayerIdx    = 0; // tomorrow's Fajr
    nextIsWrapped    = true;
    periodStartSecs  = ishaSecs;
    periodEndSecs    = fajrSecs + 86400;
  }

  // Progress fraction (clamp 0–1)
  const span = periodEndSecs - periodStartSecs;
  const elapsed = nowSecs - periodStartSecs;
  const progressFraction = span > 0 ? Math.min(1, Math.max(0, elapsed / span)) : 0;

  // Countdown
  let countdownSecs: number;
  if (period === "fajr") {
    // During Fajr, countdown is to Sunrise
    countdownSecs = Math.max(0, sunriseSecs - nowSecs);
  } else if (nextIsWrapped) {
    countdownSecs = Math.max(0, (fajrSecs + 86400) - nowSecs);
  } else {
    const nextTime = nextPrayerIdx >= 0 ? prayers[nextPrayerIdx].time24 : sunriseTime24;
    countdownSecs = Math.max(0, toSeconds(nextTime) - nowSecs);
  }

  const justStarted =
    period !== "midnight" && (nowSecs - periodStartSecs) < JUST_STARTED_WINDOW;

  const meta = PERIOD_META[period];

  return {
    period,
    label:        meta.label,
    arabicLabel:  meta.arabicLabel,
    emoji:        meta.emoji,
    justStarted,
    currentPrayerIdx,
    nextPrayerIdx,
    nextIsWrapped,
    countdownSecs,
    progressFraction,
    notificationKey: `${period}-${new Date().toDateString()}`,
  };
}

// ─── API ─────────────────────────────────────────────────────────────────────

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetchWithTimeout(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) throw new Error("geocode fail");
    const json = await res.json();
    const a = json.address ?? {};
    const city =
      a.suburb ?? a.neighbourhood ?? a.village ?? a.town ?? a.city ??
      a.county ?? a.state ?? json.display_name?.split(",")[0] ?? "";
    return city.trim() || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

async function forwardGeocode(query: string): Promise<LocationInfo> {
  const res = await fetchWithTimeout(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
    { headers: { "Accept-Language": "en" } }
  );
  if (!res.ok) throw new Error("Geocoding failed");
  const json = await res.json();
  if (!json.length) throw new Error(`City "${query}" not found. Try a different spelling.`);
  const r = json[0];
  const lat = parseFloat(r.lat);
  const lon = parseFloat(r.lon);
  const cityName = r.display_name?.split(",").slice(0, 2).join(",").trim() ?? query;
  return { lat, lon, cityName };
}

async function fetchPrayerTimes(
  location: LocationInfo,
  method: number,
  school: number
): Promise<ReadyData> {
  const today = new Date();
  const dd   = String(today.getDate()).padStart(2, "0");
  const mm   = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();

  const url =
    `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}` +
    `?latitude=${location.lat}&longitude=${location.lon}&method=${method}&school=${school}`;

  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Aladhan API error ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(json.status ?? "API error");

  const timings = json.data.timings as Record<string, string>;
  const hijri   = json.data.date.hijri;

  const prayers: PrayerInfo[] = PRAYER_META.map((meta) => ({
    id:         meta.id,
    name:       meta.name,
    arabicName: meta.arabicName,
    time24:     timings[meta.id].slice(0, 5),
    icon:       meta.icon,
    period:     meta.period,
  }));

  const sunriseTime24 = (timings["Sunrise"] ?? timings["sunrise"] ?? "06:00").slice(0, 5);
  const hijriDate = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
  return { prayers, sunriseTime24, hijriDate, location };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** The large hero countdown card — primary visual focus on the page */
function StatusHeroCard({
  status,
  prayers,
  sunriseTime24,
}: {
  status: LiveStatus;
  prayers: PrayerInfo[];
  sunriseTime24: string;
}) {
  const meta = PERIOD_META[status.period];

  // Determine the next name & time string to display
  const nextName = (() => {
    if (status.period === "fajr")    return "Sunrise";
    if (status.period === "midnight") return "Fajr";
    if (status.nextPrayerIdx >= 0)   return prayers[status.nextPrayerIdx].name;
    return "";
  })();

  const nextTime24 = (() => {
    if (status.period === "fajr")    return sunriseTime24;
    if (status.period === "midnight") return prayers[0].time24;
    if (status.nextPrayerIdx >= 0)   return prayers[status.nextPrayerIdx].time24;
    return "";
  })();

  const { display: nextDisplay, suffix: nextSuffix } = nextTime24
    ? parseTime(nextTime24)
    : { display: "--:--", suffix: "" };

  // Current period from/to labels for progress bar
  const fromLabel = (() => {
    if (status.period === "midnight") return `${PERIOD_META.isha.emoji} Isha`;
    if (status.period === "fajr")     return `${PERIOD_META.fajr.emoji} Fajr`;
    if (status.period === "sunrise")  return `${PERIOD_META.sunrise.emoji} Sunrise`;
    if (status.period === "dhuhr")    return `${PERIOD_META.dhuhr.emoji} Dhuhr`;
    if (status.period === "asr")      return `${PERIOD_META.asr.emoji} Asr`;
    if (status.period === "maghrib")  return `${PERIOD_META.maghrib.emoji} Maghrib`;
    return `${PERIOD_META.isha.emoji} Isha`;
  })();

  const toLabel = (() => {
    if (status.period === "fajr")     return `☀️ Sunrise`;
    if (status.period === "midnight") return `🌅 Fajr`;
    // Map nextPrayerIdx (0=Fajr … 4=Isha) to the corresponding period key.
    // Use a Record so there is never an undefined lookup regardless of index value.
    const idxToPeriod: Record<number, PeriodKey> = {
      0: "fajr", 1: "dhuhr", 2: "asr", 3: "maghrib", 4: "isha",
    };
    const nextKey = idxToPeriod[status.nextPrayerIdx] ?? "fajr";
    return `${(PERIOD_META[nextKey] ?? PERIOD_META.fajr).emoji} ${nextName}`;
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-3xl shadow-xl",
        `bg-gradient-to-br ${meta.accentFrom} ${meta.accentTo}`,
        meta.glow,
      )}
    >
      {/* Islamic pattern texture */}
      <div className="absolute inset-0 islamic-pattern opacity-30" aria-hidden="true" />

      <div className="relative p-5 sm:p-6 space-y-5">

        {/* ── Just-started banner ── */}
        <AnimatePresence>
          {status.justStarted && JUST_STARTED_MESSAGES[status.period] && (
            <motion.div
              key="just-started"
              initial={{ opacity: 0, scale: 0.94, y: -6 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.94, y: -4  }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-3 text-center"
            >
              <p className="text-white font-bold text-base">
                {JUST_STARTED_MESSAGES[status.period]}
              </p>
              <p className="text-white/75 text-xs mt-0.5">
                May Allah accept your prayer.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Status label ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
              Current Status
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={status.period}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-white text-xl font-bold mt-0.5 leading-tight"
              >
                {meta.emoji} {meta.label}
              </motion.p>
            </AnimatePresence>
            <p
              className="font-arabic text-white/60 text-sm mt-0.5"
              dir="rtl"
              lang="ar"
            >
              {meta.arabicLabel}
            </p>
          </div>

          {/* Pulsing dot */}
          <div className="shrink-0 relative">
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-3 h-3 rounded-full bg-white/70"
            />
          </div>
        </div>

        {/* ── Next prayer card ── */}
        <div className="rounded-2xl bg-black/25 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/55 text-[11px] font-semibold uppercase tracking-widest mb-2">
            {status.period === "midnight" ? "Tonight's" : "Next Prayer"}
          </p>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className={cn("text-3xl font-bold text-white leading-none", meta.textAccent.replace("text-", "text-"))}>
                {nextName}
              </p>
              <p className="text-white/60 text-sm mt-1 font-medium">
                {nextDisplay}
                <span className="text-white/40 text-xs ml-1">{nextSuffix}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/55 text-[11px] mb-0.5">Remaining</p>
              <AnimatePresence mode="popLayout">
                <motion.p
                  key={Math.floor(status.countdownSecs / 60)}
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  className="font-mono text-2xl font-bold text-white tabular-nums tracking-tight leading-none"
                >
                  {formatCountdown(status.countdownSecs)}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/50 font-medium">{fromLabel}</span>
            <span className="text-[11px] text-white/50 font-medium">{toLabel}</span>
          </div>
          <div className="relative h-2 rounded-full bg-white/15 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-white/70"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, status.progressFraction * 100).toFixed(2)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="text-right text-[11px] text-white/40">
            {(status.progressFraction * 100).toFixed(0)}% elapsed
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/** Individual prayer card in the daily schedule list */
function PrayerCard({
  prayer,
  index,
  isCurrent,
  isNext,
  countdown,
}: {
  prayer: PrayerInfo;
  index: number;
  isCurrent: boolean;
  isNext: boolean;
  countdown: string;
}) {
  const Icon  = prayer.icon;
  const style = periodStyles[prayer.period];
  const { display, suffix } = parseTime(prayer.time24);

  // Map prayer emojis
  const EMOJIS: Record<string, string> = {
    Fajr: "🌅", Dhuhr: "🌞", Asr: "🌤", Maghrib: "🌇", Isha: "🌙",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 + index * 0.06, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-md transition-all duration-300",
        style.bg,
        isCurrent && "ring-2 ring-white/60 shadow-xl scale-[1.01]",
        isNext    && !isCurrent && "ring-1 ring-white/30 shadow-lg",
      )}
    >
      {/* Subtle glow for current prayer */}
      {isCurrent && (
        <motion.div
          animate={{ opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-white"
          aria-hidden="true"
        />
      )}

      <div className="absolute inset-0 islamic-pattern" aria-hidden="true" />
      <div className="relative flex items-center gap-4 p-4 sm:p-5">
        <div className={cn(
          "shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center transition-colors",
          isCurrent && "bg-white/20 border-white/30",
        )}>
          <span className="text-xl leading-none" aria-hidden="true">
            {EMOJIS[prayer.id] ?? ""}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-arabic text-sm text-white/70 leading-none mb-0.5" dir="rtl" lang="ar">
            {prayer.arabicName}
          </p>
          <p className="text-base font-semibold text-white leading-tight">{prayer.name}</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {isCurrent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/25 text-white text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                In Progress
              </span>
            )}
            {isNext && !isCurrent && (
              <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-semibold">
                Next Prayer
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xl font-bold text-white tracking-wide">{display}</p>
          <p className="text-xs text-white/60 font-medium">{suffix}</p>
          {isNext && !isCurrent && (
            <p className="text-[10px] text-white/80 font-mono mt-0.5 tabular-nums">
              in {countdown}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonCard({ period }: { period: string }) {
  const style = periodStyles[period];
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-md opacity-25", style.bg)}>
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
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PrayerTimesPage() {
  const { settings } = useSettings();
  const [state, setState] = useState<PageState>({ status: "idle" });
  const [liveStatus, setLiveStatus] = useState<LiveStatus | null>(null);
  const [nextIdx, setNextIdx] = useState(0);             // for prayer list highlight fallback
  const [countdown, setCountdown] = useState("00:00:00"); // human-readable for prayer cards
  const [cityInput,   setCityInput]   = useState("");
  const [cityError,   setCityError]   = useState("");
  const [cityLoading, setCityLoading] = useState(false);
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAutoLoaded  = useRef(false);

  const startTicker = useCallback((prayers: PrayerInfo[], sunriseTime24: string) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const tick = () => {
      const status = computeLiveStatus(prayers, sunriseTime24);
      setLiveStatus(status);

      // Keep existing nextIdx/countdown for the prayer card list
      const idx = nextPrayerIndex(prayers);
      const wrapped = idx === 0 && nowMinutes() > toMinutes(prayers[prayers.length - 1].time24);
      setNextIdx(idx);
      setCountdown(formatCountdown(Math.max(0, secondsUntil(prayers[idx].time24, wrapped))));
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const loadFromLocation = useCallback(async (location: LocationInfo) => {
    const method = ALADHAN_METHOD[settings.calculationMethod] ?? 1;
    const school = ALADHAN_SCHOOL[settings.madhab] ?? 0;
    setState({ status: "fetching", location });
    try {
      const data = await fetchPrayerTimes(location, method, school);
      setState({ status: "ready", data });
      startTicker(data.prayers, data.sunriseTime24);
      if (settings.prayerNotifications && getNotificationPermission() === "granted") {
        schedulePrayerNotifications(data.prayers, {
          prayerNotifications:    settings.prayerNotifications,
          prayerReminderMinutes:  settings.prayerReminderMinutes,
          fajrNotification:       settings.fajrNotification,
          dhuhrNotification:      settings.dhuhrNotification,
          asrNotification:        settings.asrNotification,
          maghribNotification:    settings.maghribNotification,
          ishaNotification:       settings.ishaNotification,
        });
      }
    } catch {
      setState({ status: "error", message: "Could not fetch prayer times. Check your connection and try again." });
    }
  }, [startTicker, settings]);

  // On mount: if auto-location is disabled and we have a saved location, load it
  useEffect(() => {
    if (hasAutoLoaded.current) return;
    hasAutoLoaded.current = true;
    if (!settings.autoLocation) {
      const saved = getSavedLocation();
      if (saved) loadFromLocation(saved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestGPS = useCallback(async () => {
    setState({ status: "locating" });
    const result = await getNativeLocation();
    if (result.ok) {
      const cityName = await reverseGeocode(result.lat, result.lon);
      await loadFromLocation({ lat: result.lat, lon: result.lon, cityName });
    } else {
      setState({
        status:     "error",
        message:    result.denied
          ? result.message
          : result.message + " Enter your city manually below.",
        permDenied: result.denied,
      });
    }
  }, [loadFromLocation]);

  const handleCitySearch = useCallback(async () => {
    const q = cityInput.trim();
    if (!q) return;
    setCityError("");
    setCityLoading(true);
    try {
      const location = await forwardGeocode(q);
      await loadFromLocation(location);
    } catch (e: unknown) {
      setCityError(e instanceof Error ? e.message : "City not found.");
    } finally {
      setCityLoading(false);
    }
  }, [cityInput, loadFromLocation]);

  const isReady = state.status === "ready";
  const isBusy  = state.status === "locating" || state.status === "fetching";
  const prayers = isReady ? state.data.prayers : [];
  const sunriseTime24 = isReady ? state.data.sunriseTime24 : "06:00";

  const now       = new Date();
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const methodLabel = METHOD_LABELS[settings.calculationMethod] ?? "Muslim World League";
  const madhabLabel = settings.madhab === "hanafi" ? "Hanafi" : "Standard";

  // ── Sunrise row for the daily schedule ────────────────────────────────────
  const sunriseDisplay = sunriseTime24 ? parseTime(sunriseTime24) : null;

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

          {/* Date banner */}
          <div className="mt-4 rounded-2xl bg-primary/8 border border-primary/15 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <span className="text-white text-base font-bold leading-none">{now.getDate()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{dateLabel}</p>
              <p className="font-arabic text-xs text-muted-foreground mt-0.5" dir="rtl">
                {isReady ? state.data.hijriDate : "الجدول اليومي للصلاة"}
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

        {/* ── Live status hero ── */}
        {isReady && liveStatus && (
          <div className="mb-6">
            <StatusHeroCard
              status={liveStatus}
              prayers={prayers}
              sunriseTime24={sunriseTime24}
            />
          </div>
        )}

        {/* ── Location / status panel ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="mb-5 space-y-3"
        >
          {/* Idle */}
          {state.status === "idle" && (
            <div className="rounded-2xl border border-border bg-secondary/40 p-5 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-md">
                <LocateFixed className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Share your location</p>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
                  We use your exact GPS coordinates to calculate precise prayer times for your location.
                </p>
              </div>
              <button
                onClick={requestGPS}
                className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                Get Prayer Times
              </button>
            </div>
          )}

          {/* Loading */}
          {isBusy && (
            <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {state.status === "locating"
                    ? "Getting your GPS coordinates…"
                    : `Fetching times for ${state.location.cityName}…`}
                </p>
                {state.status === "fetching" && (
                  <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">
                    {fmtCoord(state.location.lat, "N", "S")} · {fmtCoord(state.location.lon, "E", "W")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {state.status === "error" && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-destructive">Could not load prayer times</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{state.message}</p>
                </div>
                {!state.permDenied && (
                  <button onClick={requestGPS} className="shrink-0 text-xs font-semibold text-primary hover:underline">
                    Retry GPS
                  </button>
                )}
              </div>

              {/* Permanently denied — guide user to Settings */}
              {state.permDenied && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 p-3 flex items-start gap-2.5">
                  <Settings className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={1.8} />
                  <div>
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">How to enable location</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                      Open your device <strong>Settings</strong> → <strong>Apps</strong> → <strong>Quran Al-Falah</strong> → <strong>Permissions</strong> → enable <strong>Location</strong>, then return here.
                    </p>
                    <button
                      onClick={requestGPS}
                      className="mt-2 text-xs font-semibold text-primary hover:underline"
                    >
                      I've enabled it — try again
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ready — location chip */}
          {state.status === "ready" && (
            <div className="rounded-2xl border border-border bg-secondary/40 p-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-primary" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{state.data.location.cityName}</p>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  {fmtCoord(state.data.location.lat, "N", "S")} · {fmtCoord(state.data.location.lon, "E", "W")}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {methodLabel} · {madhabLabel} Asr
                </p>
              </div>
              <button
                onClick={requestGPS}
                className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary hover:underline mt-0.5"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
          )}

          {/* Manual city input */}
          {(state.status === "error" || state.status === "idle" || state.status === "ready") && (
            <div className="rounded-xl border border-border bg-card/60 p-3">
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                {state.status === "ready" ? "Switch city manually" : "Or enter your city manually"}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  aria-label="City name for prayer times"
                  value={cityInput}
                  onChange={(e) => { setCityInput(e.target.value); setCityError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleCitySearch()}
                  placeholder="e.g. Rawalpindi, Morgah"
                  className="flex-1 text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleCitySearch}
                  disabled={cityLoading || !cityInput.trim()}
                  className="px-3 py-2 rounded-lg gradient-primary text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  {cityLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Search className="w-4 h-4" />}
                </button>
              </div>
              {cityError && (
                <p className="text-xs text-destructive mt-1.5">{cityError}</p>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Prayer list + Sunrise row ── */}
        {isReady ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
              Today's Schedule
            </p>

            {prayers.map((prayer, index) => {
              const isCurrent = liveStatus?.currentPrayerIdx === index;
              const isNext    = index === nextIdx && !isCurrent;

              return (
                <PrayerCard
                  key={prayer.id}
                  prayer={prayer}
                  index={index}
                  isCurrent={isCurrent}
                  isNext={isNext}
                  countdown={countdown}
                />
              );
            })}

            {/* Sunrise row — shown between Fajr and Dhuhr cards */}
            {sunriseDisplay && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.18, ease: "easeOut" }}
                className={cn(
                  "relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600/70 to-orange-700/70 text-white shadow-md border border-amber-500/20",
                  liveStatus?.period === "sunrise" && "ring-2 ring-amber-300/60 shadow-xl scale-[1.01]",
                )}
              >
                {liveStatus?.period === "sunrise" && (
                  <motion.div
                    animate={{ opacity: [0.12, 0.22, 0.12] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-white"
                    aria-hidden="true"
                  />
                )}
                <div className="absolute inset-0 islamic-pattern" aria-hidden="true" />
                <div className="relative flex items-center gap-4 p-4 sm:p-5">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                    <Sunrise className="w-6 h-6 text-yellow-200" strokeWidth={1.6} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-arabic text-sm text-white/70 leading-none mb-0.5" dir="rtl" lang="ar">شروق الشمس</p>
                    <p className="text-base font-semibold text-white leading-tight">Sunrise</p>
                    {liveStatus?.period === "sunrise" && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-white/25 text-white text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Active
                      </span>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xl font-bold text-white tracking-wide">{sunriseDisplay.display}</p>
                    <p className="text-xs text-white/60 font-medium">{sunriseDisplay.suffix}</p>
                    <p className="text-[10px] text-white/50 mt-0.5">No prayer</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : isBusy ? (
          <div className="space-y-3">
            {PRAYER_META.map((meta) => (
              <SkeletonCard key={meta.id} period={meta.period} />
            ))}
          </div>
        ) : null}

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          {isReady
            ? `Times via Aladhan · ${methodLabel} · ${madhabLabel} Asr`
            : "Allow location access or enter your city to load accurate prayer times."}
        </motion.p>

        {/* Bottom safe area */}
        <div style={{ height: "max(1rem, env(safe-area-inset-bottom))" }} />
      </div>
    </div>
  );
}
