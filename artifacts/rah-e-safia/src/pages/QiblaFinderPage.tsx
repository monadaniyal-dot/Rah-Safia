import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Compass, MapPin, LocateFixed, Loader2, AlertCircle, Settings, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/use-settings";
import { getSavedLocation } from "@/lib/location-store";
import { getNativeLocation } from "@/lib/native-location";
import { useCompassHeading } from "@/lib/use-compass-heading";

// ─── Constants ────────────────────────────────────────────────────────────────

const KAABA = { lat: 21.4225, lon: 39.8262 };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcQibla(userLat: number, userLon: number): number {
  const φ1 = (userLat * Math.PI) / 180;
  const φ2 = (KAABA.lat * Math.PI) / 180;
  const Δλ = ((KAABA.lon - userLon) * Math.PI) / 180;
  const x  = Math.sin(Δλ) * Math.cos(φ2);
  const y  = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.atan2(x, y) * 180 / Math.PI + 360) % 360;
}

function bearingToCardinal(deg: number): string {
  return ["N","NE","E","SE","S","SW","W","NW"][Math.round(deg / 45) % 8];
}

// ─── Static compass geometry ──────────────────────────────────────────────────

const CARDINALS = [
  { label: "N", style: "top-2 left-1/2 -translate-x-1/2"    },
  { label: "E", style: "right-2 top-1/2 -translate-y-1/2"   },
  { label: "S", style: "bottom-2 left-1/2 -translate-x-1/2" },
  { label: "W", style: "left-2 top-1/2 -translate-y-1/2"    },
];

const INTERCARDINALS = [
  { label: "NE", deg: 45  },
  { label: "SE", deg: 135 },
  { label: "SW", deg: 225 },
  { label: "NW", deg: 315 },
];

// ─── State types ──────────────────────────────────────────────────────────────

type LocState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string; denied?: boolean }
  | { status: "ready"; lat: number; lon: number; qibla: number };

// ─── Component ────────────────────────────────────────────────────────────────

