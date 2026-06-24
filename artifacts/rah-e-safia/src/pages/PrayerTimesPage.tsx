import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Clock, Sun, Sunrise, Sunset, Moon, Star,
  LocateFixed, Loader2, AlertCircle, MapPin, RefreshCw, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  /** Human-readable city / neighbourhood obtained via reverse geocoding */
  cityName: string;
}

interface ReadyData {
  prayers: PrayerInfo[];
  hijriDate: string;
  location: LocationInfo;
}

type PageState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "fetching"; location: LocationInfo }
  | { status: "error"; message: string; permDenied?: boolean }
  | { status: "ready"; data: ReadyData };

// ─── Constants ────────────────────────────────────────────────────────────────

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

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
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

function nextPrayerIndex(prayers: PrayerInfo[]): number {
  const cur = nowMinutes();
  const idx = prayers.findIndex((p) => toMinutes(p.time24) > cur);
  return idx === -1 ? 0 : idx;
}

function secondsUntil(time24: string, isWrapped: boolean): number {
  const target = toMinutes(time24) * 60;
  const d = new Date();
  const nowSecs = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
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

function fmtCoord(n: number, pos: string, neg: string) {
  return `${Math.abs(n).toFixed(4)}° ${n >= 0 ? pos : neg}`;
}

// ─── API ─────────────────────────────────────────────────────────────────────

/**
 * Reverse-geocode lat/lon → human city name using OSM Nominatim.
 * Falls back to coordinate string if it fails.
 */
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) throw new Error("geocode fail");
    const json = await res.json();
    const a = json.address ?? {};
    // Pick the most specific available label
    const city =
      a.suburb ?? a.neighbourhood ?? a.village ?? a.town ?? a.city ??
      a.county ?? a.state ?? json.display_name?.split(",")[0] ?? "";
    return city.trim() || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

/**
 * Forward-geocode a city name → { lat, lon, cityName }.
 */
async function forwardGeocode(query: string): Promise<LocationInfo> {
  const res = await fetch(
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

/**
 * Fetch prayer times from Aladhan using exact GPS coordinates.
 * The API calculates accurate local timings for the given lat/lon.
 */
async function fetchPrayerTimes(location: LocationInfo): Promise<ReadyData> {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();

  // method=1 (Muslim World League) is widely accepted globally
  const url =
    `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}` +
    `?latitude=${location.lat}&longitude=${location.lon}&method=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Aladhan API error ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(json.status ?? "API error");

  const timings = json.data.timings as Record<string, string>;
  const hijri = json.data.date.hijri;

  const prayers: PrayerInfo[] = PRAYER_META.map((meta) => ({
    id: meta.id,
    name: meta.name,
    arabicName: meta.arabicName,
    // Slice to 5 chars to strip any timezone suffix like " (PKT)"
    time24: timings[meta.id].slice(0, 5),
    icon: meta.icon,
    period: meta.period,
  }));

  const hijriDate = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
  return { prayers, hijriDate, location };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PrayerCard({
  prayer, index, isNext, countdown,
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
        <div className="shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center">
          <Icon className={cn("w-6 h-6", style.iconColor)} strokeWidth={1.6} />
        </div>
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

/** Skeleton card while loading */
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
  const [state, setState] = useState<PageState>({ status: "idle" });
  const [countdown, setCountdown] = useState("--:--");
  const [nextIdx, setNextIdx] = useState(0);
  const [cityInput, setCityInput] = useState("");
  const [cityError, setCityError] = useState("");
  const [cityLoading, setCityLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTicker = useCallback((prayers: PrayerInfo[]) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const tick = () => {
      const idx = nextPrayerIndex(prayers);
      const wrapped = idx === 0 && nowMinutes() > toMinutes(prayers[prayers.length - 1].time24);
      setNextIdx(idx);
      setCountdown(formatCountdown(Math.max(0, secondsUntil(prayers[idx].time24, wrapped))));
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  /** Core flow: given a LocationInfo, fetch and display prayer times */
  const loadFromLocation = useCallback(async (location: LocationInfo) => {
    setState({ status: "fetching", location });
    try {
      const data = await fetchPrayerTimes(location);
      setState({ status: "ready", data });
      startTicker(data.prayers);
    } catch {
      setState({ status: "error", message: "Could not fetch prayer times. Check your connection and try again." });
    }
  }, [startTicker]);

  /** Request GPS from browser — uses high accuracy for precise coordinates */
  const requestGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: "error", message: "Geolocation is not supported by your browser.", permDenied: true });
      return;
    }
    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.lat ?? pos.coords.latitude;
        const lon = pos.coords.lng ?? pos.coords.longitude;
        // Reverse-geocode to get the real neighbourhood/city name
        const cityName = await reverseGeocode(lat, lon);
        await loadFromLocation({ lat, lon, cityName });
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: "Location permission was denied. Enter your city manually below.",
          2: "Your location could not be determined. Enter your city manually below.",
          3: "Location request timed out. Enter your city manually below.",
        };
        setState({
          status: "error",
          message: msgs[err.code] ?? "Location unavailable.",
          permDenied: err.code === 1,
        });
      },
      // HIGH accuracy = GPS chip, not IP/WiFi — critical for neighbourhood-level precision
      { timeout: 12000, enableHighAccuracy: true, maximumAge: 0 }
    );
  }, [loadFromLocation]);

  /** Manual city search fallback */
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
  const isBusy = state.status === "locating" || state.status === "fetching";
  const prayers = isReady ? state.data.prayers : [];
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
            </div>
          )}

          {/* Ready — show exact coordinates for verification */}
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
                  Times calculated from these exact coordinates
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

          {/* Manual city input — shown when permission denied OR as always-available fallback */}
          {(state.status === "error" || state.status === "idle" || state.status === "ready") && (
            <div className="rounded-xl border border-border bg-card/60 p-3">
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                {state.status === "ready" ? "Switch city manually" : "Or enter your city manually"}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
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
          <div className="space-y-3">
            {PRAYER_META.map((meta) => (
              <SkeletonCard key={meta.id} period={meta.period} />
            ))}
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
            ? "Times via Aladhan · Muslim World League method · Calculated from exact GPS coordinates"
            : "Allow location access or enter your city to load accurate prayer times."}
        </motion.p>
      </div>
    </div>
  );
}
