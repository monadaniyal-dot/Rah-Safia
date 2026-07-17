import {
  Clock,
  Compass,
  BookOpen,
  MessageSquareQuote,
  BookMarked,
  Home,
  Bookmark,
  Sparkles,
  Settings,
  Info,
  Repeat2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  arabicLabel: string;
  icon: LucideIcon;
  path: string;
}

export interface FeatureCard {
  id: string;
  icon: LucideIcon;
  arabicTitle: string;
  title: string;
  description: string;
  colorClass: string;
  iconBgClass: string;
  path: string;
}

export const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    arabicLabel: "الرئيسية",
    icon: Home,
    path: "/",
  },
  {
    id: "prayer",
    label: "Prayer Times",
    arabicLabel: "مواقيت الصلاة",
    icon: Clock,
    path: "/prayer",
  },
  {
    id: "qibla",
    label: "Qibla Finder",
    arabicLabel: "اتجاه القبلة",
    icon: Compass,
    path: "/qibla",
  },
  {
    id: "quran",
    label: "Qur'an",
    arabicLabel: "القرآن الكريم",
    icon: BookOpen,
    path: "/quran",
  },
  {
    id: "hadith",
    label: "Hadith",
    arabicLabel: "الحديث الشريف",
    icon: MessageSquareQuote,
    path: "/hadith",
  },
  {
    id: "asmaul-husna",
    label: "Names of Allah",
    arabicLabel: "أسماء الله الحسنى",
    icon: Sparkles,
    path: "/asmaul-husna",
  },
  {
    id: "tasbeeh",
    label: "Tasbeeh & Dhikr",
    arabicLabel: "التسبيح والذكر",
    icon: Repeat2,
    path: "/tasbeeh",
  },
  {
    id: "bookmarks",
    label: "Bookmarks",
    arabicLabel: "المحفوظات",
    icon: Bookmark,
    path: "/bookmarks",
  },
  {
    id: "tafseer",
    label: "Tafseer",
    arabicLabel: "التفسير",
    icon: BookMarked,
    path: "/tafseer",
  },
  {
    id: "settings",
    label: "Settings",
    arabicLabel: "الإعدادات",
    icon: Settings,
    path: "/settings",
  },
  {
    id: "about",
    label: "About",
    arabicLabel: "حول التطبيق",
    icon: Info,
    path: "/about",
  },
];

export const featureCards: FeatureCard[] = [
  {
    id: "prayer",
    icon: Clock,
    arabicTitle: "مواقيت الصلاة",
    title: "Prayer Times",
    description: "Daily Salah schedules with precise timings for your location",
    colorClass: "from-emerald-600 to-emerald-800",
    iconBgClass: "bg-emerald-500/20",
    path: "/prayer",
  },
  {
    id: "qibla",
    icon: Compass,
    arabicTitle: "اتجاه القبلة",
    title: "Qibla Finder",
    description: "Find the precise direction of the Sacred Ka'bah in Makkah",
    colorClass: "from-teal-600 to-teal-800",
    iconBgClass: "bg-teal-500/20",
    path: "/qibla",
  },
  {
    id: "quran",
    icon: BookOpen,
    arabicTitle: "القرآن الكريم",
    title: "Qur'an",
    description: "Read, listen, and reflect upon the words of Allah",
    colorClass: "from-green-700 to-green-900",
    iconBgClass: "bg-green-500/20",
    path: "/quran",
  },
  {
    id: "hadith",
    icon: MessageSquareQuote,
    arabicTitle: "الحديث الشريف",
    title: "Hadith",
    description: "Authentic sayings and traditions of the Prophet ﷺ",
    colorClass: "from-amber-600 to-amber-800",
    iconBgClass: "bg-amber-500/20",
    path: "/hadith",
  },
  {
    id: "tafseer",
    icon: BookMarked,
    arabicTitle: "تفسير القرآن",
    title: "Tafseer",
    description: "Scholarly commentary and deeper understanding of the Quran",
    colorClass: "from-sky-600 to-sky-800",
    iconBgClass: "bg-sky-500/20",
    path: "/tafseer",
  },
  {
    id: "asmaul-husna",
    icon: Sparkles,
    arabicTitle: "أسماء الله الحسنى",
    title: "Names of Allah",
    description: "Explore and reflect on all 99 beautiful names of Allah",
    colorClass: "from-violet-600 to-violet-900",
    iconBgClass: "bg-violet-500/20",
    path: "/asmaul-husna",
  },
  {
    id: "tasbeeh",
    icon: Repeat2,
    arabicTitle: "التسبيح والذكر",
    title: "Tasbeeh & Dhikr",
    description: "Daily tasbeehs, morning & evening adhkar, durood, and more",
    colorClass: "from-teal-600 to-teal-900",
    iconBgClass: "bg-teal-500/20",
    path: "/tasbeeh",
  },
];
