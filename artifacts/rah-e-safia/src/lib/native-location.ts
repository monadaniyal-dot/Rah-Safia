/**
 * native-location.ts
 *
 * Thin wrapper that resolves the device location correctly on every platform:
 *
 *  • Android (Capacitor native) — uses @capacitor/geolocation so that the
 *    Android runtime permission dialog is shown properly on Android 6–15.
 *    Without this, navigator.geolocation inside a WebView never triggers the
 *    native permission prompt and the browser silently returns PERMISSION_DENIED.
 *
 *  • Web / PWA — falls back to the standard navigator.geolocation API so the
 *    web deployment is completely unaffected.
 */

import { Capacitor } from "@capacitor/core";

export type LocationResult =
  | { ok: true; lat: number; lon: number }
  | { ok: false; denied: boolean; message: string };

export async function getNativeLocation(): Promise<LocationResult> {
  // ── Android native path ──────────────────────────────────────────────────
  if (Capacitor.isNativePlatform()) {
    // Dynamic import keeps the plugin out of the web bundle entirely
    const { Geolocation } = await import("@capacitor/geolocation");

    // 1. Check current permission state (no dialog yet)
    let perm = await Geolocation.checkPermissions();

    // 2. If not yet decided, ask — this shows the native Android dialog
    if (perm.location === "prompt" || perm.location === "prompt-with-rationale") {
      const req = await Geolocation.requestPermissions({ permissions: ["location"] });
      perm = req as typeof perm;
    }

    // 3. Permanently denied — user must visit Settings
    if (perm.location === "denied") {
      return {
        ok: false,
        denied: true,
        message:
          "Location permission is permanently denied. " +
          "Please open Settings → Apps → Quran Al-Falah → Permissions " +
          "and enable Location, then return to the app.",
      };
    }

    // 4. Permission granted — get the position
    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 12000,
      });
      return { ok: true, lat: pos.coords.latitude, lon: pos.coords.longitude };
    } catch {
      return {
        ok: false,
        denied: false,
        message: "Your location could not be determined. Please try again.",
      };
    }
  }

  // ── Web / PWA path ───────────────────────────────────────────────────────
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        ok: false,
        denied: false,
        message: "Geolocation is not supported by your browser.",
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ ok: true, lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => {
        const messages: Record<number, string> = {
          1: "Location permission was denied. Please allow location access and try again.",
          2: "Your location could not be determined. Please try again.",
          3: "Location request timed out. Please try again.",
        };
        resolve({
          ok: false,
          denied: err.code === 1,
          message: messages[err.code] ?? "An unknown error occurred.",
        });
      },
      { timeout: 12000, enableHighAccuracy: true, maximumAge: 0 }
    );
  });
}
