const _timers: ReturnType<typeof setTimeout>[] = [];

export function supportsNotifications(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!supportsNotifications()) return "denied";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!supportsNotifications()) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  return await Notification.requestPermission();
}

export interface PrayerNotifSettings {
  prayerNotifications: boolean;
  prayerReminderMinutes: 0 | 5 | 10 | 15;
  fajrNotification: boolean;
  dhuhrNotification: boolean;
  asrNotification: boolean;
  maghribNotification: boolean;
  ishaNotification: boolean;
}

const PRAYER_TOGGLE_KEY: Record<string, keyof PrayerNotifSettings> = {
  Fajr: "fajrNotification",
  Dhuhr: "dhuhrNotification",
  Asr: "asrNotification",
  Maghrib: "maghribNotification",
  Isha: "ishaNotification",
};

export function clearScheduledNotifications(): void {
  _timers.forEach(clearTimeout);
  _timers.length = 0;
}

export function schedulePrayerNotifications(
  prayers: Array<{ id: string; name: string; time24: string }>,
  settings: PrayerNotifSettings
): void {
  clearScheduledNotifications();
  if (!settings.prayerNotifications) return;
  if (!supportsNotifications()) return;
  if (Notification.permission !== "granted") return;

  const now = new Date();
  const nowMs = now.getTime();
  const midnightMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const offsetMs = settings.prayerReminderMinutes * 60_000;

  for (const prayer of prayers) {
    const toggleKey = PRAYER_TOGGLE_KEY[prayer.id];
    if (toggleKey && !settings[toggleKey]) continue;

    const [h, m] = prayer.time24.split(":").map(Number);
    const prayerMs = midnightMs + h * 3_600_000 + m * 60_000;
    const notifyAt = prayerMs - offsetMs;
    const delay = notifyAt - nowMs;

    if (delay < 0) continue;

    const reminder = settings.prayerReminderMinutes;
    const body =
      reminder === 0
        ? `It is time for ${prayer.name} prayer. Allahu Akbar.`
        : `${prayer.name} prayer begins in ${reminder} minutes.`;

    const t = setTimeout(() => {
      try {
        new Notification(`🕌 ${prayer.name} — Quran Al-Falah`, {
          body,
          icon: "/favicon.ico",
          tag: `prayer-${prayer.id}`,
          silent: false,
        });
      } catch {}
    }, delay);

    _timers.push(t);
  }
}
