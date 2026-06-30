import { useEffect } from "react";
import { Router, Route, Switch } from "wouter";
import AppShell from "@/components/layout/AppShell";
import { scheduleDailyNotifications } from "@/lib/daily-notifications";
import { SETTINGS_DEFAULTS } from "@/lib/use-settings";
import HomePage from "@/pages/HomePage";
import PrayerTimesPage from "@/pages/PrayerTimesPage";
import QiblaFinderPage from "@/pages/QiblaFinderPage";
import QuranPage from "@/pages/QuranPage";
import SurahPage from "@/pages/SurahPage";
import HadithPage from "@/pages/HadithPage";
import BookmarksPage from "@/pages/BookmarksPage";
import AsmaulHusnaPage from "@/pages/AsmaulHusnaPage";
import TafseerPage from "@/pages/TafseerPage";
import TafseerSurahPage from "@/pages/TafseerSurahPage";
import SettingsPage from "@/pages/SettingsPage";

export default function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  // Schedule daily notifications once on startup using persisted settings
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
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/prayer" component={PrayerTimesPage} />
          <Route path="/qibla" component={QiblaFinderPage} />
          <Route path="/quran/:number" component={SurahPage} />
          <Route path="/quran" component={QuranPage} />
          <Route path="/hadith" component={HadithPage} />
          <Route path="/bookmarks" component={BookmarksPage} />
          <Route path="/asmaul-husna" component={AsmaulHusnaPage} />
          <Route path="/tafseer/surah/:number" component={TafseerSurahPage} />
          <Route path="/tafseer" component={TafseerPage} />
          <Route path="/settings" component={SettingsPage} />
        </Switch>
      </AppShell>
    </Router>
  );
}
