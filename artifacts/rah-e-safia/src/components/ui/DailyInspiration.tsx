import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Check, BookOpen, MessageSquare } from "lucide-react";
import { getDailyAyah, getDailyHadith } from "@/lib/daily-inspiration";

// ─── Share helper ─────────────────────────────────────────────────────────────

function buildAyahText(a: ReturnType<typeof getDailyAyah>): string {
  return (
    `${a.arabic}\n\n` +
    `${a.urdu}\n\n` +
    `"${a.english}"\n\n` +
    `— Quran ${a.surah}:${a.ayah} (${a.surahName})\n\n` +
    `Shared from Rah-e-Safia · راہِ صافیہ`
  );
}

function buildHadithText(h: ReturnType<typeof getDailyHadith>): string {
  return (
    `${h.arabic}\n\n` +
    `"${h.english}"\n\n` +
    `Narrated by: ${h.narrator}\n` +
    `— ${h.reference}\n\n` +
    `Shared from Rah-e-Safia · راہِ صافیہ`
  );
}

function useShareButton(getText: () => string) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const text = getText();
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // user cancelled — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  return { copied, share };
}

// ─── Ayah Card ────────────────────────────────────────────────────────────────

function AyahCard() {
  const ayah = getDailyAyah();
  const { copied, share } = useShareButton(() => buildAyahText(ayah));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl shadow-md"
      style={{ background: "linear-gradient(135deg, #1a3a2a 0%, #0f2d20 60%, #0a2018 100%)" }}
    >
      {/* Islamic pattern overlay */}
      <div className="absolute inset-0 islamic-pattern opacity-40" aria-hidden="true" />

      {/* Decorative glow */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #d4af37 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-amber-300" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-amber-300/80 uppercase tracking-widest leading-none">
                Daily Ayah
              </p>
              <p className="text-xs text-white/50 leading-none mt-0.5">
                {ayah.surahName} · {ayah.surah}:{ayah.ayah}
              </p>
            </div>
          </div>
          <button
            onClick={share}
            aria-label="Share this Ayah"
            className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all"
          >
            {copied
              ? <Check className="w-3.5 h-3.5 text-green-400" strokeWidth={2.5} />
              : <Share2 className="w-3.5 h-3.5 text-white/70" strokeWidth={1.8} />}
          </button>
        </div>

        {/* Arabic */}
        <p
          className="font-arabic text-right text-white leading-loose mb-3"
          dir="rtl"
          style={{ fontSize: "clamp(1.05rem, 4vw, 1.3rem)" }}
        >
          {ayah.arabic}
        </p>

        {/* Divider */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-amber-400/20" />
          <span className="text-amber-400/50 text-xs">✦</span>
          <div className="flex-1 h-px bg-amber-400/20" />
        </div>

        {/* Urdu */}
        <p
          className="font-arabic text-right text-amber-100/80 leading-relaxed text-sm mb-2"
          dir="rtl"
        >
          {ayah.urdu}
        </p>

        {/* English */}
        <p className="text-white/60 text-xs leading-relaxed">
          "{ayah.english}"
        </p>
      </div>
    </motion.div>
  );
}

// ─── Hadith Card ──────────────────────────────────────────────────────────────

function HadithCard() {
  const hadith = getDailyHadith();
  const { copied, share } = useShareButton(() => buildHadithText(hadith));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      {/* Subtle left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 gradient-primary rounded-l-2xl" />

      <div className="relative pl-5 pr-4 py-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-3.5 h-3.5 text-primary" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-widest leading-none">
                Daily Hadith
              </p>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">
                {hadith.reference}
              </p>
            </div>
          </div>
          <button
            onClick={share}
            aria-label="Share this Hadith"
            className="w-8 h-8 rounded-xl border border-border bg-secondary/60 flex items-center justify-center hover:bg-secondary active:scale-90 transition-all"
          >
            {copied
              ? <Check className="w-3.5 h-3.5 text-green-500" strokeWidth={2.5} />
              : <Share2 className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.8} />}
          </button>
        </div>

        {/* Arabic */}
        <p
          className="font-arabic text-right text-foreground leading-loose mb-2"
          dir="rtl"
          style={{ fontSize: "clamp(0.95rem, 3.5vw, 1.1rem)" }}
        >
          {hadith.arabic}
        </p>

        {/* English */}
        <p className="text-sm text-foreground/80 leading-relaxed mb-3">
          "{hadith.english}"
        </p>

        {/* Narrator */}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Narrated by{" "}
            <span className="font-medium text-foreground/70">{hadith.narrator}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

export default function DailyInspiration() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="mb-8"
    >
      {/* Section heading */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Daily Inspiration</h2>
          <p className="text-xs text-muted-foreground mt-0.5">A new Ayah and Hadith every day</p>
        </div>
        <div className="font-arabic text-muted-foreground text-sm" dir="rtl">
          وَحْيٌ يَوْمِيٌّ
        </div>
      </div>

      <div className="space-y-3">
        <AyahCard />
        <HadithCard />
      </div>
    </motion.section>
  );
}
