import { useCallback, useRef } from "react";

interface UseLongPressOptions {
  /** Time in ms before the long-press fires. Default: 500 */
  delay?: number;
  /** Called on touchstart / mousedown — lets you give instant visual feedback */
  onStart?: () => void;
  /** Called when the gesture is cancelled (finger lifted early, moved too far) */
  onCancel?: () => void;
}

interface LongPressHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

/**
 * Cross-platform long-press detection.
 *
 * On mobile  → uses touchstart + 500 ms timer.
 * On desktop → intercepts right-click (contextmenu) as the gesture.
 *
 * Spread `handlers` directly on the target element.
 * Call `cancel()` externally if the parent needs to dismiss the gesture.
 */
export function useLongPress(
  callback: () => void,
  options: UseLongPressOptions = {}
): LongPressHandlers {
  const { delay = 500, onStart, onCancel } = options;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTouchRef = useRef<{ x: number; y: number } | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startTouchRef.current = null;
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      startTouchRef.current = { x: touch.clientX, y: touch.clientY };
      onStart?.();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        callback();
      }, delay);
    },
    [callback, delay, onStart]
  );

  const handleTouchEnd = useCallback(
    (_e: React.TouchEvent) => {
      if (timerRef.current) {
        // Timer still running → was a short tap, not a long press
        onCancel?.();
      }
      clear();
    },
    [clear, onCancel]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!startTouchRef.current) return;
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - startTouchRef.current.x);
      const dy = Math.abs(touch.clientY - startTouchRef.current.y);
      // If finger moved > 10px, cancel the long-press
      if (dx > 10 || dy > 10) {
        onCancel?.();
        clear();
      }
    },
    [clear, onCancel]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      callback();
    },
    [callback]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
    onContextMenu: handleContextMenu,
  };
}
