import { lazy, Suspense, useEffect } from "react";
import { Router, Route, Switch } from "wouter";
import AppShell from "@/components/layout/AppShell";
import { scheduleDailyNotifications } from "@/lib/daily-notifications";
import { SETTINGS_DEFAULTS } from "@/lib/use-settings";

const HomePage          = lazy(() => import("@/pages/HomePage"));
const PrayerTimesPage   = lazy(() => import("@/pages/PrayerTimesPage"));
const QiblaFinderPage   = lazy(() => import("@/pages/QiblaFinderPage"));
const QuranPage         = lazy(() => import("@/pages/QuranPage"));
const SurahPage         = lazy(() => import("@/pages/SurahPage"));
const HadithPage        = lazy(() => import("@/pages/HadithPage"));
const BookmarksPage     = lazy(() => import("@/pages/BookmarksPage"));
const AsmaulHusnaPage   = lazy(() => import("@/pages/AsmaulHusnaPage"));
const TafseerPage       = lazy(() => import("@/pages/TafseerPage"));
const TafseerSurahPage  = lazy(() => import("@/pages/TafseerSurahPage"));
const SettingsPage      = lazy(() => import("@/pages/SettingsPage"));
const AboutPage         = lazy(() => import("@/pages/AboutPage"));

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[40vh]">
      <div className="w-8 h-8 rounded-full gradient-primary animate-pulse" />
    </div>
  );
}

export default function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rah-e-safia:settings");
      const s = raw ? { ...SETTINGS_DEFAULTS, ...JSON.parse(raw) } : SETTINGS_DEFAULTS;
      scheduleDailyNotifications(s);
    } catch {}
  }, []);

  return (
    <Router base={base}>
      <AppShell>
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/"                  component={HomePage} />
            <Route path="/prayer"            component={PrayerTimesPage} />
            <Route path="/qibla"             component={QiblaFinderPage} />
            <Route path="/quran/:number"     component={SurahPage} />
            <Route path="/quran"             component={QuranPage} />
            <Route path="/hadith"            component={HadithPage} />
            <Route path="/bookmarks"         component={BookmarksPage} />
            <Route path="/asmaul-husna"      component={AsmaulHusnaPage} />
            <Route path="/tafseer/surah/:number" component={TafseerSurahPage} />
            <Route path="/tafseer"           component={TafseerPage} />
            <Route path="/settings"          component={SettingsPage} />
            <Route path="/about"             component={AboutPage} />
          </Switch>
        </Suspense>
      </AppShell>
    </Router>
  );
}
