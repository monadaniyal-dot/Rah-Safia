import { useState, useEffect } from "react";
import { calculatePrayerTimes } from "@/lib/prayerTimes";

export interface PrayerCountdown {
  name: string;
  arabicName: string;
  minutesLeft: number;
  isUrgent: boolean; // < 30 minutes
}

const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

const ARABIC: Record<string, string> = {
  Fajr:    "الفجر",
  Dhuhr:   "الظهر",
  Asr:     "العصر",
  Maghrib: "المغرب",
  Isha:    "العشاء",
};

// Fallback: Makkah al-Mukarramah
const DEFAULT_LAT = 21.3891;
const DEFAULT_LON = 39.8579;

function nextPrayer(lat: number, lon: number, now: Date): PrayerCountdown | null {
  // Check today's prayers, then tomorrow's (in case all today's have passed)
  const tomorrow = new Date(now.getTime() + 86_400_000);

  for (const date of [now, tomorrow]) {
    const times = calculatePrayerTimes(date, lat, lon);
    for (const name of PRAYER_ORDER) {
      const t = times[name as keyof typeof times] as Date | null;
      if (t && t > now) {
        const minutesLeft = Math.round((t.getTime() - now.getTime()) / 60_000);
        return {
          name,
          arabicName: ARABIC[name],
          minutesLeft,
          isUrgent: minutesLeft < 30,
        };
      }
    }
  }
  return null;
}

export function usePrayerCountdown(): PrayerCountdown | null {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [countdown, setCountdown] = useState<PrayerCountdown | null>(null);

  // Request geolocation once; fall back to Makkah if denied/unavailable
  useEffect(() => {
    if (!navigator.geolocation) {
      setCoords({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      ()    => setCoords({ lat: DEFAULT_LAT, lon: DEFAULT_LON }),
      { timeout: 8_000 },
    );
  }, []);

  // Compute countdown immediately and refresh every 60 s.
  // Uses functional setState to preserve the previous object reference when
  // the computed values are identical — this prevents a re-render of HomePage
  // on every interval tick even when nothing has visually changed.
  useEffect(() => {
    const lat = coords?.lat ?? DEFAULT_LAT;
    const lon = coords?.lon ?? DEFAULT_LON;

    const compute = () => {
      const next = nextPrayer(lat, lon, new Date());
      setCountdown((prev) => {
        // Preserve reference when all values are the same
        if (prev === null && next === null) return prev;
        if (prev === null || next === null) return next;
        if (
          prev.name === next.name &&
          prev.minutesLeft === next.minutesLeft &&
          prev.isUrgent === next.isUrgent
        ) return prev;
        return next;
      });
    };

    compute();
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, [coords]);

  return countdown;
}
