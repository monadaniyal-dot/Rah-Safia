import { motion, type HTMLMotionProps } from "framer-motion";
import {
  BookOpen, Headphones, Languages, BookMarked, MessageSquareQuote,
  Clock, Compass, Sparkles, Bookmark, RotateCcw, Sun, CalendarDays,
  Heart, Mail, Bug, Lightbulb, Share2, Star, ExternalLink, Info,
  ShieldCheck, FileText, BookHeart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const APP_VERSION = "1.0.0";
const BUILD_NUMBER = "2506.1";

/* ─────────────────────────────── data ─────────────────────────────── */

const FEATURES = [
  { icon: BookOpen,           label: "Qur'an",                sub: "Full text with tajweed" },
  { icon: Headphones,         label: "Audio Recitation",      sub: "5 world-class reciters" },
  { icon: Languages,          label: "Translations",          sub: "Multiple English editions" },
  { icon: BookMarked,         label: "Three Tafaseer",        sub: "Ibn Kathir, Jalalayn & more" },
  { icon: MessageSquareQuote, label: "Hadith Collections",    sub: "Sahih Bukhari, Muslim & more" },
  { icon: Clock,              label: "Prayer Times",          sub: "GPS-precise daily schedule" },
  { icon: Compass,            label: "Qibla Finder",          sub: "Precise Ka'bah direction" },
  { icon: Sparkles,           label: "Names of Allah",        sub: "All 99 beautiful names" },
  { icon: Sun,                label: "Daily Reflection",      sub: "Inspire your day" },
  { icon: BookHeart,          label: "Daily Du'a",            sub: "Supplications & dhikr" },
  { icon: CalendarDays,       label: "Hijri Calendar",        sub: "Islamic date & events" },
  { icon: Bookmark,           label: "Bookmarks",             sub: "Save verses & hadiths" },
  { icon: RotateCcw,          label: "Continue Reading",      sub: "Pick up where you left off" },
] as const;

const DATA_SOURCES = [
  {
    label: "Qur'an & Translations",
    source: "Al-Quran Cloud",
    url: "https://alquran.cloud",
    desc: "Open-source Quranic API with 90+ translations and editions",
  },
  {
    label: "Tafseer",
    source: "Tafsir.app & Quran.com",
    url: "https://tafsir.app",
    desc: "Scholarly tafseer texts including Ibn Kathir and Al-Jalalayn",
  },
  {
    label: "Hadith",
    source: "HadithAPI.com",
    url: "https://hadithapi.com",
    desc: "Authenticated collections — Bukhari, Muslim, Tirmidhi, and more",
  },
  {
    label: "Prayer Times & Qibla",
    source: "Aladhan.com",
    url: "https://aladhan.com",
    desc: "GPS-based prayer times with 8 major calculation methods",
  },
  {
    label: "Audio Recitation",
    source: "EveryAyah.com",
    url: "https://everyayah.com",
    desc: "High-quality per-ayah audio from world-renowned reciters",
  },
] as const;

/* ─────────────────────────────── helpers ─────────────────────────────── */

type FadeProps = Pick<HTMLMotionProps<"div">, "initial" | "animate" | "transition">;

const fadeUp = (delay: number): FadeProps => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: "easeOut" },
});

