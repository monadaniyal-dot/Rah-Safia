import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  FileText, ArrowLeft, BookOpen, User, Globe, AlertTriangle,
  RefreshCw, Scale, Info, Heart, Mail, Shield, Clock,
} from "lucide-react";

const LAST_UPDATED = "1 July 2026";
const CONTACT_EMAIL = "contact@rah-e-safia.app";

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

function Highlight({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl bg-amber-500/8 border border-amber-500/20 px-4 py-3 flex items-start gap-3">
      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" strokeWidth={1.8} />
      <p className="text-amber-800 dark:text-amber-200/80 text-xs leading-relaxed">{children}</p>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TermsOfUsePage() {
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
            <h1 className="font-semibold text-foreground text-sm leading-tight">Terms of Use</h1>
            <p className="text-xs text-muted-foreground leading-tight">Last updated {LAST_UPDATED}</p>
          </div>
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm shrink-0">
            <FileText className="w-4 h-4 text-white" strokeWidth={2} />
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
          <div
            className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)" }}
            aria-hidden="true"
          />
          <div className="relative px-6 py-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Scale className="w-6 h-6 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-arabic text-amber-200/80 text-sm mb-1" dir="rtl">شروط الاستخدام</p>
              <h2 className="text-white font-bold text-lg leading-snug">Terms of Use</h2>
              <p className="text-white/60 text-xs mt-1.5 leading-relaxed max-w-sm">
                By using Rah-e-Safia, you agree to these terms. Please read them carefully before using the application.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Sections ── */}

        <Section icon={Info} title="Introduction" index={0}>
          <p>
            Welcome to <strong>Rah-e-Safia (راہِ صافیہ)</strong> — a free Islamic companion application dedicated to the loving memory of Safia Bano, as a source of Sadaqah Jariyah.
          </p>
          <p>
            By accessing or using this application, you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, please discontinue use of the app.
          </p>
        </Section>

        <Section icon={BookOpen} title="Educational & Religious Disclaimer" index={1}>
          <Highlight>
            Rah-e-Safia provides Islamic content for <strong>educational and personal reference purposes only</strong>. Nothing in this app constitutes a formal religious ruling (fatwa), legal opinion, or scholarly endorsement.
          </Highlight>
          <Bullet>Qur'an text, translations, and transliterations are sourced from established open APIs and presented as-is for reading and reflection.</Bullet>
          <Bullet>Hadith narrations are from authenticated collections (Bukhari, Muslim, etc.) but may carry varying chains of narration; verify with qualified scholars for matters of practice.</Bullet>
          <Bullet>Tafseer (commentary) represents the views of the respective scholars and authors, not of Rah-e-Safia.</Bullet>
          <Bullet>Prayer times are algorithmically calculated based on astronomical data. For official prayer times in your area, please verify with your local mosque.</Bullet>
          <Bullet>The Qibla direction is an approximation. For precise direction, use a dedicated compass device or consult local religious authorities.</Bullet>
        </Section>

        <Section icon={User} title="User Responsibilities" index={2}>
          <p>As a user of Rah-e-Safia, you agree to:</p>
          <Bullet>Use the app in a manner consistent with Islamic ethics and respect for sacred texts.</Bullet>
          <Bullet>Not use automated tools, bots, or scripts to scrape, crawl, or mass-download content from the app or the third-party APIs it relies on.</Bullet>
          <Bullet>Not attempt to reverse-engineer, decompile, or tamper with the app's source code for commercial purposes.</Bullet>
          <Bullet>Not use the app in any manner that could overload or abuse the third-party APIs that provide Islamic content.</Bullet>
          <Bullet>Accept responsibility for your own use of the app and any decisions made based on its content.</Bullet>
        </Section>

        <Section icon={Globe} title="Third-Party Content & APIs" index={3}>
          <p>
            Rah-e-Safia displays content sourced from external providers. We make every effort to use trusted, authenticated sources, but we cannot guarantee the absolute accuracy, completeness, or currency of this content.
          </p>
          <Bullet><strong>Qur'an text</strong> — sourced via AlQuran.cloud API under open licence.</Bullet>
          <Bullet><strong>Hadith collections</strong> — sourced via HadithAPI.com / jsDelivr CDN; authenticated collections with standard chain classifications.</Bullet>
          <Bullet><strong>Tafseer</strong> — sourced via Quran.com API v4; represents scholarly commentary and may differ between traditions.</Bullet>
          <Bullet><strong>Prayer times</strong> — calculated via Aladhan.com using GPS coordinates and your chosen calculation method.</Bullet>
          <Bullet><strong>Audio recitation</strong> — served by EveryAyah.com; subject to their terms of service.</Bullet>
          <p>
            Third-party API availability is outside our control. The app will display appropriate error states when external services are temporarily unavailable.
          </p>
        </Section>

        <Section icon={Shield} title="Intellectual Property" index={4}>
          <p>
            The <strong>app design, layout, codebase, and original written content</strong> of Rah-e-Safia are the intellectual property of its developers.
          </p>
          <Bullet>The Qur'anic text is the word of Allah (ﷻ) and is not owned by any individual or organisation.</Bullet>
          <Bullet>Hadith collections are classical Islamic scholarship and are reproduced here under open-access licences.</Bullet>
          <Bullet>Tafseer texts are attributed to their respective scholars; reproduction outside this app may require permission from the original publishers.</Bullet>
          <Bullet>The name <strong>Rah-e-Safia</strong>, its logo, and branding are proprietary to the app's developers.</Bullet>
        </Section>

        <Section icon={AlertTriangle} title="Limitation of Liability" index={5}>
          <Highlight>
            Rah-e-Safia is provided <strong>"as is"</strong> and <strong>"as available"</strong> without warranties of any kind, express or implied.
          </Highlight>
          <p>To the fullest extent permitted by law, Rah-e-Safia and its developers shall not be liable for:</p>
          <Bullet>Any inaccuracies in Qur'anic text, translations, Hadith, Tafseer, or prayer times.</Bullet>
          <Bullet>Any spiritual, religious, legal, or personal decisions made based on content viewed in the app.</Bullet>
          <Bullet>Any loss of data due to browser cache clearing, device reset, or application updates.</Bullet>
          <Bullet>Any interruption in service caused by third-party API downtime or network unavailability.</Bullet>
          <Bullet>Any indirect, incidental, or consequential damages arising from use of the app.</Bullet>
        </Section>

        <Section icon={Clock} title="Service Availability" index={6}>
          <p>
            Rah-e-Safia depends on several third-party APIs for its core content. We do not guarantee uninterrupted availability of the app or any of its features. Scheduled maintenance, API rate limits, and network issues may temporarily affect functionality.
          </p>
          <p>
            We will endeavour to keep the app updated and functioning but are under no obligation to maintain any particular feature indefinitely.
          </p>
        </Section>

        <Section icon={RefreshCw} title="Future Updates & Changes" index={7}>
          <p>
            These Terms of Use may be updated at any time to reflect changes in the app's functionality, applicable law, or our policies. Changes will be noted by a new "Last updated" date at the top of this page.
          </p>
          <p>
            <strong>Continued use of Rah-e-Safia after any changes to these terms constitutes your acceptance of the updated terms.</strong> If you disagree with any update, you should discontinue use of the app.
          </p>
          <p>
            New features or modules added to the app in the future will automatically be governed by the then-current Terms of Use.
          </p>
        </Section>

        <Section icon={Mail} title="Contact Us" index={8}>
          <p>
            If you have questions about these Terms of Use, wish to report a content error, or have any other concerns, please contact us:
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
            Rah-e-Safia v1.0.0 · Sadaqah Jariyah
          </p>
        </motion.div>

      </div>
    </div>
  );
}
