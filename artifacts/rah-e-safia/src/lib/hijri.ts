// ─── Hijri (Islamic) Calendar ─────────────────────────────────────────────────
// Pure-TS implementation of the Tabular Islamic Calendar algorithm.
// Verified: 26 June 2026 → 10 Muharram 1448 AH ✓
//
// Reference: Dershowitz & Reingold "Calendrical Calculations" (Cambridge Press)
// plus the widely-used JDN ↔ Hijri conversion attributed to Faten Mostefaoui.

export interface HijriDate {
  day: number;
  month: number;   // 1-indexed
  year: number;
}

export const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qa'dah",
  "Dhu al-Hijjah",
] as const;

export const HIJRI_MONTHS_AR = [
  "مُحَرَّم",
  "صَفَر",
  "رَبِيعُ الأَوَّل",
  "رَبِيعُ الثَّانِي",
  "جُمَادَى الأُولَى",
  "جُمَادَى الآخِرَة",
  "رَجَب",
  "شَعْبَان",
  "رَمَضَان",
  "شَوَّال",
  "ذُو الْقَعْدَة",
  "ذُو الْحِجَّة",
] as const;

/** Gregorian date → Julian Day Number */
function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/** Julian Day Number → Hijri date */
function jdnToHijri(jdn: number): HijriDate {
  const l = jdn - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 =
    l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { day, month, year };
}

/** Convert a JS Date to a Hijri date object */
export function toHijri(date: Date): HijriDate {
  const jdn = gregorianToJDN(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  return jdnToHijri(jdn);
}

/** Format a HijriDate as "10 Muharram 1448 AH" */
export function formatHijri(h: HijriDate): string {
  const monthName = HIJRI_MONTHS[h.month - 1] ?? "Unknown";
  return `${h.day} ${monthName} ${h.year} AH`;
}

/** Format a HijriDate in Arabic script */
export function formatHijriArabic(h: HijriDate): string {
  const monthName = HIJRI_MONTHS_AR[h.month - 1] ?? "";
  return `${h.day} ${monthName} ${h.year} هـ`;
}
