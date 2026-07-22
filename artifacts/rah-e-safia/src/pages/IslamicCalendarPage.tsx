import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
  Clock,
  BookOpen,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toHijri, formatHijri, HIJRI_MONTHS } from "@/lib/hijri";
import {
  buildCalendarMonth,
  daysInHijriMonth,
} from "@/lib/islamic-calendar";
import {
  ISLAMIC_EVENTS,
  HIJRI_MONTH_DESCRIPTIONS,
  getUpcomingEvents,
  type ComputedEvent,
  type IslamicEvent,
} from "@/lib/islamic-events-data";

// ── Colour palette ────────────────────────────────────────────────────────────
const COLOR = {
  emerald: {
    badge:  "bg-emerald-500/15 text-emerald-400 dark:text-emerald-300 border-emerald-500/25",
    border: "border-emerald-500/30",
    ring:   "ring-emerald-500/40",
    dot:    "bg-emerald-400",
    text:   "text-emerald-400",
    glow:   "shadow-emerald-500/10",
    header: "from-emerald-900/70 to-emerald-950/80",
  },
  violet: {
    badge:  "bg-violet-500/15 text-violet-400 dark:text-violet-300 border-violet-500/25",
    border: "border-violet-500/30",
    ring:   "ring-violet-500/40",
    dot:    "bg-violet-400",
    text:   "text-violet-400",
    glow:   "shadow-violet-500/10",
    header: "from-violet-900/70 to-violet-950/80",
  },
  amber: {
    badge:  "bg-amber-500/15 text-amber-400 dark:text-amber-300 border-amber-500/25",
    border: "border-amber-500/30",
    ring:   "ring-amber-500/40",
    dot:    "bg-amber-400",
    text:   "text-amber-400",
    glow:   "shadow-amber-500/10",
    header: "from-amber-900/70 to-amber-950/80",
  },
  rose: {
    badge:  "bg-rose-500/15 text-rose-400 dark:text-rose-300 border-rose-500/25",
    border: "border-rose-500/30",
    ring:   "ring-rose-500/40",
    dot:    "bg-rose-400",
    text:   "text-rose-400",
    glow:   "shadow-rose-500/10",
    header: "from-rose-900/70 to-rose-950/80",
  },
  sky: {
    badge:  "bg-sky-500/15 text-sky-400 dark:text-sky-300 border-sky-500/25",
    border: "border-sky-500/30",
    ring:   "ring-sky-500/40",
    dot:    "bg-sky-400",
    text:   "text-sky-400",
    glow:   "shadow-sky-500/10",
    header: "from-sky-900/70 to-sky-950/80",
  },
  teal: {
    badge:  "bg-teal-500/15 text-teal-400 dark:text-teal-300 border-teal-500/25",
    border: "border-teal-500/30",
    ring:   "ring-teal-500/40",
    dot:    "bg-teal-400",
    text:   "text-teal-400",
    glow:   "shadow-teal-500/10",
    header: "from-teal-900/70 to-teal-950/80",
  },
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatGregorian(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatGregorianShort(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Navigate one Hijri month forward or backward
function stepMonth(year: number, month: number, dir: 1 | -1): [number, number] {
  let m = month + dir;
  let y = year;
  if (m > 12) { m = 1;  y++; }
  if (m < 1)  { m = 12; y--; }
  return [y, m];
}

// ── Event detail modal ────────────────────────────────────────────────────────

interface EventModalProps {
  event: (ComputedEvent & { hijriYear?: number; gregDate?: Date; daysRemaining?: number }) | IslamicEvent | null;
  onClose: () => void;
}

function EventModal({ event, onClose }: EventModalProps) {
  const c = event ? COLOR[event.color] : COLOR.emerald;

  return (
    <AnimatePresence>
      {event && (
        <>
          {/* Backdrop */}
          <motion.div
            key="ev-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="ev-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-card border-t",
              "shadow-2xl overflow-hidden max-h-[90vh] flex flex-col",
              c.border,
            )}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className={cn("px-5 pt-3 pb-4 bg-gradient-to-br shrink-0", c.header)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl leading-none">{event.emoji}</span>
                  <div>
                    <h2 className="text-lg font-bold text-foreground leading-tight">{event.name}</h2>
                    <p className="font-arabic text-base text-muted-foreground mt-0.5" dir="rtl" lang="ar">
                      {event.arabicName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Date info if available */}
              {"gregDate" in event && event.gregDate && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", c.badge)}>
                    {HIJRI_MONTHS[(event.hijriMonth ?? 1) - 1]} {"hijriYear" in event ? event.hijriYear : ""} AH
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border font-medium">
                    {formatGregorianShort(event.gregDate)}
                  </span>
                  {"daysRemaining" in event && (
                    <span className={cn("text-xs px-2.5 py-1 rounded-full border font-semibold", c.badge)}>
                      {event.daysRemaining === 0
                        ? "Today!"
                        : `In ${event.daysRemaining} day${event.daysRemaining === 1 ? "" : "s"}`}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Scrollable content */}
            <div
              className="overflow-y-auto flex-1 px-5 py-4 space-y-5"
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
            >
              {/* Importance */}
              <div className={cn("rounded-xl p-3 border", c.border, "bg-card")}>
                <p className={cn("text-xs font-semibold uppercase tracking-wider mb-1", c.text)}>
                  Significance
                </p>
                <p className="text-sm text-foreground font-medium">{event.importance}</p>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>

              {/* Quran references */}
              {event.quranRefs && event.quranRefs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm font-semibold text-foreground">Qur'anic Reference</p>
                  </div>
                  {event.quranRefs.map((v, i) => (
                    <div key={i} className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                      <p
                        className="font-arabic text-right text-foreground leading-loose"
                        dir="rtl"
                        lang="ar"
                        style={{ fontSize: "clamp(0.95rem, 3vw, 1.1rem)" }}
                      >
                        {v.arabic}
                      </p>
                      <p className="text-xs text-muted-foreground italic leading-relaxed">
                        "{v.translation}"
                      </p>
                      <p className={cn("text-xs font-semibold", c.text)}>{v.reference}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Hadith references */}
              {event.hadithRefs && event.hadithRefs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Quote className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm font-semibold text-foreground">Hadith Reference</p>
                  </div>
                  {event.hadithRefs.map((h, i) => (
                    <div key={i} className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5">
                      <p className="text-xs text-muted-foreground italic leading-relaxed">
                        "{h.text}"
                      </p>
                      <p className={cn("text-xs font-semibold", c.text)}>{h.source}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function IslamicCalendarPage() {
  const today = useMemo(() => new Date(), []);
  const todayHijri = useMemo(() => toHijri(today), [today]);

  const [viewYear,  setViewYear]  = useState(todayHijri.year);
  const [viewMonth, setViewMonth] = useState(todayHijri.month);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [selectedEvent, setSelectedEvent] = useState<ComputedEvent | null>(null);

  // Build calendar cells for the current view month
  const calendarCells = useMemo(
    () => buildCalendarMonth(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  // Events for the current view month (to show dots on calendar)
  const eventsThisMonth = useMemo(() => {
    return ISLAMIC_EVENTS.filter(
      (e) => e.hijriMonth === viewMonth,
    );
  }, [viewMonth]);

  // Upcoming events list
  const upcomingEvents = useMemo(() => getUpcomingEvents(today), [today]);

  // Month description
  const monthDesc = HIJRI_MONTH_DESCRIPTIONS[viewMonth - 1];

  const navigate = useCallback((dir: 1 | -1) => {
    setDirection(dir);
    const [ny, nm] = stepMonth(viewYear, viewMonth, dir);
    setViewYear(ny);
    setViewMonth(nm);
  }, [viewYear, viewMonth]);

  const startDow = calendarCells[0]?.dayOfWeek ?? 0;
  const totalDays = daysInHijriMonth(viewMonth, viewYear);

  // ── Gregorian month/year label (span across the Hijri month) ──────────────
  const firstGreg  = calendarCells[0]?.gregDate;
  const lastGreg   = calendarCells[calendarCells.length - 1]?.gregDate;
  const gregLabel  = useMemo(() => {
    if (!firstGreg || !lastGreg) return "";
    const fm = firstGreg.toLocaleString("en-GB", { month: "short", year: "numeric" });
    const lm = lastGreg.toLocaleString("en-GB",  { month: "short", year: "numeric" });
    return fm === lm ? fm : `${firstGreg.toLocaleString("en-GB", { month: "short" })} – ${lm}`;
  }, [firstGreg, lastGreg]);

  return (
    <>
      <div className="flex flex-col min-h-full">

        {/* ── Sticky header ──────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/60 px-4 pt-5 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">Islamic Calendar</h1>
              <p className="text-xs text-muted-foreground">Hijri calendar &amp; Islamic events</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-4 space-y-5">

          {/* ── Current date card ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/40 to-emerald-950/60 p-5 shadow-lg shadow-emerald-500/5"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">
              Today
            </p>
            <p
              className="font-arabic text-right text-foreground leading-loose mb-0.5"
              dir="rtl"
              lang="ar"
              style={{ fontSize: "clamp(1.1rem, 4vw, 1.4rem)" }}
            >
              {todayHijri.day} {["مُحَرَّم","صَفَر","رَبِيعُ الأَوَّل","رَبِيعُ الثَّانِي","جُمَادَى الأُولَى","جُمَادَى الآخِرَة","رَجَب","شَعْبَان","رَمَضَان","شَوَّال","ذُو الْقَعْدَة","ذُو الْحِجَّة"][todayHijri.month - 1]} {todayHijri.year} هـ
            </p>
            <p className="text-2xl font-bold text-foreground mt-0.5">
              {formatHijri(todayHijri)}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              <p className="text-sm text-muted-foreground">
                {today.toLocaleDateString("en-GB", { weekday: "long" })}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatGregorian(today)}
              </p>
            </div>
          </motion.div>

          {/* ── Month description ─────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`desc-${viewMonth}-${viewYear}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-1.5">
                About {monthDesc?.name}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {monthDesc?.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* ── Monthly calendar ──────────────────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

            {/* Calendar header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${viewYear}-${viewMonth}`}
                    initial={{ opacity: 0, y: direction * 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: direction * -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-base font-bold text-foreground">
                      {HIJRI_MONTHS[viewMonth - 1]} {viewYear} AH
                    </p>
                    <p className="text-xs text-muted-foreground">{gregLabel}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                onClick={() => navigate(1)}
                className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-border/60">
              {WEEK_DAYS.map((d) => (
                <div
                  key={d}
                  className={cn(
                    "py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
                    d === "Fri" && "text-primary",
                  )}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`grid-${viewYear}-${viewMonth}`}
                initial={{ opacity: 0, x: direction * 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -20 }}
                transition={{ duration: 0.22 }}
                className="grid grid-cols-7 p-1 gap-0.5"
              >
                {/* Empty leading cells */}
                {Array.from({ length: startDow }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Day cells */}
                {calendarCells.map((cell) => {
                  const isToday = isSameDay(cell.gregDate, today);
                  const hasEvent = eventsThisMonth.some(
                    (e) => e.hijriDay === cell.hijriDay,
                  );
                  const isFriday = cell.dayOfWeek === 5;

                  return (
                    <div
                      key={cell.hijriDay}
                      className={cn(
                        "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-colors",
                        isToday
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                          : isFriday
                            ? "text-primary"
                            : "text-foreground hover:bg-muted",
                      )}
                    >
                      <span className={cn(
                        "font-bold leading-none",
                        "text-[clamp(0.75rem,2.5vw,1rem)]",
                      )}>
                        {cell.hijriDay}
                      </span>
                      <span className={cn(
                        "leading-none mt-0.5",
                        "text-[clamp(0.55rem,1.5vw,0.65rem)]",
                        isToday
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}>
                        {cell.gregDate.getDate()}
                      </span>
                      {hasEvent && (
                        <span
                          className={cn(
                            "absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                            isToday ? "bg-primary-foreground/80" : "bg-primary",
                          )}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Trailing empty cells to complete final row */}
                {(() => {
                  const filled = startDow + totalDays;
                  const trailing = filled % 7 === 0 ? 0 : 7 - (filled % 7);
                  return Array.from({ length: trailing }).map((_, i) => (
                    <div key={`trail-${i}`} className="aspect-square" />
                  ));
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Upcoming Islamic Events ───────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Upcoming Islamic Events</h2>
            </div>

            {upcomingEvents.map((event, i) => {
              const c = COLOR[event.color];
              return (
                <motion.button
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.4) }}
                  onClick={() => setSelectedEvent(event)}
                  className={cn(
                    "w-full text-left rounded-2xl border bg-card p-4 shadow-sm",
                    "hover:shadow-md transition-all active:scale-[0.99]",
                    c.border, c.glow,
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl leading-none mt-0.5 shrink-0">{event.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight truncate">
                        {event.name}
                      </p>
                      <p
                        className="font-arabic text-xs text-muted-foreground mt-0.5"
                        dir="rtl"
                        lang="ar"
                      >
                        {event.arabicName}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className={cn("text-[11px] px-2 py-0.5 rounded-full border font-medium", c.badge)}>
                          {event.hijriDay} {HIJRI_MONTHS[event.hijriMonth - 1]} {event.hijriYear} AH
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border font-medium">
                          {formatGregorianShort(event.gregDate)}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {event.daysRemaining === 0 ? (
                        <span className={cn("text-xs font-bold px-2 py-1 rounded-lg border", c.badge)}>
                          Today!
                        </span>
                      ) : (
                        <div>
                          <p className={cn("text-lg font-bold leading-none", c.text)}>
                            {event.daysRemaining}
                          </p>
                          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                            days
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Bottom spacer */}
          <div style={{ height: "max(1rem, env(safe-area-inset-bottom))" }} />
        </div>
      </div>

      {/* ── Event detail modal ────────────────────────────────────────────── */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}