export default function QiblaFinderPage() {
  const { settings } = useSettings();
  const [locState, setLocState] = useState<LocState>({ status: "idle" });
  const compass = useCompassHeading();

  // On mount: if auto-location is off and we have a saved location, compute qibla directly
  useEffect(() => {
    if (!settings.autoLocation) {
      const saved = getSavedLocation();
      if (saved) {
        setLocState({
          status: "ready",
          lat: saved.lat,
          lon: saved.lon,
          qibla: calcQibla(saved.lat, saved.lon),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestLocation = useCallback(async () => {
    setLocState({ status: "loading" });
    const result = await getNativeLocation();
    if (result.ok) {
      setLocState({
        status: "ready",
        lat: result.lat,
        lon: result.lon,
        qibla: calcQibla(result.lat, result.lon),
      });
    } else {
      setLocState({ status: "error", message: result.message, denied: result.denied });
    }
  }, []);

  const hasResult  = locState.status === "ready";
  const qiblaAngle = hasResult ? Math.round((locState as { qibla: number }).qibla) : 0;

  // ── Compass rotation maths ────────────────────────────────────────────────
  //
  //  The outer ring (rose) rotates by -heading so that its "N" label always
  //  points toward geographic North regardless of how the phone is oriented.
  //
  //  The Qibla needle rotates by (qiblaAngle - heading) so it always points
  //  toward Makkah on the screen.
  //
  //  The 🕋 emoji counter-rotates by -(needleRotation) so it stays upright.
  //
  const isLive       = hasResult && compass.heading !== null && compass.supported;
  const heading      = compass.heading ?? 0;
  const dialRotation = isLive ? -heading : 0;
  const needleRot    = isLive ? (qiblaAngle - heading + 360) % 360 : qiblaAngle;
  const kaabaCtrRot  = -needleRot; // keeps 🕋 emoji upright

  // CSS transition strings
  const liveTrans    = "transform 0.10s linear";
  const initialTrans = hasResult ? "transform 0.9s cubic-bezier(0.34,1.56,0.64,1)" : "none";
  const dialTrans    = isLive ? liveTrans : "none";
  const needleTrans  = isLive ? liveTrans : initialTrans;

  return (
    <div className="min-h-full flex flex-col">

      {/* ── Mobile header ── */}
      <header className="lg:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 shadow-sm">
          <Compass className="w-4 h-4 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="font-semibold text-foreground text-sm leading-tight">Qibla Finder</h1>
          <p className="font-arabic text-muted-foreground text-xs leading-tight" dir="rtl">اتجاه القبلة</p>
        </div>
      </header>

      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-xl mx-auto w-full">

        {/* ── Page header ── */}
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

        {/* ── Quranic verse ── */}
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

        {/* ── Sensor banners ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="mb-4 space-y-2"
        >
          {/* Compass not supported on this device / browser */}
          {!compass.supported && (
            <div className="rounded-xl border border-border bg-secondary/60 p-3 flex items-start gap-2.5">
              <Compass className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" strokeWidth={1.8} />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Compass sensor unavailable on this device. The Qibla bearing below is still
                accurate — point the phone's top edge in that compass direction.
              </p>
            </div>
          )}

          {/* Magnetometer needs calibration */}
          {compass.supported && compass.needsCalibration && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/40 p-3 flex items-start gap-2.5">
              <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  Compass needs calibration
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                  Move your phone slowly in a <strong>figure-8 pattern</strong> a few times,
                  then hold it flat and level. The compass will lock on automatically.
                </p>
              </div>
            </div>
          )}

          {/* Live heading indicator pill */}
          {isLive && !compass.needsCalibration && (
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-semibold text-primary">
                  Live compass · {Math.round(heading)}° from North
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Location request / status ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          {locState.status === "idle" && (
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

          {locState.status === "loading" && (
            <div className="rounded-2xl border border-border bg-secondary/40 p-5 flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Detecting your location…</p>
            </div>
          )}

          {locState.status === "error" && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-destructive">Location error</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {locState.message}
                  </p>
                </div>
                {!locState.denied && (
                  <button
                    onClick={requestLocation}
                    className="shrink-0 text-xs font-semibold text-primary hover:underline"
                  >
                    Retry
                  </button>
                )}
              </div>

              {locState.denied && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 p-3 flex items-start gap-2.5">
                  <Settings className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={1.8} />
                  <div>
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">How to enable location</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                      Open your device <strong>Settings</strong> → <strong>Apps</strong> →{" "}
                      <strong>Quran Al-Falah</strong> → <strong>Permissions</strong> → enable{" "}
                      <strong>Location</strong>, then return here.
                    </p>
                    <button
                      onClick={requestLocation}
                      className="mt-2 text-xs font-semibold text-primary hover:underline"
                    >
                      I've enabled it — try again
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {locState.status === "ready" && (
            <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Your coordinates</p>
                <p className="text-sm font-semibold text-foreground font-mono">
                  {locState.lat.toFixed(5)}°, {locState.lon.toFixed(5)}°
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

        {/* ══════════════════════════════════════════════════════════════════
            COMPASS
            ══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: hasResult ? 1 : 0.35, scale: hasResult ? 1 : 0.95 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex justify-center mb-8"
        >
          {/* Fixed-size container; all children use absolute positioning */}
          <div className="relative" style={{ width: 280, height: 280 }}>

            {/* ── Glow halo ── */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, transparent 48%, hsl(var(--primary)/0.12) 60%, transparent 70%)",
              }}
            />

            {/* ══════════════════════════════════════════════════════
                ROTATING COMPASS ROSE (outer ring)
                Rotates by −heading so "N" always points North.
                ══════════════════════════════════════════════════ */}
            <div
              className="absolute inset-0 rounded-full border-2 border-border bg-card shadow-lg overflow-hidden"
              style={{ transform: `rotate(${dialRotation}deg)`, transition: dialTrans }}
            >
              {/* Islamic pattern texture */}
              <div className="absolute inset-0 islamic-pattern opacity-60" aria-hidden="true" />

              {/* Degree tick marks — fixed on the ring */}
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
                        isMajor  ? "w-0.5 h-5 bg-primary/70 mt-1"    :
                        isMinor  ? "w-px h-3.5 bg-border mt-1.5"      :
                                   "w-px h-2 bg-border/50 mt-2"
                      )}
                    />
                  </div>
                );
              })}

              {/* Cardinal labels — N/E/S/W, fixed to the ring */}
              {CARDINALS.map(({ label, style }) => (
                <div
                  key={label}
                  className={cn(
                    "absolute flex items-center justify-center w-7 h-7 text-xs font-bold select-none",
                    label === "N" ? "text-primary" : "text-muted-foreground",
                    style
                  )}
                >
                  {label}
                </div>
              ))}

              {/* Inter-cardinal labels */}
              {INTERCARDINALS.map(({ label, deg }) => {
                const rad = ((deg - 90) * Math.PI) / 180;
                const r = 120, cx = 140, cy = 140;
                return (
                  <div
                    key={label}
                    className="absolute text-[9px] text-muted-foreground/60 font-medium -translate-x-1/2 -translate-y-1/2 select-none"
                    style={{ left: cx + r * Math.cos(rad), top: cy + r * Math.sin(rad) }}
                    aria-hidden="true"
                  >
                    {label}
                  </div>
                );
              })}
            </div>
            {/* end rotating rose */}

            {/* ══════════════════════════════════════════════════════
                INNER COMPASS FACE — static backdrop + rotating needle
                ══════════════════════════════════════════════════ */}
            <div className="absolute inset-5 rounded-full bg-card border border-border shadow-inner flex items-center justify-center">

              {/* ── Qibla needle (rotates to point toward Makkah) ── */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: `rotate(${needleRot}deg)`, transition: needleTrans }}
              >
                <div className="relative flex flex-col items-center" style={{ height: 160 }}>
                  {/* Top half — points toward Makkah */}
                  <div className="flex flex-col items-center gap-0.5">
                    {/* 🕋 counter-rotates so it always appears upright */}
                    <span
                      className="text-lg leading-none"
                      style={{ transform: `rotate(${kaabaCtrRot}deg)`, transition: needleTrans }}
                      aria-label="Kaaba — Direction of Makkah"
                    >
                      🕋
                    </span>
                    {/* Green arrowhead */}
                    <div
                      className="w-0 h-0"
                      style={{
                        borderLeft:   "6px solid transparent",
                        borderRight:  "6px solid transparent",
                        borderBottom: "40px solid hsl(var(--primary))",
                      }}
                    />
                  </div>
                  <div className="flex-1" />
                  {/* Tail — red arrowhead */}
                  <div
                    className="w-0 h-0"
                    style={{
                      borderLeft:  "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop:   "32px solid hsl(0 72% 51%)",
                    }}
                  />
                </div>
              </div>
              {/* end needle */}

              {/* Center hub */}
              <div className="relative z-10 w-5 h-5 rounded-full bg-gold border-2 border-card shadow-md" />

              {/* Idle / loading placeholder */}
              {!hasResult && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[10px] text-muted-foreground/50 text-center px-8 leading-relaxed">
                    {locState.status === "loading" ? "Locating…" : "Allow location\nto see direction"}
                  </p>
                </div>
              )}
            </div>
            {/* end inner face */}

            {/* ── Fixed North-up indicator (top of screen) ── */}
            {isLive && (
              <div
                className="absolute left-1/2 -translate-x-1/2 z-20"
                style={{ top: -8 }}
                aria-label="True North indicator"
              >
                <div className="w-0 h-0"
                  style={{
                    borderLeft:   "5px solid transparent",
                    borderRight:  "5px solid transparent",
                    borderBottom: "10px solid hsl(var(--primary))",
                  }}
                />
              </div>
            )}

          </div>
        </motion.div>
        {/* end compass */}

        {/* ── Direction info card ── */}
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
              <p className="font-arabic text-white/75 text-sm leading-none mb-1" dir="rtl">اتجاه القبلة</p>
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

        {/* ── Stats row ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.32 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            {
              label: "Qibla",
              value: hasResult ? `${qiblaAngle}°` : "—",
              sub:   "bearing from N",
            },
            {
              label: "Heading",
              value: isLive ? `${Math.round(heading)}°` : "—",
              sub:   isLive ? bearingToCardinal(heading) : "no sensor",
            },
            {
              label: "Kaaba",
              value: "21.42°N",
              sub:   "39.83°E",
            },
          ].map(({ label, value, sub }) => (
            <div key={label} className="rounded-xl bg-secondary/60 border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-base font-bold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
            </div>
          ))}
        </motion.div>

        {/* ── How-to tip ── */}
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
              {compass.supported
                ? "Hold the phone flat and level. The compass rose rotates with your phone — " +
                  "the 🕋 arrow always points toward the Kaaba. Face that direction to face the Qibla."
                : "Allow location access above, then note the bearing shown. Use a physical compass " +
                  "or another app to face that direction — that is the Qibla from your location."}
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
