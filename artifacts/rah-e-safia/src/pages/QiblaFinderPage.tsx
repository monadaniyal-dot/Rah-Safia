import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Compass, MapPin, LocateFixed, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/use-settings";
import { getSavedLocation } from "@/lib/location-store";

const KAABA = { lat: 21.4225, lon: 39.8262 };

function calcQibla(userLat: number, userLon: number): number {
  const φ1 = (userLat * Math.PI) / 180;
  const φ2 = (KAABA.lat * Math.PI) / 180;
  const Δλ = ((KAABA.lon - userLon) * Math.PI) / 180;
  const x = Math.sin(Δλ) * Math.cos(φ2);
  const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const bearing = (Math.atan2(x, y) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

function bearingToCardinal(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

const cardinals = [
  { label: "N", style: "top-2 left-1/2 -translate-x-1/2" },
  { label: "E", style: "right-2 top-1/2 -translate-y-1/2" },
  { label: "S", style: "bottom-2 left-1/2 -translate-x-1/2" },
  { label: "W", style: "left-2 top-1/2 -translate-y-1/2" },
];

const intercardinals = [
  { label: "NE", deg: 45 },
  { label: "SE", deg: 135 },
  { label: "SW", deg: 225 },
  { label: "NW", deg: 315 },
];

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; lat: number; lon: number; qibla: number };

export default function QiblaFinderPage() {
  const { settings } = useSettings();
  const [state, setState] = useState<State>({ status: "idle" });

  // On mount: if auto-location is off and we have a saved location, compute qibla directly
  useEffect(() => {
    if (!settings.autoLocation) {
      const saved = getSavedLocation();
      if (saved) {
        const qibla = calcQibla(saved.lat, saved.lon);
        setState({ status: "ready", lat: saved.lat, lon: saved.lon, qibla });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: "error", message: "Geolocation is not supported by your browser." });
      return;
    }
    setState({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const qibla = calcQibla(lat, lon);
        setState({ status: "ready", lat, lon, qibla });
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Location permission was denied. Please allow location access and try again.",
          2: "Your location could not be determined. Please try again.",
          3: "Location request timed out. Please try again.",
        };
        setState({ status: "error", message: messages[err.code] ?? "An unknown error occurred." });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  const qiblaAngle = state.status === "ready" ? Math.round(state.qibla) : 0;
  const hasResult = state.status === "ready";

  return (
    <div className="min-h-full flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 shadow-sm">
          <Compass className="w-4 h-4 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="font-semibold text-foreground text-sm leading-tight">Qibla Finder</h1>
          <p className="font-arabic text-muted-foreground text-xs leading-tight" dir="rtl">
            اتجاه القبلة
          </p>
        </div>
      </header>

      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-xl mx-auto w-full">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="hidden lg:flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Qibla Finder
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground leading-tight">
            Direction to Makkah
          </h2>
          <p className="font-arabic text-muted-foreground text-base mt-0.5" dir="rtl">
            اتجاه القبلة المقدسة
          </p>
        </motion.div>

        {/* Quranic verse */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-center mb-6 py-4 px-4 rounded-2xl bg-gold-muted/60"
        >
          <p className="font-arabic text-primary text-lg leading-relaxed" dir="rtl">
            فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            "Turn your face towards the Sacred Mosque." — Quran 2:144
          </p>
        </motion.div>

        {/* Location request / status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          {state.status === "idle" && (
            <div className="rounded-2xl border border-border bg-secondary/40 p-5 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-md">
                <LocateFixed className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Share your location</p>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
                  Allow location access so we can calculate the exact Qibla direction for your position.
                </p>
              </div>
              <button
                onClick={requestLocation}
                className="mt-1 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                Allow Location Access
              </button>
            </div>
          )}

          {state.status === "loading" && (
            <div className="rounded-2xl border border-border bg-secondary/40 p-5 flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Detecting your location…</p>
            </div>
          )}

          {state.status === "error" && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-destructive">Location error</p>
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
            <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Your coordinates</p>
                <p className="text-sm font-semibold text-foreground font-mono">
                  {state.lat.toFixed(5)}°, {state.lon.toFixed(5)}°
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

        {/* Compass — only shown once location is ready */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: hasResult ? 1 : 0.35, scale: hasResult ? 1 : 0.95 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex justify-center mb-8"
        >
          <div className="relative" style={{ width: 280, height: 280 }}>

            {/* Outermost glow ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, transparent 48%, hsl(var(--primary)/0.12) 60%, transparent 70%)",
              }}
            />

            {/* Outer decorative ring */}
            <div className="absolute inset-0 rounded-full border-2 border-border bg-card shadow-lg overflow-hidden">
              {/* Islamic pattern overlay */}
              <div className="absolute inset-0 islamic-pattern opacity-60" />

              {/* Tick marks */}
              {Array.from({ length: 36 }).map((_, i) => {
                const isMajor = i % 9 === 0;
                const isMinor = i % 3 === 0;
                return (
                  <div
                    key={i}
                    className="absolute inset-0 flex justify-center"
                    style={{ transform: `rotate(${i * 10}deg)` }}
                    aria-hidden="true"
                  >
                    <div
                      className={cn(
                        "rounded-full",
                        isMajor
                          ? "w-0.5 h-5 bg-primary/70 mt-1"
                          : isMinor
                          ? "w-px h-3.5 bg-border mt-1.5"
                          : "w-px h-2 bg-border/50 mt-2"
                      )}
                    />
                  </div>
                );
              })}

              {/* Cardinal labels */}
              {cardinals.map(({ label, style }) => (
                <div
                  key={label}
                  className={cn(
                    "absolute flex items-center justify-center w-7 h-7 text-xs font-bold",
                    label === "N" ? "text-primary" : "text-muted-foreground",
                    style
                  )}
                >
                  {label}
                </div>
              ))}

              {/* Inter-cardinal labels */}
              {intercardinals.map(({ label, deg }) => {
                const rad = ((deg - 90) * Math.PI) / 180;
                const r = 120, cx = 140, cy = 140;
                return (
                  <div
                    key={label}
                    className="absolute text-[9px] text-muted-foreground/60 font-medium -translate-x-1/2 -translate-y-1/2"
                    style={{ left: cx + r * Math.cos(rad), top: cy + r * Math.sin(rad) }}
                    aria-hidden="true"
                  >
                    {label}
                  </div>
                );
              })}
            </div>

            {/* Inner compass face */}
            <div className="absolute inset-5 rounded-full bg-card border border-border shadow-inner flex items-center justify-center">
              {/* Needle */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `rotate(${qiblaAngle}deg)`,
                  transition: hasResult ? "transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
                }}
              >
                <div className="relative flex flex-col items-center" style={{ height: 160 }}>
                  <div className="flex flex-col items-center gap-0.5">
                    <span
                      className="text-lg leading-none"
                      style={{ transform: `rotate(${-qiblaAngle}deg)` }}
                      title="Kaaba — Direction of Makkah"
                    >
                      🕋
                    </span>
                    <div
                      className="w-0 h-0"
                      style={{
                        borderLeft: "6px solid transparent",
                        borderRight: "6px solid transparent",
                        borderBottom: "40px solid hsl(var(--primary))",
                      }}
                    />
                  </div>
                  <div className="flex-1" />
                  <div
                    className="w-0 h-0"
                    style={{
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: "32px solid hsl(0 72% 51%)",
                    }}
                  />
                </div>
              </div>

              {/* Center hub */}
              <div className="relative z-10 w-5 h-5 rounded-full bg-gold border-2 border-card shadow-md" />
            </div>

            {/* Degree label on the compass ring */}
            {hasResult && (() => {
              const rad = ((qiblaAngle - 90) * Math.PI) / 180;
              const r = 104, cx = 140, cy = 140;
              return (
                <div
                  className="absolute z-20 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold -translate-x-1/2 -translate-y-1/2"
                  style={{ left: cx + r * Math.cos(rad), top: cy + r * Math.sin(rad) }}
                >
                  {qiblaAngle}°
                </div>
              );
            })()}

            {/* Placeholder text when idle */}
            {!hasResult && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[10px] text-muted-foreground/50 text-center px-8 leading-relaxed">
                  {state.status === "loading" ? "Locating…" : "Allow location\nto see direction"}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Direction info card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-2xl overflow-hidden gradient-primary islamic-pattern text-white shadow-lg mb-4"
        >
          <div className="relative p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 text-3xl">
              🕋
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-arabic text-white/75 text-sm leading-none mb-1" dir="rtl">
                اتجاه القبلة
              </p>
              <p className="text-white font-bold text-lg leading-tight">Direction towards Makkah</p>
              <p className="text-white/70 text-sm mt-0.5">Al-Masjid Al-Ḥarām · Makkah al-Mukarramah</p>
            </div>
            <div className="shrink-0 text-right">
              {hasResult ? (
                <>
                  <p className="text-3xl font-bold text-white">{qiblaAngle}°</p>
                  <p className="text-white/60 text-xs font-medium">from North</p>
                </>
              ) : (
                <p className="text-white/50 text-sm">—°</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.32 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            {
              label: "Bearing",
              value: hasResult ? `${qiblaAngle}°` : "—",
              sub: "from North",
            },
            {
              label: "Cardinal",
              value: hasResult ? bearingToCardinal(qiblaAngle) : "—",
              sub: hasResult ? bearingToCardinal(qiblaAngle) : "unknown",
            },
            {
              label: "Kaaba",
              value: "21.42°N",
              sub: "39.83°E",
            },
          ].map(({ label, value, sub }) => (
            <div key={label} className="rounded-xl bg-secondary/60 border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-base font-bold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.38 }}
          className="flex items-start gap-3 rounded-xl bg-gold-muted/60 border border-gold/20 p-4"
        >
          <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" strokeWidth={1.8} />
          <div>
            <p className="text-sm font-medium text-foreground">How to use</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Allow location access above. The green arrow (🕋) will point toward the Qibla from
              your current location — simply face that direction to face the Kaaba.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
