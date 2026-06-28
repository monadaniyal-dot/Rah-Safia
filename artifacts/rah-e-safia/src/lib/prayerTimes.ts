/**
 * Prayer times calculator — pure TypeScript, no external dependencies.
 * Uses the standard solar position algorithm (Jean Meeus, "Astronomical Algorithms").
 * Method: Muslim World League — Fajr 18°, Isha 17°, Asr shadow factor 1 (Standard).
 */

export interface PrayerTimes {
  Fajr: Date | null;
  Sunrise: Date | null;
  Dhuhr: Date;
  Asr: Date | null;
  Maghrib: Date | null;
  Isha: Date | null;
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

/** Julian Day Number for the given local calendar date at UTC noon. */
function julianDay(year: number, month: number, day: number): number {
  const Y = month <= 2 ? year - 1 : year;
  const M = month <= 2 ? month + 12 : month;
  const D = day + 0.5; // noon
  const A = Math.trunc(Y / 100);
  const B = 2 - A + Math.trunc(A / 4);
  return Math.trunc(365.25 * (Y + 4716)) + Math.trunc(30.6001 * (M + 1)) + D + B - 1524.5;
}

/** Returns sun declination (°) and equation of time (minutes) for a Julian Day. */
function sunPosition(jd: number): { decl: number; eqTime: number } {
  const T = (jd - 2451545.0) / 36525.0;

  let L0 = 280.46646 + 36000.76983 * T;
  L0 = ((L0 % 360) + 360) % 360;

  let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  M = ((M % 360) + 360) % 360;
  const Mrad = toRad(M);

  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);

  const sunLon = L0 + C;
  const omega = 125.04452 - 1934.136261 * T;
  const lambda = sunLon - 0.00569 - 0.00478 * Math.sin(toRad(omega));

  const epsilon =
    23.43929111 -
    0.013004167 * T -
    0.000000164 * T * T +
    0.000000504 * T * T * T +
    0.00256 * Math.cos(toRad(omega));

  const decl = toDeg(Math.asin(Math.sin(toRad(epsilon)) * Math.sin(toRad(lambda))));

  // Right ascension (hours)
  const RA =
    toDeg(
      Math.atan2(
        Math.cos(toRad(epsilon)) * Math.sin(toRad(lambda)),
        Math.cos(toRad(lambda)),
      ),
    ) / 15;

  // Equation of time in minutes
  const eqTime = (L0 / 15 - RA) * 60;

  return { decl, eqTime };
}

/**
 * Hour angle (°) when sun is at `angle` degrees from horizon.
 * Positive angle = above, negative = below.
 * Returns null when sun never reaches that altitude (polar extremes).
 */
function hourAngle(lat: number, decl: number, angle: number): number | null {
  const cosHA =
    (Math.sin(toRad(angle)) - Math.sin(toRad(lat)) * Math.sin(toRad(decl))) /
    (Math.cos(toRad(lat)) * Math.cos(toRad(decl)));
  if (cosHA < -1 || cosHA > 1) return null;
  return toDeg(Math.acos(cosHA));
}

/**
 * Hour angle for Asr when shadow = shadowFactor × object height + midday shadow.
 * Standard method: shadowFactor = 1. Hanafi: shadowFactor = 2.
 */
function asrHourAngle(lat: number, decl: number, shadowFactor: number): number | null {
  const altitude = toDeg(
    Math.atan(1 / (shadowFactor + Math.tan(toRad(Math.abs(lat - decl))))),
  );
  return hourAngle(lat, decl, altitude);
}

/**
 * Calculate the five daily prayer times plus sunrise for a given date and location.
 * All times are returned as local `Date` objects.
 *
 * @param date   - Local calendar date (year/month/day taken from local parts)
 * @param lat    - Latitude in decimal degrees (negative = south)
 * @param lon    - Longitude in decimal degrees (negative = west)
 */
export function calculatePrayerTimes(date: Date, lat: number, lon: number): PrayerTimes {
  const jd = julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const { decl, eqTime } = sunPosition(jd);

  // Solar noon in UTC hours
  const solarNoonUTC = 12 - lon / 15 - eqTime / 60;

  // Midnight UTC for the local calendar date → add UTC hours to get prayer Date objects
  const midnightUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const utcHoursToDate = (h: number) => new Date(midnightUTC + h * 3_600_000);

  const haFajr    = hourAngle(lat, decl, -18);
  const haSunrise = hourAngle(lat, decl, -0.8333);
  const haAsr     = asrHourAngle(lat, decl, 1);
  const haMaghrib = hourAngle(lat, decl, -0.8333);
  const haIsha    = hourAngle(lat, decl, -17);

  return {
    Fajr:    haFajr    != null ? utcHoursToDate(solarNoonUTC - haFajr    / 15) : null,
    Sunrise: haSunrise != null ? utcHoursToDate(solarNoonUTC - haSunrise / 15) : null,
    Dhuhr:                       utcHoursToDate(solarNoonUTC + 1 / 60),         // +1 min safety
    Asr:     haAsr     != null ? utcHoursToDate(solarNoonUTC + haAsr     / 15) : null,
    Maghrib: haMaghrib != null ? utcHoursToDate(solarNoonUTC + haMaghrib / 15) : null,
    Isha:    haIsha    != null ? utcHoursToDate(solarNoonUTC + haIsha    / 15) : null,
  };
}
