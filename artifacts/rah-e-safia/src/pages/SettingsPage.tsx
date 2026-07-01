import { useState, useEffect, useCallback, useMemo, memo, type ReactNode } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme as useNextTheme } from "next-themes";
import {
  Settings,
  Palette,
  Sun,
  Moon,
  Monitor,
  BookOpen,
  Type,
  Clock,
  Globe2,
  Bell,
  BellOff,
  BookMarked,
  HardDrive,
  Info,
  ChevronRight,
  RotateCcw,
  Trash2,
  Star,
  Shield,
  Mail,
  Share2,
  Tag,
  AlertCircle,
  CheckCircle2,
  Compass,
  Languages,
  AlignJustify,
  RefreshCw,
  MapPin,
  Search,
  Loader2,
  BellRing,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings, type AppSettings } from "@/lib/use-settings";
import {
  requestNotificationPermission,
  getNotificationPermission,
  supportsNotifications,
} from "@/lib/prayer-notifications";
import {
  scheduleDailyNotifications,
  formatReminderTime,
} from "@/lib/daily-notifications";
import {
  getSavedLocation,
  saveLocation,
  clearSavedLocation,
  forwardGeocodeCity,
  type SavedLocation,
} from "@/lib/location-store";

const APP_VERSION = "1.0.0";

// ─── Reusable primitives (all memoized) ──────────────────────────────────────
// Memoized so they only re-render when their own props change.
// Combined with stable onChange callbacks in SettingsPage, changing one setting
// causes only that control (and its direct parent row) to re-render.

const Toggle = memo(function Toggle({
  value,
  onChange,
  disabled = false,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        value && !disabled ? "bg-primary" : "bg-border",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className={cn(
          "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm",
          value ? "left-[calc(100%-1.375rem)]" : "left-0.5"
        )}
      />
    </button>
  );
});

