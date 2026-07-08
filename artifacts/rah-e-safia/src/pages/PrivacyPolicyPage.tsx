import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Shield, ArrowLeft, MapPin, Bell, Globe, Database,
  Lock, Mail, Eye, Server, BarChart2, Heart,
} from "lucide-react";

const LAST_UPDATED = "1 July 2026";
const CONTACT_EMAIL = "contact@quran-al-falah.app";

// ─── Section card ──────────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  children,
  index,
}: {
  icon: React.ElementType;
  title: string;
  children: ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-secondary/30">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <h2 className="font-semibold text-foreground text-sm leading-tight">{title}</h2>
      </div>
      <div className="px-5 py-4 text-sm text-foreground/80 leading-relaxed space-y-2.5">
        {children}
      </div>
    </motion.div>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-primary/60" />
      <span>{children}</span>
    </div>
  );
}

function ApiRow({ name, url, purpose }: { name: string; url: string; purpose: string }) {
  return (
    <div className="rounded-xl bg-secondary/50 border border-border/60 px-4 py-3 flex items-start gap-3">
      <Globe className="w-4 h-4 text-primary/60 mt-0.5 shrink-0" strokeWidth={1.8} />
      <div className="min-w-0">
        <p className="font-medium text-foreground text-xs leading-tight">{name}</p>
        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{url}</p>
        <p className="text-xs text-muted-foreground/80 mt-1">{purpose}</p>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PrivacyPolicyPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-full flex flex-col">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-4 lg:px-8 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/settings")}
            className="w-9 h-9 rounded-xl bg-secondary hover:bg-accent flex items-center justify-center transition-colors shrink-0"
            aria-label="Back to Settings"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" strokeWidth={2} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-foreground text-sm leading-tight">Privacy Policy</h1>
            <p className="text-xs text-muted-foreground leading-tight">Last updated {LAST_UPDATED}</p>
          </div>
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm shrink-0">
            <Shield className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 lg:px-8 py-6 max-w-2xl mx-auto w-full space-y-4">

        {/* ── Hero banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl shadow-md"
          style={{ background: "linear-gradient(135deg, #1a3a2a 0%, #0f2d20 55%, #0a2018 100%)" }}
        >
          <div className="absolute inset-0 islamic-pattern opacity-20 pointer-events-none" aria-hidden="true" />
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)" }}
            aria-hidden="true" />
          <div className="relative px-6 py-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-arabic text-amber-200/80 text-sm mb-1" dir="rtl">سياسة الخصوصية</p>
              <h2 className="text-white font-bold text-lg leading-snug">Your Privacy Comes First</h2>
              <p className="text-white/60 text-xs mt-1.5 leading-relaxed max-w-sm">
                Quran Al-Falah is designed to respect your privacy. We do not operate servers that collect or store your personal data.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Sections ── */}

        <Section icon={Eye} title="Overview — What We Collect" index={0}>
          <p>
            Quran Al-Falah operates primarily on your device. <strong>We do not run servers that collect, store, or process your personal information.</strong> The app stores data only in your browser's local storage, which remains on your device at all times.
          </p>
          <p>
            There are no user accounts, no sign-ups, and no cloud sync. Everything you save — bookmarks, reading progress, settings — stays on your device.
          </p>
        </Section>

        <Section icon={MapPin} title="Location Data" index={1}>
          <p>
            Location access is requested <strong>only</strong> for two features: Prayer Times and Qibla Finder.
          </p>
          <Bullet>Your coordinates are used in real time to query the Aladhan prayer times API and to calculate the Qibla direction.</Bullet>
          <Bullet>We do not store, log, or share your location. It is never transmitted to Quran Al-Falah servers (which do not exist).</Bullet>
          <Bullet>If you choose to save a city manually, only the city name and coordinates are stored in your browser's local storage — never uploaded anywhere.</Bullet>
          <Bullet>You may deny location access at any time. Prayer times and Qibla will prompt you to enter a city name manually as a fallback.</Bullet>
        </Section>

        <Section icon={Bell} title="Device Notifications" index={2}>
          <p>
            Prayer and daily reminder notifications use your browser's built-in <strong>Notification API</strong>.
          </p>
          <Bullet>Notifications are scheduled locally on your device using JavaScript timers — no push notification server is involved.</Bullet>
          <Bullet>We do not send notifications remotely or collect any notification-related data.</Bullet>
          <Bullet>You can revoke notification permission at any time through your browser settings, and we will never request it again automatically.</Bullet>
        </Section>

        <Section icon={Server} title="External API Usage" index={3}>
          <p>
            Quran Al-Falah connects to the following third-party APIs to provide Islamic content. These requests are made directly from your browser. Please refer to each provider's privacy policy for their data practices.
          </p>
          <div className="space-y-2.5 mt-1">
            <ApiRow
              name="AlQuran Cloud"
              url="alquran.cloud"
              purpose="Qur'an text with tajweed, translations (English & Urdu), and transliterations"
            />
            <ApiRow
              name="Aladhan"
              url="aladhan.com"
              purpose="Prayer times calculation using your location coordinates and calculation method"
            />
            <ApiRow
              name="EveryAyah"
              url="everyayah.com"
              purpose="Per-ayah audio recitation files from world-renowned reciters"
            />
            <ApiRow
              name="Quran.com API"
              url="api.quran.com"
              purpose="Tafseer (Quranic commentary) texts including Maariful Quran and Ibn Kathir"
            />
            <ApiRow
              name="jsDelivr CDN / Hadith API"
              url="cdn.jsdelivr.net"
              purpose="Authenticated Hadith collections — Bukhari, Muslim, Tirmidhi, and others"
            />
            <ApiRow
              name="Nominatim / OpenStreetMap"
              url="nominatim.openstreetmap.org"
              purpose="Reverse geocoding to display your city name from GPS coordinates"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Your IP address may be visible to these services as part of standard HTTP requests. We have no control over their logging practices.
          </p>
        </Section>

        <Section icon={Database} title="Local Data Storage" index={4}>
          <p>
            The following data is stored exclusively in your browser's <code className="text-xs bg-secondary px-1.5 py-0.5 rounded font-mono">localStorage</code>:
          </p>
          <Bullet><strong>App settings</strong> — theme, font sizes, calculation method, language preferences, notification toggles</Bullet>
          <Bullet><strong>Bookmarks</strong> — Qur'an ayahs and duas you have saved</Bullet>
          <Bullet><strong>Reading progress</strong> — the last surah and ayah you read in the Qur'an</Bullet>
          <Bullet><strong>Saved location</strong> — city name and coordinates if you chose to save them</Bullet>
          <Bullet><strong>Cached content</strong> — Qur'an verses, tafseer, and hadith data to avoid repeated API calls</Bullet>
          <p>
            All of this data lives <strong>only on your device</strong>. Clearing your browser cache or using Settings → Data &amp; Storage → Clear Cache will permanently remove it.
          </p>
        </Section>

        <Section icon={BarChart2} title="Analytics & Tracking" index={5}>
          <p>
            <strong>Quran Al-Falah contains no analytics, tracking, advertising, or third-party scripts</strong> of any kind. We do not use:
          </p>
          <Bullet>Google Analytics or any analytics platform</Bullet>
          <Bullet>Cookies (session or persistent)</Bullet>
          <Bullet>Fingerprinting or device identification</Bullet>
          <Bullet>Advertising networks or remarketing pixels</Bullet>
          <Bullet>Social media tracking widgets</Bullet>
        </Section>

        <Section icon={Shield} title="Children's Privacy" index={6}>
          <p>
            Quran Al-Falah does not knowingly collect any personal information from anyone, including children under the age of 13. Because we collect no personal data, this app is safe for use by all ages.
          </p>
        </Section>

        <Section icon={Lock} title="Your Privacy Rights" index={7}>
          <p>
            Since we do not collect or store personal data on any server, there is nothing for us to delete, export, or correct on your behalf. All data stored locally can be removed by you at any time through:
          </p>
          <Bullet>Settings → Data &amp; Storage → Clear Cache (removes Qur'an/hadith cache)</Bullet>
          <Bullet>Settings → Data &amp; Storage → Clear Bookmarks Cache (removes saved ayahs)</Bullet>
          <Bullet>Settings → Reset All Settings (restores all preferences to defaults)</Bullet>
          <Bullet>Clearing your browser's site data directly</Bullet>
        </Section>

        <Section icon={Globe} title="Changes to This Policy" index={8}>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in the app's functionality or applicable law. Updates will be noted by a new "Last updated" date at the top of this page. Continued use of the app after changes constitutes acceptance of the revised policy.
          </p>
        </Section>

        <Section icon={Mail} title="Contact Us" index={9}>
          <p>
            If you have questions about this Privacy Policy or your data, please contact us:
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/15 transition-colors duration-200"
          >
            <Mail className="w-4 h-4" strokeWidth={2} />
            {CONTACT_EMAIL}
          </a>
        </Section>

        {/* ── Dedication footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center py-6 space-y-1"
        >
          <Heart className="w-4 h-4 text-rose-400 mx-auto mb-2" fill="currentColor" strokeWidth={0} />
          <p className="text-xs text-muted-foreground">
            Dedicated to the loving memory of{" "}
            <span className="font-medium text-foreground">Safia Bano</span>
          </p>
          <p className="text-[10px] text-muted-foreground/50">
            Quran Al-Falah v1.0.0 · Sadaqah Jariyah
          </p>
        </motion.div>

      </div>
    </div>
  );
}
