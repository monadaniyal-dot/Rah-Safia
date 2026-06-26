import { useMemo } from "react";
import { motion } from "framer-motion";
import { toHijri, formatHijri, formatHijriArabic } from "@/lib/hijri";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatGregorian(date: Date): { weekday: string; full: string } {
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();
  return { weekday, full: `${day} ${month} ${year}` };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DualDateDisplay() {
  const { gregorian, hijri, hijriAr, error } = useMemo(() => {
    try {
      const today = new Date();
      const h = toHijri(today);
      return {
        gregorian: formatGregorian(today),
        hijri: formatHijri(h),
        hijriAr: formatHijriArabic(h),
        error: false,
      };
    } catch {
      return { gregorian: null, hijri: null, hijriAr: null, error: true };
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
      className="mb-6"
    >
      <div
        className="relative overflow-hidden rounded-2xl shadow-md"
        style={{
          background:
            "linear-gradient(135deg, #1a3a2a 0%, #0f2d20 55%, #0a2018 100%)",
        }}
      >
        {/* Subtle pattern */}
        <div className="absolute inset-0 islamic-pattern opacity-25 pointer-events-none" aria-hidden="true" />

        {/* Gold glow top-right */}
        <div
          className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {error ? (
          /* Graceful fallback */
          <div className="relative px-5 py-4 text-center">
            <p className="text-white/50 text-sm">Date information unavailable</p>
          </div>
        ) : (
          <div className="relative flex flex-col sm:flex-row items-stretch">

            {/* ── Gregorian side ── */}
            <div className="flex-1 flex items-center gap-3.5 px-5 py-4 sm:py-5">
              {/* Calendar icon */}
              <div className="shrink-0 w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                <span className="text-lg leading-none select-none">📅</span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45 leading-none mb-1">
                  Gregorian
                </p>
                <p className="text-white/60 text-xs font-medium leading-none mb-1">
                  {gregorian!.weekday}
                </p>
                <p className="text-white font-bold leading-tight" style={{ fontSize: "clamp(0.9rem, 3vw, 1.05rem)" }}>
                  {gregorian!.full}
                </p>
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="hidden sm:flex items-center">
              <div className="w-px self-stretch my-4 bg-white/15" />
            </div>
            <div className="sm:hidden h-px mx-5 bg-white/10" />

            {/* ── Hijri side ── */}
            <div className="flex-1 flex items-center gap-3.5 px-5 py-4 sm:py-5">
              {/* Crescent icon */}
              <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/25 flex items-center justify-center">
                <span className="text-xl leading-none select-none">☽</span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300/60 leading-none mb-1">
                  Islamic (Hijri)
                </p>
                {/* Arabic script */}
                <p
                  className="font-arabic text-amber-100/70 leading-none mb-1 truncate"
                  dir="rtl"
                  style={{ fontSize: "clamp(0.8rem, 2.5vw, 0.95rem)" }}
                >
                  {hijriAr}
                </p>
                {/* English — most prominent */}
                <p
                  className="text-amber-200 font-bold leading-tight truncate"
                  style={{ fontSize: "clamp(0.9rem, 3vw, 1.05rem)" }}
                >
                  {hijri}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