const RangeSlider = memo(function RangeSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  disabled = false,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
  disabled?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-3 w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) ${pct}%, hsl(var(--border)) ${pct}%)`,
        }}
      />
      <span className="text-xs font-mono font-medium text-foreground/70 w-10 text-right shrink-0">
        {formatValue ? formatValue(value) : value}
      </span>
    </div>
  );
});

const SelectField = memo(function SelectField({
  value,
  onChange,
  options,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "text-xs rounded-lg px-3 py-1.5 bg-secondary border border-border text-foreground",
        "outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40",
        "transition-all duration-200 cursor-pointer",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
});

// ─── Section card ─────────────────────────────────────────────────────────────
// Not memoized — receives `children` which is a new ReactNode every render.
// The cost is lightweight (just JSX construction, no DOM work).

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden"
    >
      <div className={cn("h-1 w-full", accent ?? "gradient-primary")} />
      <div className="px-5 pt-4 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-white" strokeWidth={1.8} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-[11px] text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="divide-y divide-border/50">{children}</div>
    </motion.div>
  );
}

// ─── Setting row ──────────────────────────────────────────────────────────────

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
  vertical = false,
  dim = false,
}: {
  icon?: React.ElementType;
  label: string;
  description?: string;
  children?: ReactNode;
  vertical?: boolean;
  dim?: boolean;
}) {
  return (
    <div
      className={cn(
        "px-5 py-3.5",
        dim && "opacity-50",
        vertical ? "flex flex-col gap-2.5" : "flex items-center justify-between gap-4"
      )}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        {Icon && (
          <Icon
            className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5"
            strokeWidth={1.8}
          />
        )}
        <div className="min-w-0">
          <span className="text-sm font-medium text-foreground leading-tight">
            {label}
          </span>
          {description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              {description}
            </p>
          )}
        </div>
      </div>
      {children && (
        <div className={cn("shrink-0", vertical && "w-full")}>{children}</div>
      )}
    </div>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────

const ActionButton = memo(function ActionButton({
  label,
  description,
  icon: Icon,
  variant = "default",
  onClick,
  loading = false,
  done = false,
}: {
  label: string;
  description?: string;
  icon: React.ElementType;
  variant?: "default" | "danger";
  onClick: () => void;
  loading?: boolean;
  done?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors duration-150",
        variant === "danger"
          ? "hover:bg-destructive/5 active:bg-destructive/10"
          : "hover:bg-secondary/60 active:bg-secondary"
      )}
    >
      <span
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          variant === "danger" ? "bg-destructive/10" : "bg-secondary"
        )}
      >
        {done ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={2} />
        ) : (
          <Icon
            className={cn(
              "w-4 h-4",
              loading && "animate-spin",
              variant === "danger" ? "text-destructive" : "text-muted-foreground"
            )}
            strokeWidth={1.8}
          />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium leading-tight",
            variant === "danger" ? "text-destructive" : "text-foreground"
          )}
        >
          {label}
        </p>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
    </button>
  );
});

// ─── About row ────────────────────────────────────────────────────────────────

const AboutRow = memo(function AboutRow({
  icon: Icon,
  label,
  value,
  href,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/60 transition-colors duration-150 cursor-pointer">
      <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
      </span>
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      {value ? (
        <span className="text-xs text-muted-foreground font-mono">{value}</span>
      ) : (
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
      )}
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="block w-full text-left">
        {inner}
      </button>
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }
  return <div>{inner}</div>;
});

// ─── Theme selector ───────────────────────────────────────────────────────────

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

// Memoized: manages its own theme state via next-themes, no external props that change.
const ThemeSelector = memo(function ThemeSelector() {
  const { theme, setTheme } = useNextTheme();

  return (
    <div className="grid grid-cols-3 gap-2 px-5 py-3.5">
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all duration-200",
              isActive
                ? "gradient-primary text-white border-transparent shadow-sm"
                : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/30 hover:bg-secondary"
            )}
          >
            <Icon
              className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground")}
              strokeWidth={isActive ? 2 : 1.6}
            />
            <span
              className={cn(
                "text-xs font-medium",
                isActive ? "text-white" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
});

// ─── Data options ─────────────────────────────────────────────────────────────

const TRANSLATION_OPTIONS = [
  { value: "en.sahih", label: "Saheeh International" },
  { value: "en.pickthall", label: "Pickthall" },
  { value: "en.yusufali", label: "Yusuf Ali" },
  { value: "en.asad", label: "Muhammad Asad" },
  { value: "en.ahmedraza", label: "Ahmed Raza Khan" },
];

const TAFSEER_OPTIONS = [
  { value: "maarif", label: "Maarif-ul-Quran" },
  { value: "ibnkathir", label: "Ibn Kathir" },
  { value: "tazkirul", label: "Tazkirul Quran" },
];

const CALCULATION_METHODS = [
  { value: "MWL", label: "Muslim World League" },
  { value: "ISNA", label: "ISNA (North America)" },
  { value: "Egypt", label: "Egyptian General Authority" },
  { value: "Makkah", label: "Umm al-Qura (Makkah)" },
  { value: "Karachi", label: "University of Karachi" },
];

const MADHAB_OPTIONS = [
  { value: "shafi", label: "Shafi'i / Maliki / Hanbali" },
  { value: "hanafi", label: "Hanafi" },
];

const APP_LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية (Arabic)" },
];

const TRANSLATION_LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ur", label: "Urdu" },
];

const PRAYER_NOTIF_TOGGLES = [
  { key: "fajrNotification" as const,    label: "Fajr",    arabic: "الفجر"  },
  { key: "dhuhrNotification" as const,   label: "Dhuhr",   arabic: "الظهر"  },
  { key: "asrNotification" as const,     label: "Asr",     arabic: "العصر"  },
  { key: "maghribNotification" as const, label: "Maghrib", arabic: "المغرب" },
  { key: "ishaNotification" as const,    label: "Isha",    arabic: "العشاء" },
];

const REMINDER_TIME_PRESETS = [
  { value: "06:00", label: "6:00 AM" },
  { value: "07:00", label: "7:00 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
];

// ─── Per-prayer notification row ─────────────────────────────────────────────
// Extracted to avoid creating new onChange closures inside a .map() call.
// With this component memoized and receiving a stable onUpdate callback,
// each row only re-renders when its own value changes.

const PrayerNotifToggleRow = memo(function PrayerNotifToggleRow({
  label,
  arabic,
  settingKey,
  value,
  onUpdate,
}: {
  label: string;
  arabic: string;
  settingKey: keyof AppSettings;
  value: boolean;
  onUpdate: (key: keyof AppSettings, v: boolean) => void;
}) {
  const onChange = useCallback(
    (v: boolean) => onUpdate(settingKey, v),
    [onUpdate, settingKey],
  );
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <span className="font-arabic text-sm text-muted-foreground" dir="rtl">{arabic}</span>
        <span className="text-sm text-foreground font-medium">{label}</span>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
});

// ─── Prayer reminder chips ────────────────────────────────────────────────────
// Memoized so the chip row only re-renders when prayerReminderMinutes changes.

const PRAYER_REMINDER_MINUTES = [0, 5, 10, 15] as const;

const PrayerReminderChips = memo(function PrayerReminderChips({
  value,
  onChange,
}: {
  value: 0 | 5 | 10 | 15;
  onChange: (v: 0 | 5 | 10 | 15) => void;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap justify-end">
      {PRAYER_REMINDER_MINUTES.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={cn(
            "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
            value === m
              ? "gradient-primary text-white border-transparent shadow-sm"
              : "bg-secondary text-muted-foreground border-border hover:border-primary/30"
          )}
        >
          {m === 0 ? "At time" : `${m}m`}
        </button>
      ))}
    </div>
  );
});

// ─── Reminder time chips ──────────────────────────────────────────────────────
// Memoized so chip row only re-renders when reminderTime changes.

const ReminderTimeChips = memo(function ReminderTimeChips({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {REMINDER_TIME_PRESETS.map((p) => (
        <button
          key={p.value}
          onClick={() => !disabled && onChange(p.value)}
          disabled={disabled}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
            value === p.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-foreground hover:bg-accent",
            disabled && "cursor-not-allowed"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
});

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const { settings, update, reset } = useSettings();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [clearDone, setClearDone] = useState<Record<string, boolean>>({});

  // Notification permission state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    () => getNotificationPermission()
  );

  // Manual location state
  const [cityInput, setCityInput] = useState("");
  const [cityLoading, setCityLoading] = useState(false);
  const [cityError, setCityError] = useState("");
  const [savedCity, setSavedCity] = useState<SavedLocation | null>(() => getSavedLocation());

  // ── Derived values ──────────────────────────────────────────────────────────
  const notifGranted = notifPermission === "granted";
  const notifDenied  = notifPermission === "denied";

  const anyDailyEnabled = useMemo(
    () =>
      settings.dailyReflectionNotification ||
      settings.dailyDuaNotification ||
      settings.dailyInspirationReminder,
    [settings.dailyReflectionNotification, settings.dailyDuaNotification, settings.dailyInspirationReminder],
  );

  // ── Per-key stable updaters ─────────────────────────────────────────────────
  // `update` is already stable (useCallback([]) in useSettings).
  // Each of these is therefore also stable — they never recreate between renders.
  // Passing these as `onChange` props to memoized leaf components means the leaf
  // only re-renders when its own setting value changes, not on every other update.

  const updateArabicFontSize       = useCallback((v: number)  => update("arabicFontSize", v),       [update]);
  const updateTranslationFontSize  = useCallback((v: number)  => update("translationFontSize", v),  [update]);
  const updateDefaultTranslation   = useCallback((v: string)  => update("defaultTranslation", v),   [update]);
  const updateDefaultTafseer       = useCallback((v: string)  => update("defaultTafseer", v),       [update]);
  const updateShowTransliteration  = useCallback((v: boolean) => update("showTransliteration", v),  [update]);
  const updateCalculationMethod    = useCallback((v: string)  => update("calculationMethod", v),    [update]);
  const updateMadhab               = useCallback((v: string)  => update("madhab", v),               [update]);
  const updatePrayerReminderMinutes = useCallback(
    (v: 0 | 5 | 10 | 15) => update("prayerReminderMinutes", v),
    [update],
  );
  const updateAppLanguage          = useCallback((v: string)  => update("appLanguage", v),          [update]);
  const updateTranslationLanguage  = useCallback((v: string)  => update("translationLanguage", v),  [update]);
  const updateResumeLastRead       = useCallback((v: boolean) => update("resumeLastRead", v),       [update]);
  const updateSmoothScrolling      = useCallback((v: boolean) => update("smoothScrolling", v),      [update]);
  const updateHighlightLastReadVerse = useCallback((v: boolean) => update("highlightLastReadVerse", v), [update]);

  // Stable handler for per-prayer notification toggles rendered in a .map().
  // PrayerNotifToggleRow wraps this with its own useCallback keyed to settingKey
  // so each row's onChange is individually stable.
  const updatePrayerNotifKey = useCallback(
    (key: keyof AppSettings, v: boolean) => update(key, v as AppSettings[typeof key]),
    [update],
  );

  // ── Complex handlers ────────────────────────────────────────────────────────

  const handleAutoLocationToggle = useCallback((v: boolean) => {
    update("autoLocation", v);
    if (v) {
      clearSavedLocation();
      setSavedCity(null);
      setCityInput("");
      setCityError("");
    }
  }, [update]);

  const handleRequestPermission = useCallback(async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
  }, []);

  const handlePrayerNotifToggle = useCallback(async (v: boolean) => {
    update("prayerNotifications", v);
    if (v) {
      const perm = await requestNotificationPermission();
      setNotifPermission(perm);
    }
  }, [update]);

  const handleDailyToggle = useCallback(async (
    key: "dailyReflectionNotification" | "dailyDuaNotification" | "dailyInspirationReminder",
    value: boolean,
  ) => {
    if (value) {
      const perm = await requestNotificationPermission();
      setNotifPermission(perm);
      if (perm !== "granted") return;
    }
    update(key, value);
  }, [update]);

  const handleDailyReflectionToggle  = useCallback((v: boolean) => handleDailyToggle("dailyReflectionNotification", v),  [handleDailyToggle]);
  const handleDailyDuaToggle         = useCallback((v: boolean) => handleDailyToggle("dailyDuaNotification", v),         [handleDailyToggle]);
  const handleDailyInspirationToggle = useCallback((v: boolean) => handleDailyToggle("dailyInspirationReminder", v),     [handleDailyToggle]);

  const handleReminderTimeChange = useCallback((hhmm: string) => {
    update("reminderTime", hhmm);
  }, [update]);

  const [testSent, setTestSent] = useState(false);
  const handleTestNotification = useCallback(() => {
    if (testSent) return;
    try {
      const enabled = [
        settings.dailyReflectionNotification && "Daily Ayah",
        settings.dailyDuaNotification && "Daily Dua",
        settings.dailyInspirationReminder && "Daily Inspiration",
      ].filter(Boolean) as string[];
      const body = enabled.length
        ? `Active reminders: ${enabled.join(", ")}. Scheduled for ${formatReminderTime(settings.reminderTime)}.`
        : "Your daily reminders are set up correctly.";
      new Notification("✅ Rah-e-Safia — Test Notification", {
        body,
        icon: "/favicon.ico",
        tag: "rah-e-safia:test",
        silent: true,
      });
    } catch {}
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  }, [testSent, settings.dailyReflectionNotification, settings.dailyDuaNotification, settings.dailyInspirationReminder, settings.reminderTime]);

  const handleSaveCity = useCallback(async () => {
    const q = cityInput.trim();
    if (!q) return;
    setCityError("");
    setCityLoading(true);
    try {
      const loc = await forwardGeocodeCity(q);
      saveLocation(loc);
      setSavedCity(loc);
      setCityInput("");
    } catch (e: unknown) {
      setCityError(e instanceof Error ? e.message : "City not found.");
    } finally {
      setCityLoading(false);
    }
  }, [cityInput]);

  const handleClearLocation = useCallback(() => {
    clearSavedLocation();
    setSavedCity(null);
    setCityInput("");
    setCityError("");
  }, []);

  const handleClear = useCallback((key: string, action: () => void) => {
    action();
    setClearDone((p) => ({ ...p, [key]: true }));
    setTimeout(() => setClearDone((p) => ({ ...p, [key]: false })), 2000);
  }, []);

  const handleReset = useCallback(() => {
    if (!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 4000);
      return;
    }
    reset();
    setResetConfirm(false);
  }, [resetConfirm, reset]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: "Rah-e-Safia — Your Islamic Companion",
          text: "A beautiful Islamic companion app with Quran, Hadith, Tafseer, Prayer Times, and more.",
          url: window.location.origin,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin).catch(() => {});
    }
  }, []);

  const handleNavigatePrivacy = useCallback(() => navigate("/privacy"), [navigate]);
  const handleNavigateTerms   = useCallback(() => navigate("/terms"),   [navigate]);

  // Stable clear-action callbacks for Data section
  const handleClearCache = useCallback(() =>
    handleClear("cache", () => {
      const preserve = [
        "rah-e-safia:settings",
        "rah-e-safia:bookmarks",
        "rah-e-safia:dua-bookmarks",
        "rah-e-safia:reading-progress",
        "rah-e-safia:saved-location",
      ];
      Object.keys(localStorage)
        .filter((k) => k.startsWith("rah-e-safia:") && !preserve.includes(k))
        .forEach((k) => localStorage.removeItem(k));
    }),
  [handleClear]);

  const handleRefreshQuran = useCallback(() =>
    handleClear("quran", () => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("rah-e-safia:quran"))
        .forEach((k) => localStorage.removeItem(k));
    }),
  [handleClear]);

  const handleRefreshHadith = useCallback(() =>
    handleClear("hadith", () => window.location.reload()),
  [handleClear]);

  const handleRefreshTafseer = useCallback(() =>
    handleClear("tafseer", () => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("rah-e-safia:tafseer"))
        .forEach((k) => localStorage.removeItem(k));
    }),
  [handleClear]);

  const handleClearBookmarks = useCallback(() =>
    handleClear("bookmarks", () => {
      localStorage.removeItem("rah-e-safia:bookmarks");
      localStorage.removeItem("rah-e-safia:dua-bookmarks");
    }),
  [handleClear]);

  // ── Effects ─────────────────────────────────────────────────────────────────

  // Re-check permission on mount (user may have changed in browser settings)
  useEffect(() => {
    if (supportsNotifications()) setNotifPermission(Notification.permission);
  }, []);

  // Reschedule daily notifications whenever relevant settings change
  useEffect(() => {
    scheduleDailyNotifications({
      dailyReflectionNotification: settings.dailyReflectionNotification,
      dailyDuaNotification: settings.dailyDuaNotification,
      dailyInspirationReminder: settings.dailyInspirationReminder,
      reminderTime: settings.reminderTime,
    });
  }, [
    settings.dailyReflectionNotification,
    settings.dailyDuaNotification,
    settings.dailyInspirationReminder,
    settings.reminderTime,
  ]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 shadow-sm">
          <Settings className="w-4 h-4 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="font-semibold text-foreground text-sm leading-tight">Settings</h1>
          <p className="font-arabic text-muted-foreground text-xs leading-tight" dir="rtl">
            الإعدادات
          </p>
        </div>
      </header>

      <div className="flex-1 px-4 lg:px-8 py-5 lg:py-8 max-w-2xl mx-auto w-full space-y-5">

        {/* Page heading (desktop) */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden lg:block"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Settings className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Settings
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Preferences</h2>
          <p className="font-arabic text-muted-foreground text-base mt-0.5" dir="rtl">
            الإعدادات والتفضيلات
          </p>
        </motion.div>

        {/* ── Appearance ── */}
        <SectionCard icon={Palette} title="Appearance" description="Theme and display preferences">
          <div className="px-5 pt-3.5 pb-1">
            <p className="text-xs font-medium text-muted-foreground mb-2">Color Theme</p>
            <ThemeSelector />
          </div>
          <SettingRow
            icon={AlignJustify}
            label="Compact Mode"
            description="Reduce spacing for more content on screen"
            dim
          >
            <Toggle value={settings.compactMode} onChange={() => {}} disabled />
          </SettingRow>
        </SectionCard>

        {/* ── Quran Settings ── */}
        <SectionCard icon={BookOpen} title="Quran" description="Reading and display preferences">
          <SettingRow
            icon={Type}
            label="Arabic Font Size"
            description="Adjust the size of Quran Arabic text"
            vertical
          >
            <RangeSlider
              value={settings.arabicFontSize}
              min={16}
              max={32}
              step={2}
              onChange={updateArabicFontSize}
              formatValue={(v) => `${v}px`}
            />
            <p
              className="font-arabic text-right text-primary/80 mt-1 leading-relaxed"
              style={{ fontSize: settings.arabicFontSize }}
              dir="rtl"
            >
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
          </SettingRow>

          <SettingRow
            icon={Type}
            label="Translation Font Size"
            description="Adjust the size of translation and tafseer text"
            vertical
          >
            <RangeSlider
              value={settings.translationFontSize}
              min={11}
              max={18}
              step={1}
              onChange={updateTranslationFontSize}
              formatValue={(v) => `${v}px`}
            />
            <p
              className="text-foreground/70 mt-1 leading-relaxed"
              style={{ fontSize: settings.translationFontSize }}
            >
              In the name of Allah, the Most Gracious, the Most Merciful.
            </p>
          </SettingRow>

          <SettingRow
            icon={BookOpen}
            label="Default Translation"
            description="English translation shown when reading Quran"
          >
            <SelectField
              value={settings.defaultTranslation}
              onChange={updateDefaultTranslation}
              options={TRANSLATION_OPTIONS}
            />
          </SettingRow>

          <SettingRow
            icon={BookMarked}
            label="Default Tafseer"
            description="Pre-selected when opening Tafseer"
          >
            <SelectField
              value={settings.defaultTafseer}
              onChange={updateDefaultTafseer}
              options={TAFSEER_OPTIONS}
            />
          </SettingRow>

          <SettingRow
            icon={Languages}
            label="Show Transliteration"
            description="Display romanized pronunciation alongside Arabic"
          >
            <Toggle
              value={settings.showTransliteration}
              onChange={updateShowTransliteration}
            />
          </SettingRow>

          <SettingRow
            icon={BookMarked}
            label="Remember Last Position"
            description="Resume from where you left off"
            dim
          >
            <Toggle value={settings.rememberLastPosition} onChange={() => {}} disabled />
          </SettingRow>
        </SectionCard>

        {/* ── Prayer Settings ── */}
        <SectionCard icon={Clock} title="Prayer Times" description="Notifications and calculation">

          {/* Prayer Notifications master toggle */}
          <SettingRow
            icon={Bell}
            label="Prayer Notifications"
            description="Receive a browser alert at each prayer time"
          >
            <Toggle
              value={settings.prayerNotifications}
              onChange={handlePrayerNotifToggle}
            />
          </SettingRow>

          {/* Notification permission status */}
          <AnimatePresence>
            {settings.prayerNotifications && (
              <motion.div
                key="notif-status"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {notifGranted ? (
                  /* ── Per-prayer toggles — each is its own memoized component ── */
                  <div className="px-5 py-3 bg-primary/4 border-t border-border/50">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <BellRing className="w-3 h-3" strokeWidth={2} />
                      Individual Prayer Alerts
                    </p>
                    <div className="space-y-1">
                      {PRAYER_NOTIF_TOGGLES.map(({ key, label, arabic }) => (
                        <PrayerNotifToggleRow
                          key={key}
                          label={label}
                          arabic={arabic}
                          settingKey={key}
                          value={settings[key]}
                          onUpdate={updatePrayerNotifKey}
                        />
                      ))}
                    </div>
                  </div>
                ) : notifDenied ? (
                  /* ── Blocked message ── */
                  <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/15 border-t border-border/50 flex items-start gap-2.5">
                    <BellOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={1.8} />
                    <div>
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                        Notifications blocked
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                        Please allow notifications in your browser settings, then come back to enable them.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* ── Request permission ── */
                  <div className="px-5 py-3 bg-secondary/40 border-t border-border/50 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground flex-1 leading-snug">
                      Grant permission to receive prayer time notifications in your browser.
                    </p>
                    <button
                      onClick={handleRequestPermission}
                      className="shrink-0 px-3 py-1.5 rounded-lg gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      Allow
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prayer Reminder */}
          <SettingRow
            icon={Clock}
            label="Prayer Reminder"
            description="How far ahead to notify before prayer"
          >
            <PrayerReminderChips
              value={settings.prayerReminderMinutes}
              onChange={updatePrayerReminderMinutes}
            />
          </SettingRow>

          {/* Calculation Method */}
          <SettingRow
            icon={Globe2}
            label="Calculation Method"
            description="Islamic authority for prayer time calculation"
          >
            <SelectField
              value={settings.calculationMethod}
              onChange={updateCalculationMethod}
              options={CALCULATION_METHODS}
            />
          </SettingRow>

          {/* Madhab */}
          <SettingRow
            icon={BookOpen}
            label="Madhab (Asr time)"
            description="Affects Asr prayer shadow-factor calculation"
          >
            <SelectField
              value={settings.madhab}
              onChange={updateMadhab}
              options={MADHAB_OPTIONS}
            />
          </SettingRow>

          {/* Auto Location */}
          <SettingRow
            icon={MapPin}
            label="Auto Location Detection"
            description="Use device GPS for accurate prayer times and Qibla"
          >
            <Toggle
              value={settings.autoLocation}
              onChange={handleAutoLocationToggle}
            />
          </SettingRow>

          {/* Manual Location Override — visible when autoLocation is off */}
          <AnimatePresence>
            {!settings.autoLocation && (
              <motion.div
                key="manual-loc"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 py-3.5 border-t border-border/50 bg-secondary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Compass className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.8} />
                    <span className="text-sm font-medium text-foreground">Manual Location</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-3">
                    Enter your city to calculate prayer times and Qibla direction without GPS.
                  </p>

                  {/* Saved city chip */}
                  {savedCity && (
                    <div className="flex items-center gap-2 mb-2.5 px-3 py-1.5 rounded-xl bg-primary/8 border border-primary/20 w-fit">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={2} />
                      <span className="text-xs font-medium text-primary truncate max-w-[200px]">{savedCity.cityName}</span>
                      <button
                        onClick={handleClearLocation}
                        className="text-primary/60 hover:text-primary transition-colors ml-0.5"
                        aria-label="Clear location"
                      >
                        <X className="w-3 h-3" strokeWidth={2.5} />
                      </button>
                    </div>
                  )}

                  {/* City search */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cityInput}
                      onChange={(e) => { setCityInput(e.target.value); setCityError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveCity()}
                      placeholder={savedCity ? "Change city…" : "e.g. London, Karachi, Dubai"}
                      className="flex-1 text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={handleSaveCity}
                      disabled={cityLoading || !cityInput.trim()}
                      className="px-3 py-2 rounded-lg gradient-primary text-white text-xs font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-1.5"
                    >
                      {cityLoading
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Search className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {cityError && <p className="text-[11px] text-destructive mt-1.5">{cityError}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SectionCard>

        {/* ── Language ── */}
        <SectionCard icon={Globe2} title="Language" description="Interface and content language">

          {/* App Language */}
          <SettingRow
            icon={Globe2}
            label="App Language"
            description="Changes interface direction and navigation labels"
          >
            <SelectField
              value={settings.appLanguage}
              onChange={updateAppLanguage}
              options={APP_LANGUAGE_OPTIONS}
            />
          </SettingRow>

          {/* Quran Translation Language */}
          <SettingRow
            icon={BookOpen}
            label="Quran Translation"
            description="Default translation language shown in the Quran reader"
          >
            <SelectField
              value={settings.translationLanguage}
              onChange={updateTranslationLanguage}
              options={TRANSLATION_LANGUAGE_OPTIONS}
            />
          </SettingRow>

          {/* Tafseer Language */}
          <SettingRow
            icon={BookMarked}
            label="Tafseer Language"
            description="All available commentaries are currently in English"
          >
            <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg border border-border">
              English
            </span>
          </SettingRow>
        </SectionCard>

        {/* ── Reminders ── */}
        <SectionCard icon={Bell} title="Reminders" description="Daily reminders and alerts">

          {/* Permission banner — only shown when a reminder is enabled and permission isn't granted */}
          <AnimatePresence>
            {anyDailyEnabled && !notifGranted && (
              <motion.div
                key="daily-perm-banner"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className={cn(
                  "mx-5 mt-3 mb-1 rounded-xl px-4 py-3 flex items-start gap-3",
                  notifDenied
                    ? "bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-900/50"
                    : "bg-primary/8 border border-primary/20"
                )}>
                  {notifDenied ? (
                    <>
                      <BellOff className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={1.8} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                          Notifications blocked
                        </p>
                        <p className="text-[11px] text-red-600/80 dark:text-red-400/70 mt-0.5 leading-snug">
                          Enable notifications in your browser settings to receive daily reminders.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={1.8} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">
                          Allow notifications
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          Tap below to allow Rah-e-Safia to send you daily reminders.
                        </p>
                      </div>
                      <button
                        onClick={handleRequestPermission}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        Allow
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Daily Ayah */}
          <SettingRow
            icon={BellRing}
            label="Daily Ayah"
            description="Receive a Quranic verse notification each morning"
          >
            <Toggle
              value={settings.dailyReflectionNotification}
              onChange={handleDailyReflectionToggle}
            />
          </SettingRow>

          {/* Daily Dua */}
          <SettingRow
            icon={BellRing}
            label="Daily Dua"
            description="Receive a daily supplication reminder"
          >
            <Toggle
              value={settings.dailyDuaNotification}
              onChange={handleDailyDuaToggle}
            />
          </SettingRow>

          {/* Daily Inspiration */}
          <SettingRow
            icon={BellRing}
            label="Daily Inspiration Reminder"
            description="Get a daily Islamic reminder or Dhikr prompt"
          >
            <Toggle
              value={settings.dailyInspirationReminder}
              onChange={handleDailyInspirationToggle}
            />
          </SettingRow>

          {/* Reminder Time — always visible, grayed when nothing is enabled */}
          <SettingRow
            icon={Clock}
            label="Reminder Time"
            description="Shared time for all enabled daily reminders"
            vertical
            dim={!anyDailyEnabled}
          >
            {/* Preset chips */}
            <ReminderTimeChips
              value={settings.reminderTime}
              disabled={!anyDailyEnabled}
              onChange={handleReminderTimeChange}
            />

            {/* Custom time input */}
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-muted-foreground shrink-0">Custom:</span>
              <input
                type="time"
                value={settings.reminderTime}
                disabled={!anyDailyEnabled}
                onChange={(e) => e.target.value && handleReminderTimeChange(e.target.value)}
                className={cn(
                  "text-xs rounded-lg px-3 py-1.5 bg-secondary border border-border text-foreground",
                  "outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40",
                  "transition-all duration-200",
                  !anyDailyEnabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                )}
              />
              {anyDailyEnabled && (
                <span className="text-xs font-semibold text-primary">
                  {formatReminderTime(settings.reminderTime)}
                </span>
              )}
            </div>

            {/* Active reminders summary */}
            {anyDailyEnabled && notifGranted && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-3 h-3 text-primary shrink-0" strokeWidth={2.5} />
                Reminders scheduled for {formatReminderTime(settings.reminderTime)} daily
              </p>
            )}
          </SettingRow>

          {/* Test notification — only visible when permission is granted */}
          <AnimatePresence>
            {notifGranted && (
              <motion.div
                key="test-notif-row"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <BellRing
                      className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5"
                      strokeWidth={1.8}
                    />
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground leading-tight">
                        Test Notification
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                        Send a test to confirm notifications are working
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={handleTestNotification}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={cn(
                      "shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold",
                      "border transition-all duration-300",
                      testSent
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-secondary border-border text-foreground hover:bg-accent hover:border-primary/25"
                    )}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {testSent ? (
                        <motion.span
                          key="sent"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                          Sent!
                        </motion.span>
                      ) : (
                        <motion.span
                          key="send"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-1.5"
                        >
                          <BellRing className="w-3.5 h-3.5" strokeWidth={2} />
                          Send Test
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SectionCard>

        {/* ── Reading Preferences ── */}
        <SectionCard icon={BookMarked} title="Reading Preferences" description="Reading experience">
          <SettingRow
            icon={BookOpen}
            label="Resume Last Read"
            description="Automatically scroll to your last Ayah when reopening a Surah"
          >
            <Toggle
              value={settings.resumeLastRead}
              onChange={updateResumeLastRead}
            />
          </SettingRow>

          <SettingRow
            icon={Monitor}
            label="Keep Screen Awake"
            description="Prevent screen from sleeping while reading"
            dim
          >
            <Toggle value={settings.keepScreenAwake} onChange={() => {}} disabled />
          </SettingRow>

          <SettingRow
            icon={AlignJustify}
            label="Smooth Scrolling"
            description="Enable animated page transitions"
          >
            <Toggle
              value={settings.smoothScrolling}
              onChange={updateSmoothScrolling}
            />
          </SettingRow>

          <SettingRow
            icon={BookOpen}
            label="Highlight Last Read Verse"
            description="Show a gold accent on your most recently read Ayah"
          >
            <Toggle
              value={settings.highlightLastReadVerse}
              onChange={updateHighlightLastReadVerse}
            />
          </SettingRow>
        </SectionCard>

        {/* ── Data Management ── */}
        <SectionCard icon={HardDrive} title="Data & Storage" description="Cache and preferences">
          <ActionButton
            label="Clear Cache"
            description="Clears all locally cached app data"
            icon={Trash2}
            onClick={handleClearCache}
            done={clearDone["cache"]}
          />
          <ActionButton
            label="Refresh Quran Data"
            description="Re-fetches Quran text and translations"
            icon={RefreshCw}
            onClick={handleRefreshQuran}
            done={clearDone["quran"]}
          />
          <ActionButton
            label="Refresh Hadith Data"
            description="Hadith data is cached for this session"
            icon={RefreshCw}
            onClick={handleRefreshHadith}
            done={clearDone["hadith"]}
          />
          <ActionButton
            label="Refresh Tafseer Data"
            description="Re-fetches commentary from Quran.com API"
            icon={RefreshCw}
            onClick={handleRefreshTafseer}
            done={clearDone["tafseer"]}
          />
          <ActionButton
            label="Clear Bookmarks Cache"
            description="Removes all saved ayahs and duas"
            icon={Trash2}
            onClick={handleClearBookmarks}
            done={clearDone["bookmarks"]}
          />
          <div className="border-t border-border/50">
            <AnimatePresence>
              {resetConfirm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 py-3 bg-destructive/5 flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0" strokeWidth={2} />
                    <p className="text-xs text-destructive flex-1">
                      This will reset all preferences. Tap again to confirm.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <ActionButton
              label="Reset All Settings"
              description="Restore all preferences to default"
              icon={RotateCcw}
              variant="danger"
              onClick={handleReset}
            />
          </div>
        </SectionCard>

        {/* ── About ── */}
        <SectionCard icon={Info} title="About" description="App information and links">
          <AboutRow icon={Tag} label="Version" value={APP_VERSION} />
          <AboutRow icon={Info} label="Developer" value="Rah-e-Safia" />

          <div className="px-5 py-3.5 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-2">Data Sources</p>
            <div className="space-y-1">
              {[
                "Quran — AlQuran.cloud API (alquran.cloud)",
                "Hadith — fawazahmed0/hadith-api (jsDelivr CDN)",
                "Tafseer — Quran.com API v4",
                "Prayer Times — Aladhan API (aladhan.com)",
                "Geocoding — Nominatim / OpenStreetMap",
              ].map((s) => (
                <p key={s} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">•</span>
                  {s}
                </p>
              ))}
            </div>
          </div>

          <div className="border-t border-border/50 divide-y divide-border/50">
            <AboutRow icon={Shield} label="Privacy Policy" onClick={handleNavigatePrivacy} />
            <AboutRow icon={Info} label="Terms & Conditions" onClick={handleNavigateTerms} />
            <AboutRow icon={Mail} label="Contact Us" href="mailto:contact@rah-e-safia.app" />
            <AboutRow icon={Star} label="Rate the App" href="#" />
            <div
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/60 transition-colors duration-150 cursor-pointer"
              onClick={handleShare}
            >
              <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">Share the App</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
            </div>
          </div>
        </SectionCard>

        {/* Dedication footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-6 space-y-1"
        >
          <p className="font-arabic text-gold text-lg" dir="rtl">
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
          <p className="text-xs text-muted-foreground">
            Dedicated to the loving memory of{" "}
            <span className="font-medium text-foreground">Safia Bano</span>
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            Rah-e-Safia v{APP_VERSION} · Sadaqah Jariyah
          </p>
        </motion.div>

        <div className="h-6" />
      </div>
    </div>
  );
}
