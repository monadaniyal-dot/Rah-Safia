import { motion } from "framer-motion";
import { Compass, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const QIBLA_ANGLE = 267;

const cardinals = [
  { label: "N", deg: 0,   style: "top-2 left-1/2 -translate-x-1/2" },
  { label: "E", deg: 90,  style: "right-2 top-1/2 -translate-y-1/2" },
  { label: "S", deg: 180, style: "bottom-2 left-1/2 -translate-x-1/2" },
  { label: "W", deg: 270, style: "left-2 top-1/2 -translate-y-1/2" },
];

const intercardinals = [
  { label: "NE", deg: 45  },
  { label: "SE", deg: 135 },
  { label: "SW", deg: 225 },
  { label: "NW", deg: 315 },
];

export default function QiblaFinderPage() {
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
          className="text-center mb-8 py-4 px-4 rounded-2xl bg-gold-muted/60"
        >
          <p className="font-arabic text-primary text-lg leading-relaxed" dir="rtl">
            فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            "Turn your face towards the Sacred Mosque." — Quran 2:144
          </p>
        </motion.div>

        {/* Compass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
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

            {/* Outer decorative ring (tick marks + cardinals) */}
            <div
              className="absolute inset-0 rounded-full border-2 border-border bg-card shadow-lg overflow-hidden"
            >
              {/* Islamic pattern overlay */}
              <div className="absolute inset-0 islamic-pattern opacity-60" />

              {/* Tick marks — 36 × 10° */}
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

              {/* Cardinal direction labels */}
              {cardinals.map(({ label, style }) => (
                <div
                  key={label}
                  className={cn(
                    "absolute flex items-center justify-center w-7 h-7",
                    "text-xs font-bold",
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
                const r = 120;
                const cx = 140, cy = 140;
                const x = cx + r * Math.cos(rad);
                const y = cy + r * Math.sin(rad);
                return (
                  <div
                    key={label}
                    className="absolute text-[9px] text-muted-foreground/60 font-medium -translate-x-1/2 -translate-y-1/2"
                    style={{ left: x, top: y }}
                    aria-hidden="true"
                  >
                    {label}
                  </div>
                );
              })}
            </div>

            {/* Inner compass face */}
            <div className="absolute inset-5 rounded-full bg-card border border-border shadow-inner flex items-center justify-center">

              {/* Needle — rotated to Qibla angle */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: `rotate(${QIBLA_ANGLE}deg)` }}
              >
                {/* Needle shaft */}
                <div className="relative flex flex-col items-center" style={{ height: 160 }}>
                  {/* Makkah tip (top — points in the Qibla direction) */}
                  <div className="flex flex-col items-center gap-0.5">
                    {/* Kaaba icon */}
                    <span
                      className="text-lg leading-none"
                      style={{ transform: `rotate(${-QIBLA_ANGLE}deg)` }}
                      title="Kaaba — Direction of Makkah"
                    >
                      🕋
                    </span>
                    {/* Green pointed triangle */}
                    <div
                      className="w-0 h-0"
                      style={{
                        borderLeft: "6px solid transparent",
                        borderRight: "6px solid transparent",
                        borderBottom: "40px solid hsl(var(--primary))",
                      }}
                    />
                  </div>

                  {/* Center gap (hidden behind hub) */}
                  <div className="flex-1" />

                  {/* Tail (red — opposite direction) */}
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

              {/* Center gold hub */}
              <div className="relative z-10 w-5 h-5 rounded-full bg-gold border-2 border-card shadow-md" />
            </div>

            {/* Degree marker ring — shows 267° label */}
            {(() => {
              const rad = ((QIBLA_ANGLE - 90) * Math.PI) / 180;
              const r = 104;
              const cx = 140, cy = 140;
              const x = cx + r * Math.cos(rad);
              const y = cy + r * Math.sin(rad);
              return (
                <div
                  className="absolute z-20 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold -translate-x-1/2 -translate-y-1/2"
                  style={{ left: x, top: y }}
                >
                  {QIBLA_ANGLE}°
                </div>
              );
            })()}
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
              <p className="text-white font-bold text-lg leading-tight">
                Direction towards Makkah
              </p>
              <p className="text-white/70 text-sm mt-0.5">
                Al-Masjid Al-Ḥarām · Makkah al-Mukarramah
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-3xl font-bold text-white">{QIBLA_ANGLE}°</p>
              <p className="text-white/60 text-xs font-medium">from North</p>
            </div>
          </div>
        </motion.div>

        {/* Bearing detail row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.32 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { label: "Bearing", value: `${QIBLA_ANGLE}°`, sub: "from North" },
            { label: "Cardinal", value: "W", sub: "West" },
            { label: "Deviation", value: "3° S", sub: "of due West" },
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
              Hold your device flat, then align the green arrow (🕋) with your surroundings. 
              Face in the direction the green needle points — that is the Qibla direction.
            </p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          Showing a fixed reference bearing of {QIBLA_ANGLE}°. GPS-based accuracy coming soon.
        </motion.p>
      </div>
    </div>
  );
}