function SectionHeader({ title, arabic }: { title: string; arabic: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1 h-px bg-border" />
      <div className="text-center">
        <p className="text-xs font-bold text-primary/70 uppercase tracking-widest leading-none mb-0.5">
          {title}
        </p>
        <p className="font-arabic text-xs text-muted-foreground leading-none" dir="rtl">
          {arabic}
        </p>
      </div>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function ActionRow({
  icon: Icon,
  label,
  sub,
  href,
  onClick,
  iconClass = "text-primary",
  iconBg = "bg-primary/10",
  external = false,
}: {
  icon: typeof Mail;
  label: string;
  sub?: string;
  href?: string;
  onClick?: () => void;
  iconClass?: string;
  iconBg?: string;
  external?: boolean;
}) {
  const inner = (
    <div className="flex items-center gap-3.5 px-4 py-3.5">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
        <Icon className={cn("w-4 h-4", iconClass)} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{sub}</p>}
      </div>
      {external && <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" strokeWidth={1.8} />}
    </div>
  );

  const cls = "w-full text-left hover:bg-secondary/60 transition-colors duration-150 rounded-xl";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

/* ─────────────────────────────── page ─────────────────────────────── */

export default function AboutPage() {
  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: "Rah-e-Safia — Islamic Companion",
        text: "A beautiful Islamic companion app with Quran, Hadith, Prayer Times, and more.",
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
          <Info className="w-4 h-4 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="font-semibold text-foreground text-sm leading-tight">About</h1>
          <p className="font-arabic text-muted-foreground text-xs leading-tight" dir="rtl">حول التطبيق</p>
        </div>
      </header>

      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-10 max-w-2xl mx-auto w-full">

        {/* ══ Hero / App Identity ══ */}
        <motion.div {...fadeUp(0)} className="flex flex-col items-center text-center mb-10">
          {/* Logo */}
          <div className="relative mb-5">
            <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center text-5xl shadow-xl shadow-primary/20">
              🌙
            </div>
            {/* Version badge */}
            <span className="absolute -bottom-2 -right-2 text-[10px] font-bold bg-card border border-border text-primary px-2 py-0.5 rounded-full shadow-sm">
              v{APP_VERSION}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">Rah-e-Safia</h1>
          <p className="font-arabic text-lg text-primary mb-2" dir="rtl">راہِ صافیہ</p>
          <p className="text-sm text-muted-foreground mb-4">Your Daily Islamic Companion</p>

          {/* Version info chips */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-[11px] bg-secondary text-muted-foreground px-2.5 py-1 rounded-full font-mono">
              Version {APP_VERSION}
            </span>
            <span className="text-[11px] bg-secondary text-muted-foreground px-2.5 py-1 rounded-full font-mono">
              Build {BUILD_NUMBER}
            </span>
            <span className="text-[11px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
              Free Forever
            </span>
          </div>
        </motion.div>

        {/* ══ Mission ══ */}
        <motion.div {...fadeUp(0.05)} className="mb-8">
          <SectionHeader title="Our Mission" arabic="رسالتنا" />
          <div className="rounded-2xl overflow-hidden border border-primary/15 bg-primary/5">
            <div className="h-1 gradient-primary" />
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Heart className="w-4 h-4 text-white" strokeWidth={1.8} />
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  Rah-e-Safia is built to provide authentic Qur'an, Hadith, Tafseer, Prayer Times,
                  Qibla direction, Audio Recitation, and daily Islamic guidance — all in one
                  elegant, free application. Our goal is to make your connection with Deen simple,
                  beautiful, and always within reach.
                </p>
              </div>
              {/* Sadaqah Jariyah note */}
              <div className="mt-4 pt-4 border-t border-primary/10 flex items-center gap-2">
                <Heart className="w-3 h-3 text-gold fill-gold shrink-0" />
                <p className="text-xs text-muted-foreground italic">
                  Dedicated to the loving memory of <span className="font-semibold text-foreground/80">Safia Bano</span> — a source of Sadaqah Jariyah.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══ Features ══ */}
        <motion.div {...fadeUp(0.1)} className="mb-8">
          <SectionHeader title="Features" arabic="المميزات" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {FEATURES.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex items-start gap-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors duration-150 p-3"
              >
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-white" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-tight">{label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ══ Data Sources ══ */}
        <motion.div {...fadeUp(0.15)} className="mb-8">
          <SectionHeader title="Data Sources" arabic="مصادر البيانات" />
          <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
            {DATA_SOURCES.map(({ label, source, url, desc }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3.5 px-4 py-3.5 hover:bg-secondary/50 transition-colors duration-150 group"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4 text-primary" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-foreground leading-tight">{source}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-1 transition-colors duration-150" strokeWidth={1.8} />
              </a>
            ))}
          </div>
        </motion.div>

        {/* ══ Privacy & Legal ══ */}
        <motion.div {...fadeUp(0.2)} className="mb-8">
          <SectionHeader title="Privacy & Legal" arabic="الخصوصية والقانون" />
          <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
            <ActionRow
              icon={ShieldCheck}
              label="Privacy Policy"
              sub="How we handle your data"
              href="mailto:dev@rah-e-safia.app?subject=Privacy%20Policy%20Enquiry"
              iconClass="text-emerald-600"
              iconBg="bg-emerald-500/10"
              external
            />
            <ActionRow
              icon={FileText}
              label="Terms of Use"
              sub="Usage guidelines and conditions"
              href="mailto:dev@rah-e-safia.app?subject=Terms%20of%20Use%20Enquiry"
              iconClass="text-sky-600"
              iconBg="bg-sky-500/10"
              external
            />
          </div>
          <p className="text-[11px] text-muted-foreground/60 text-center mt-2 px-4">
            Rah-e-Safia does not collect, store, or sell personal data. All preferences are saved locally on your device.
          </p>
        </motion.div>

        {/* ══ Contact ══ */}
        <motion.div {...fadeUp(0.25)} className="mb-8">
          <SectionHeader title="Contact" arabic="التواصل" />
          <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
            <ActionRow
              icon={Mail}
              label="Contact Developer"
              sub="Questions, feedback, or support"
              href="mailto:dev@rah-e-safia.app?subject=Rah-e-Safia%20Contact"
              iconClass="text-primary"
              iconBg="bg-primary/10"
              external
            />
            <ActionRow
              icon={Bug}
              label="Report a Bug"
              sub="Help us improve the experience"
              href="mailto:dev@rah-e-safia.app?subject=Bug%20Report%20—%20Rah-e-Safia"
              iconClass="text-rose-600"
              iconBg="bg-rose-500/10"
              external
            />
            <ActionRow
              icon={Lightbulb}
              label="Suggest a Feature"
              sub="Share your ideas with us"
              href="mailto:dev@rah-e-safia.app?subject=Feature%20Suggestion%20—%20Rah-e-Safia"
              iconClass="text-amber-600"
              iconBg="bg-amber-500/10"
              external
            />
          </div>
        </motion.div>

        {/* ══ Share ══ */}
        <motion.div {...fadeUp(0.3)} className="mb-8">
          <SectionHeader title="Share" arabic="المشاركة" />
          <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
            <ActionRow
              icon={Share2}
              label="Share Rah-e-Safia"
              sub="Invite family and friends to benefit"
              onClick={handleShare}
              iconClass="text-primary"
              iconBg="bg-primary/10"
            />
            <ActionRow
              icon={Star}
              label="Rate the App"
              sub="Coming soon on app stores"
              onClick={() => {}}
              iconClass="text-gold"
              iconBg="bg-gold/10"
            />
          </div>
        </motion.div>

        {/* ══ Footer ══ */}
        <motion.div {...fadeUp(0.35)} className="text-center pb-8">
          <div className="bg-gold-muted rounded-2xl p-5 mb-5">
            <p className="font-arabic text-gold text-xl mb-1" dir="rtl">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
            <p className="text-xs text-muted-foreground">
              In the name of Allah, the Most Gracious, the Most Merciful
            </p>
          </div>
          <p className="text-xs text-muted-foreground/50">
            Rah-e-Safia v{APP_VERSION} · Build {BUILD_NUMBER}
          </p>
          <p className="text-xs text-muted-foreground/40 mt-1">
            Made with <Heart className="inline w-3 h-3 text-gold fill-gold mx-0.5" /> for the Ummah
          </p>
        </motion.div>

      </div>
    </div>
  );
}
