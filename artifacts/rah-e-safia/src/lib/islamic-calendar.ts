/**
 * Islamic Calendar Utilities
 *
 * Extends hijri.ts with:
 *  - findGregorianForHijri  — reliable Hijri → Gregorian lookup
 *  - daysInHijriMonth       — tabular calendar rule (29 or 30)
 *  - isHijriLeapYear        — tabular leap-year rule
 *  - buildCalendarMonth     — all cells for a monthly grid
 */

import { toHijri } from "./hijri";

// ── Leap-year and month-length helpers ────────────────────────────────────────

/** Tabular Islamic Calendar leap-year test (Kūfān / West-Islamic convention). */
export function isHijriLeapYear(year: number): boolean {
  return ((11 * year + 14) % 30) < 11;
}

/**
 * Number of days in a Hijri month.
 * Odd months → 30 days, even months → 29 days,
 * except Dhu al-Hijjah (12) which gets 30 days in leap years.
 */
export function daysInHijriMonth(month: number, year: number): number {
  if (month === 12) return isHijriLeapYear(year) ? 30 : 29;
  return month % 2 === 1 ? 30 : 29;
}

// ── Hijri → Gregorian conversion ─────────────────────────────────────────────
// Uses an anchored search against the verified toHijri function
// rather than reimplementing the calendar algebra a second time.
//
// Anchor verified in hijri.ts: "26 June 2026 → 10 Muharram 1448 AH ✓"

const ANCHOR_MS   = Date.UTC(2026, 5, 26); // June 26, 2026 UTC
const ANCHOR_HIJRI = { year: 1448, month: 1, day: 10 };

/**
 * Convert a Hijri date to the corresponding Gregorian JS Date (UTC midnight).
 * Works by anchoring on a known-correct date and scanning ±30 days of the
 * linear approximation.  Throws if the date cannot be resolved (won't happen
 * for sane inputs in the range 1300–1600 AH).
 */
export function findGregorianForHijri(
  hYear: number,
  hMonth: number,
  hDay: number
): Date {
  const anchorDays =
    (ANCHOR_HIJRI.year - 1) * 354.367 +
    (ANCHOR_HIJRI.month - 1) * 29.5306 +
    ANCHOR_HIJRI.day;
  const targetDays =
    (hYear - 1) * 354.367 +
    (hMonth - 1) * 29.5306 +
    hDay;
  const approxOffset = Math.round(targetDays - anchorDays);
  const approxMs    = ANCHOR_MS + approxOffset * 86_400_000;

  const DAY_MS = 86_400_000;

  for (let delta = -5; delta <= 5; delta++) {
    const d = new Date(approxMs + delta * DAY_MS);
    const h = toHijri(d);
    if (h.year === hYear && h.month === hMonth && h.day === hDay) return d;
  }
  for (let delta = -30; delta <= 30; delta++) {
    const d = new Date(approxMs + delta * DAY_MS);
    const h = toHijri(d);
    if (h.year === hYear && h.month === hMonth && h.day === hDay) return d;
  }
  throw new Error(`findGregorianForHijri: cannot resolve ${hDay}/${hMonth}/${hYear}`);
}

// ── Calendar cell type ────────────────────────────────────────────────────────

export interface CalendarCell {
  hijriDay: number;
  gregDate: Date; // local midnight
  /** 0 = Sunday … 6 = Saturday */
  dayOfWeek: number;
}

/**
 * Build an ordered array of calendar cells for a Hijri month.
 * Only one findGregorianForHijri call is made (for day 1); the rest are
 * derived by adding 24 h increments.
 */
export function buildCalendarMonth(
  hijriYear: number,
  hijriMonth: number
): CalendarCell[] {
  const firstGreg = findGregorianForHijri(hijriYear, hijriMonth, 1);
  const days      = daysInHijriMonth(hijriMonth, hijriYear);
  const DAY_MS    = 86_400_000;

  return Array.from({ length: days }, (_, i) => {
    const gregDate = new Date(firstGreg.getTime() + i * DAY_MS);
    return {
      hijriDay: i + 1,
      gregDate,
      dayOfWeek: gregDate.getDay(),
    };
  });
}

/** Return the number of whole days between two dates (negative if target < today). */
export function daysUntil(target: Date, today: Date = new Date()): number {
  const t = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const n = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((t - n) / 86_400_000);
}
