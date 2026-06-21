import { Router, Route, Switch } from "wouter";
import AppShell from "@/components/layout/AppShell";
import HomePage from "@/pages/HomePage";

export default function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <Router base={base}>
      <AppShell>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/prayer" component={HomePage} />
          <Route path="/qibla" component={HomePage} />
          <Route path="/quran" component={HomePage} />
          <Route path="/hadith" component={HomePage} />
          <Route path="/tafseer" component={HomePage} />
        </Switch>
      </AppShell>
    </Router>
  );
}
