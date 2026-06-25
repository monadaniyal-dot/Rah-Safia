import { Router, Route, Switch } from "wouter";
import AppShell from "@/components/layout/AppShell";
import HomePage from "@/pages/HomePage";
import PrayerTimesPage from "@/pages/PrayerTimesPage";
import QiblaFinderPage from "@/pages/QiblaFinderPage";
import QuranPage from "@/pages/QuranPage";
import SurahPage from "@/pages/SurahPage";
import HadithPage from "@/pages/HadithPage";
import BookmarksPage from "@/pages/BookmarksPage";
import AsmaulHusnaPage from "@/pages/AsmaulHusnaPage";

export default function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

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
          <Route path="/tafseer" component={HomePage} />
        </Switch>
      </AppShell>
    </Router>
  );
}
