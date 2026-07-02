import { lazy, Suspense, useEffect } from "react";
import { Router, Route, Switch } from "wouter";
import AppShell from "@/components/layout/AppShell";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { scheduleDailyNotifications } from "@/lib/daily-notifications";
import { SETTINGS_DEFAULTS } from "@/lib/use-settings";

// ── Eager preload ──────────────────────────────────────────────────────────────
// Start fetching every route chunk the instant the main bundle executes —
// long before the user can read the home screen and tap a nav item.
// The browser resolves these promises from its module cache, so by the time
// React.lazy() is called the first time, the import is already settled.
// This eliminates Suspense suspension on first navigation and the associated
// Framer-Motion / React-18 concurrent-mode timing edge-cases that caused the
// blank-page-on-first-click bug.
const _home          = import("@/pages/HomePage");
const _prayer        = import("@/pages/PrayerTimesPage");
const _qibla         = import("@/pages/QiblaFinderPage");
const _quran         = import("@/pages/QuranPage");
const _surah         = import("@/pages/SurahPage");
const _hadith        = import("@/pages/HadithPage");
const _bookmarks     = import("@/pages/BookmarksPage");
const _asmaul        = import("@/pages/AsmaulHusnaPage");
const _tafseer       = import("@/pages/TafseerPage");
const _tafseerSurah  = import("@/pages/TafseerSurahPage");
const _settings      = import("@/pages/SettingsPage");
const _about         = import("@/pages/AboutPage");
const _privacy       = import("@/pages/PrivacyPolicyPage");
const _terms         = import("@/pages/TermsOfUsePage");

const HomePage          = lazy(() => _home);
const PrayerTimesPage   = lazy(() => _prayer);
const QiblaFinderPage   = lazy(() => _qibla);
const QuranPage         = lazy(() => _quran);
const SurahPage         = lazy(() => _surah);
const HadithPage        = lazy(() => _hadith);
const BookmarksPage     = lazy(() => _bookmarks);
const AsmaulHusnaPage   = lazy(() => _asmaul);
const TafseerPage       = lazy(() => _tafseer);
const TafseerSurahPage  = lazy(() => _tafseerSurah);
const SettingsPage      = lazy(() => _settings);
const AboutPage         = lazy(() => _about);
const PrivacyPolicyPage = lazy(() => _privacy);
const TermsOfUsePage    = lazy(() => _terms);

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
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Switch>
              <Route path="/"                      component={HomePage} />
              <Route path="/prayer"                component={PrayerTimesPage} />
              <Route path="/qibla"                 component={QiblaFinderPage} />
              <Route path="/quran/:number"         component={SurahPage} />
              <Route path="/quran"                 component={QuranPage} />
              <Route path="/hadith"                component={HadithPage} />
              <Route path="/bookmarks"             component={BookmarksPage} />
              <Route path="/asmaul-husna"          component={AsmaulHusnaPage} />
              <Route path="/tafseer/surah/:number" component={TafseerSurahPage} />
              <Route path="/tafseer"               component={TafseerPage} />
              <Route path="/settings"              component={SettingsPage} />
              <Route path="/about"                 component={AboutPage} />
              <Route path="/privacy"               component={PrivacyPolicyPage} />
              <Route path="/terms"                 component={TermsOfUsePage} />
            </Switch>
          </Suspense>
        </ErrorBoundary>
      </AppShell>
    </Router>
  );
}
