/**
 * use-compass-heading.ts
 *
 * Provides a live, smoothed compass heading from the device magnetometer.
 *
 * Platform notes
 * ──────────────
 * • Android (Capacitor WebView / Chrome): fires `deviceorientationabsolute`
 *   with `alpha` = degrees from geographic North. Heading = (360 − alpha) % 360.
 *   This is supported on Android 4.4+ with Chromium and requires the device to
 *   have a magnetometer (all Samsung Galaxy S/A series do).
 *
 * • iOS (Safari): fires `deviceorientation` with `webkitCompassHeading`
 *   already expressed as clockwise degrees from North.
 *
 * • Web (desktop / no sensor): no events fire → `supported = false` after 3 s.
 *
 * Smoothing
 * ─────────
 * Sensor events arrive at up to 60 Hz with significant noise. We apply an
 * exponential low-pass filter (α = 0.18 per event) that handles the 0/360
 * wrap correctly. UI updates are batched through requestAnimationFrame.
 *
 * Calibration
 * ───────────
 * When the magnetometer hasn't been calibrated the `alpha` value is stuck near
 * a constant regardless of phone rotation. We detect this by collecting the
 * first 12 readings and checking whether they're all within 1° of each other.
 */

import { useState, useEffect, useRef } from "react";

export interface CompassState {
  /** Smoothed clockwise bearing from North, 0–360°. null before first reading. */
  heading: number | null;
  /** True once the first sensor event arrives (or after 3 s if none arrive). */
  supported: boolean;
  /**
   * True when the magnetometer readings appear stuck / uncalibrated.
   * UI should prompt the user to wave the phone in a figure-8.
   */
  needsCalibration: boolean;
}

// ─── Math helpers ─────────────────────────────────────────────────────────────

function normalise(a: number): number {
  return ((a % 360) + 360) % 360;
}

/**
 * Exponential moving average for angles.
 * Handles the 0/360 discontinuity so smoothing never takes the long way round.
 */
function lerpAngle(current: number, target: number, alpha: number): number {
  let diff = target - current;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return normalise(current + diff * alpha);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const SMOOTH_ALPHA   = 0.18; // weight of new reading (higher = more responsive, more jitter)
const CALIB_SAMPLES  = 12;   // readings to collect before checking calibration
const CALIB_RANGE    = 1;    // degrees — if all samples within this range, sensor is stuck
const NO_SENSOR_MS   = 3000; // ms before marking as unsupported

export function useCompassHeading(): CompassState {
  const [state, setState] = useState<CompassState>({
    heading:          null,
    supported:        true,
    needsCalibration: false,
  });

  const smoothedRef     = useRef<number | null>(null);
  const firstSamplesRef = useRef<number[]>([]);
  const hasAbsoluteRef  = useRef(false);   // true once deviceorientationabsolute fires
  const rafRef          = useRef<number | null>(null);
  const activeRef       = useRef(true);

  useEffect(() => {
    activeRef.current = true;

    // ── Heading extraction ──────────────────────────────────────────────────
    function extractHeading(evt: DeviceOrientationEvent): number | null {
      // iOS / some Android browsers expose webkitCompassHeading directly
      const e = evt as DeviceOrientationEvent & { webkitCompassHeading?: number };
      if (typeof e.webkitCompassHeading === "number" && e.webkitCompassHeading >= 0) {
        return e.webkitCompassHeading;
      }
      // Android Chrome / Capacitor WebView: alpha = CCW rotation from North
      if (evt.alpha !== null && evt.alpha !== undefined) {
        return normalise(360 - evt.alpha);
      }
      return null;
    }

    // ── Core processing ─────────────────────────────────────────────────────
    function process(evt: DeviceOrientationEvent) {
      if (!activeRef.current) return;

      const raw = extractHeading(evt);
      if (raw === null) return;

      // Smooth
      if (smoothedRef.current === null) {
        smoothedRef.current = raw;
      } else {
        smoothedRef.current = lerpAngle(smoothedRef.current, raw, SMOOTH_ALPHA);
      }

      // Collect calibration samples
      if (firstSamplesRef.current.length < CALIB_SAMPLES) {
        firstSamplesRef.current.push(raw);
      }

      const needsCalibration =
        firstSamplesRef.current.length >= CALIB_SAMPLES &&
        firstSamplesRef.current.every(
          (r) => Math.abs(r - firstSamplesRef.current[0]) < CALIB_RANGE
        );

      // Batch UI update via RAF
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      const snap = { heading: smoothedRef.current, needsCalibration };
      rafRef.current = requestAnimationFrame(() => {
        if (!activeRef.current) return;
        setState({ heading: snap.heading, supported: true, needsCalibration: snap.needsCalibration });
      });
    }

    // ── Event listeners ─────────────────────────────────────────────────────

    // `deviceorientationabsolute` gives alpha relative to geographic North — preferred.
    function onAbsolute(evt: DeviceOrientationEvent) {
      hasAbsoluteRef.current = true;
      process(evt);
    }

    // `deviceorientation` fallback — only used if absolute never fires.
    function onRelative(evt: DeviceOrientationEvent) {
      if (hasAbsoluteRef.current) return;
      process(evt);
    }

    window.addEventListener("deviceorientationabsolute", onAbsolute as EventListener);
    window.addEventListener("deviceorientation",         onRelative as EventListener);

    // Unsupported timeout
    const timeout = window.setTimeout(() => {
      if (activeRef.current && smoothedRef.current === null) {
        setState((s) => ({ ...s, supported: false }));
      }
    }, NO_SENSOR_MS);

    return () => {
      activeRef.current = false;
      window.removeEventListener("deviceorientationabsolute", onAbsolute as EventListener);
      window.removeEventListener("deviceorientation",         onRelative as EventListener);
      clearTimeout(timeout);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return state;
}
