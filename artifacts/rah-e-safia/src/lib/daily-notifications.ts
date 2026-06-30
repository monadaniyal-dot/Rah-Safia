/**
 * Daily reminder notifications — one-per-day at a user-chosen time.
 * Uses setTimeout (browser Notification API, no service worker required).
 * All timers are module-level so they persist across component remounts.
 */

const _timers: ReturnType<typeof setTimeout>[] = [];

export interface DailyNotifSettings {
  dailyReflectionNotification: boolean;
  dailyDuaNotification: boolean;
  dailyInspirationReminder: boolean;
  reminderTime: string; // "HH:MM" 24-hour
}

export function clearDailyNotifications(): void {
  _timers.forEach(clearTimeout);
  _timers.length = 0;
}

/** Returns ms until HH:MM today; negative if time has already passed. */
function msUntilTimeToday(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
  return target.getTime() - now.getTime();
}

function fireNotification(title: string, body: string, tag: string): void {
  try {
    const n = new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag,
      renotify: false,
      silent: false,
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    // Notification API may be unavailable in some contexts
  }
}

function schedule(delay: number, title: string, body: string, tag: string): void {
  const t = setTimeout(() => fireNotification(title, body, tag), delay);
  _timers.push(t);
}

export function scheduleDailyNotifications(settings: DailyNotifSettings): void {
  clearDailyNotifications();

  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const anyEnabled =
    settings.dailyReflectionNotification ||
    settings.dailyDuaNotification ||
    settings.dailyInspirationReminder;

  if (!anyEnabled) return;

  const delay = msUntilTimeToday(settings.reminderTime);
  if (delay < 0) return; // Time has already passed today — skip until tomorrow

  if (settings.dailyReflectionNotification) {
    schedule(
      delay,
      "📖 Daily Ayah — Rah-e-Safia",
      "Your daily Quranic verse is ready. Open Rah-e-Safia for today's reflection.",
      "rah-e-safia:daily-ayah"
    );
  }

  if (settings.dailyDuaNotification) {
    schedule(
      delay,
      "🤲 Daily Dua — Rah-e-Safia",
      "A new supplication is ready for you. Open Rah-e-Safia to read today's Dua.",
      "rah-e-safia:daily-dua"
    );
  }

  if (settings.dailyInspirationReminder) {
    // Reuses the Daily Reflection section — same deeplink target as Daily Ayah
    schedule(
      delay,
      "✨ Daily Inspiration — Rah-e-Safia",
      "Your daily Islamic reminder is waiting for you in Rah-e-Safia.",
      "rah-e-safia:daily-inspiration"
    );
  }
}

/** Format "HH:MM" → "7:00 AM" */
export function formatReminderTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const min = m.toString().padStart(2, "0");
  return `${hour12}:${min} ${period}`;
}
