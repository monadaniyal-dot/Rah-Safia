/**
 * fetch() wrapper that aborts the request after a configurable timeout.
 *
 * Uses AbortController so the underlying TCP connection is also released.
 * On timeout, throws an Error with a user-friendly message so callers can
 * surface it through their existing error-handling paths.
 *
 * Usage:
 *   const res = await fetchWithTimeout(url, { headers: { … } });
 *   const res = await fetchWithTimeout(url, { timeoutMs: 5000 });
 */

export const DEFAULT_TIMEOUT_MS = 12_000; // 12 seconds

export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...fetchOptions, signal: controller.signal });
  } catch (err) {
    // AbortError is thrown by fetch() when the signal fires.
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Request timed out. Check your connection and try again.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
