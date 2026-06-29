import { useState, type ReactNode } from "react";
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
  Lock,
  Compass,
  Languages,
  AlignJustify,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/use-settings";
import { COLLECTIONS as TAFSEER_SOURCES } from "@/lib/hadith-api";

const APP_VERSION = "1.0.0";

// ─── Reusable primitives ─────────────────────────────────────────────────────

function ComingSoonBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 shrink-0">
      <Lock className="w-2.5 h-2.5" strokeWidth={2.5} />
      Soon
    </span>
  );
}

function Toggle({
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
}

function RangeSlider({
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
}

function SelectField({
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
}

// ─── Section card ─────────────────────────────────────────────────────────────

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
  comingSoon = false,
  children,
  vertical = false,
}: {
  icon?: React.ElementType;
  label: string;
  description?: string;
  comingSoon?: boolean;
  children?: ReactNode;
  vertical?: boolean;
}) {
  return (
    <div
      className={cn(
        "px-5 py-3.5",
        comingSoon && "opacity-50",
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground leading-tight">
              {label}
            </span>
            {comingSoon && <ComingSoonBadge />}
          </div>
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

// ─── Action button (Data section) ────────────────────────────────────────────

function ActionButton({
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
}

// ─── About row ────────────────────────────────────────────────────────────────

function AboutRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  href?: string;
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

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }
  return <div>{inner}</div>;
}

// ─── Theme selector ───────────────────────────────────────────────────────────

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

function ThemeSelector() {
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
}

// ─── Translation options ──────────────────────────────────────────────────────

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
  { value: "Karachi", label: "University of Islamic Sciences, Karachi" },
];

const MADHAB_OPTIONS = [
  { value: "shafi", label: "Shafi'i / Maliki / Hanbali" },
  { value: "hanafi", label: "Hanafi" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ur", label: "Urdu" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "id", label: "Indonesian" },
];

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const { settings, update, reset } = useSettings();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [clearDone, setClearDone] = useState<Record<string, boolean>>({});

  function handleClear(key: string, action: () => void) {
    action();
    setClearDone((p) => ({ ...p, [key]: true }));
    setTimeout(() => setClearDone((p) => ({ ...p, [key]: false })), 2000);
  }

  function clearBookmarks() {
    handleClear("bookmarks", () => {
      localStorage.removeItem("rah-e-safia:bookmarks");
      localStorage.removeItem("rah-e-safia:dua-bookmarks");
    });
  }

  function clearHadithCache() {
    handleClear("hadith", () => {});
  }

  function handleReset() {
    if (!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 4000);
      return;
    }
    reset();
    setResetConfirm(false);
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: "Rah-e-Safia — Your Islamic Companion",
        text: "A beautiful Islamic companion app with Quran, Hadith, Tafseer, Prayer Times, and more.",
        url: window.location.origin,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin).catch(() => {});
    }
  }

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
            الإعدادات
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
            comingSoon
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
              onChange={(v) => update("arabicFontSize", v)}
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
              onChange={(v) => update("translationFontSize", v)}
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
            description="Shown when reading Quran"
          >
            <SelectField
              value={settings.defaultTranslation}
              onChange={(v) => update("defaultTranslation", v)}
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
              onChange={(v) => update("defaultTafseer", v)}
              options={TAFSEER_OPTIONS}
            />
          </SettingRow>

          <SettingRow
            icon={Languages}
            label="Show Transliteration"
            description="Display romanized pronunciation alongside Arabic"
            comingSoon
          >
            <Toggle value={settings.showTransliteration} onChange={() => {}} disabled />
          </SettingRow>

          <SettingRow
            icon={BookMarked}
            label="Remember Last Position"
            description="Resume from where you left off"
            comingSoon
          >
            <Toggle value={settings.rememberLastPosition} onChange={() => {}} disabled />
          </SettingRow>
        </SectionCard>

        {/* ── Prayer Settings ── */}
        <SectionCard icon={Clock} title="Prayer Times" description="Notifications and calculation">
          <SettingRow
            icon={Bell}
            label="Prayer Notifications"
            description="Receive an alert at each prayer time"
            comingSoon
          >
            <Toggle value={settings.prayerNotifications} onChange={() => {}} disabled />
          </SettingRow>

          <SettingRow
            icon={Clock}
            label="Prayer Reminder"
            description="Minutes before the prayer begins"
            comingSoon
          >
            <div className="flex gap-1.5">
              {([5, 10, 15] as const).map((m) => (
                <button
                  key={m}
                  disabled
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all disabled:cursor-not-allowed",
                    settings.prayerReminderMinutes === m
                      ? "gradient-primary text-white border-transparent"
                      : "bg-secondary text-muted-foreground border-border"
                  )}
                >
                  {m}m
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow
            icon={Globe2}
            label="Calculation Method"
            description="Islamic authority for prayer time calculation"
            comingSoon
          >
            <SelectField
              value={settings.calculationMethod}
              onChange={() => {}}
              options={CALCULATION_METHODS}
              disabled
            />
          </SettingRow>

          <SettingRow
            icon={BookOpen}
            label="Madhab (Asr time)"
            description="Affects Asr prayer calculation"
            comingSoon
          >
            <SelectField
              value={settings.madhab}
              onChange={() => {}}
              options={MADHAB_OPTIONS}
              disabled
            />
          </SettingRow>

          <SettingRow
            icon={MapPin}
            label="Auto Location Detection"
            description="Use device GPS for accurate prayer times"
          >
            <Toggle
              value={settings.autoLocation}
              onChange={(v) => update("autoLocation", v)}
            />
          </SettingRow>

          <SettingRow
            icon={MapPin}
            label="Manual Location Override"
            description="Set a specific city or coordinates"
            comingSoon
          />
        </SectionCard>

        {/* ── Language ── */}
        <SectionCard icon={Globe2} title="Language" description="Content and app language">
          <SettingRow
            icon={Globe2}
            label="App Language"
            description="Interface language"
            comingSoon
          >
            <SelectField
              value={settings.appLanguage}
              onChange={() => {}}
              options={LANGUAGE_OPTIONS}
              disabled
            />
          </SettingRow>

          <SettingRow
            icon={BookOpen}
            label="Quran Translation Language"
            description="Language for Quran translations"
            comingSoon
          >
            <SelectField
              value={settings.translationLanguage}
              onChange={() => {}}
              options={LANGUAGE_OPTIONS}
              disabled
            />
          </SettingRow>

          <SettingRow
            icon={BookMarked}
            label="Tafseer Language"
            description="Future-ready for multi-language tafseers"
            comingSoon
          />
        </SectionCard>

        {/* ── Notifications ── */}
        <SectionCard icon={Bell} title="Notifications" description="Daily reminders and alerts">
          <SettingRow
            icon={Bell}
            label="Daily Ayah"
            description="Receive a new verse each morning"
            comingSoon
          >
            <Toggle value={settings.dailyReflectionNotification} onChange={() => {}} disabled />
          </SettingRow>

          <SettingRow
            icon={Bell}
            label="Daily Dua"
            description="Receive a daily supplication reminder"
            comingSoon
          >
            <Toggle value={settings.dailyDuaNotification} onChange={() => {}} disabled />
          </SettingRow>

          <SettingRow
            icon={Bell}
            label="Daily Inspiration Reminder"
            description="Get a daily Dua or Dhikr reminder"
            comingSoon
          >
            <Toggle value={settings.dailyInspirationReminder} onChange={() => {}} disabled />
          </SettingRow>

          <SettingRow
            icon={Clock}
            label="Reminder Time"
            description="What time to send daily reminders"
            comingSoon
          >
            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg">
              {settings.reminderTime}
            </span>
          </SettingRow>
        </SectionCard>

        {/* ── Reading Preferences ── */}
        <SectionCard icon={BookMarked} title="Reading Preferences" description="Reading experience">
          <SettingRow
            icon={BookOpen}
            label="Resume Last Read"
            description="Open Quran where you left off"
            comingSoon
          >
            <Toggle value={settings.resumeLastRead} onChange={() => {}} disabled />
          </SettingRow>

          <SettingRow
            icon={Monitor}
            label="Keep Screen Awake"
            description="Prevent screen from sleeping while reading"
            comingSoon
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
              onChange={(v) => update("smoothScrolling", v)}
            />
          </SettingRow>

          <SettingRow
            icon={BookOpen}
            label="Highlight Last Read Verse"
            description="Visually mark where you last stopped reading"
            comingSoon
          >
            <Toggle value={settings.highlightLastReadVerse} onChange={() => {}} disabled />
          </SettingRow>
        </SectionCard>

        {/* ── Data Management ── */}
        <SectionCard icon={HardDrive} title="Data & Storage" description="Cache and preferences">
          <ActionButton
            label="Clear Cache"
            description="Clears all locally cached app data"
            icon={Trash2}
            onClick={() =>
              handleClear("cache", () => {
                const preserve = [
                  "rah-e-safia:settings",
                  "rah-e-safia:bookmarks",
                  "rah-e-safia:dua-bookmarks",
                  "rah-e-safia:reading-progress",
                ];
                Object.keys(localStorage)
                  .filter((k) => k.startsWith("rah-e-safia:") && !preserve.includes(k))
                  .forEach((k) => localStorage.removeItem(k));
              })
            }
            done={clearDone["cache"]}
          />
          <ActionButton
            label="Refresh Quran Data"
            description="Re-fetches Quran text and translations"
            icon={RefreshCw}
            onClick={() =>
              handleClear("quran", () => {
                Object.keys(localStorage)
                  .filter((k) => k.startsWith("rah-e-safia:quran"))
                  .forEach((k) => localStorage.removeItem(k));
              })
            }
            done={clearDone["quran"]}
          />
          <ActionButton
            label="Refresh Hadith Data"
            description="Hadith data is cached for this session"
            icon={RefreshCw}
            onClick={() => handleClear("hadith", () => window.location.reload())}
            done={clearDone["hadith"]}
          />
          <ActionButton
            label="Refresh Tafseer Data"
            description="Re-fetches commentary from Quran.com API"
            icon={RefreshCw}
            onClick={() =>
              handleClear("tafseer", () => {
                Object.keys(localStorage)
                  .filter((k) => k.startsWith("rah-e-safia:tafseer"))
                  .forEach((k) => localStorage.removeItem(k));
              })
            }
            done={clearDone["tafseer"]}
          />
          <ActionButton
            label="Clear Bookmarks Cache"
            description="Removes all saved ayahs and duas"
            icon={Trash2}
            onClick={clearBookmarks}
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
                "Quran — Quran.com API (quran.com)",
                "Hadith — fawazahmed0/hadith-api (jsDelivr CDN)",
                "Tafseer — Quran.com API v4",
                "Prayer Times — Solar calculation (Makkah fallback)",
                "99 Names — Open Islamic dataset",
              ].map((s) => (
                <p key={s} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">•</span>
                  {s}
                </p>
              ))}
            </div>
          </div>

          <div className="border-t border-border/50 divide-y divide-border/50">
            <AboutRow icon={Shield} label="Privacy Policy" href="#" />
            <AboutRow icon={Info} label="Terms & Conditions" href="#" />
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
