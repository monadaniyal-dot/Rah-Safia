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
      className="relative overflow-hidden rounded-2xl shadow-lg"
      style={{ background: "linear-gradient(135deg, #1a3a2a 0%, #0f2d20 60%, #0a2018 100%)" }}
    >
      {/* Islamic pattern overlay */}
      <div className="absolute inset-0 islamic-pattern opacity-40" aria-hidden="true" />

      {/* Decorative glow — larger and brighter */}
      <div
        className="absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #d4af37 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      {/* Bottom-left accent glow */}
      <div
        className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #4ade80 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative p-6 sm:p-7">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-amber-300" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-300/90 uppercase tracking-widest leading-none">
                Daily Ayah
              </p>
              <p className="text-xs text-white/45 leading-none mt-1">
                {ayah.surahName} · {ayah.surah}:{ayah.ayah}
              </p>
            </div>
          </div>
          <button
            onClick={share}
            aria-label="Share this Ayah"
            className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all"
          >
            {copied
              ? <Check className="w-4 h-4 text-green-400" strokeWidth={2.5} />
              : <Share2 className="w-4 h-4 text-white/70" strokeWidth={1.8} />}
          </button>
        </div>

        {/* Arabic — primary, large */}
        <p
          className="font-arabic text-right text-white leading-loose mb-4"
          dir="rtl"
          style={{ fontSize: "clamp(1.35rem, 5vw, 1.85rem)", fontWeight: 700 }}
        >
          {ayah.arabic}
        </p>

        {/* Divider */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px bg-amber-400/25" />
          <span className="text-amber-400/60 text-xs">✦</span>
          <div className="flex-1 h-px bg-amber-400/25" />
        </div>

        {/* Urdu — secondary Arabic script */}
        <p
          className="font-arabic text-right text-amber-100/85 leading-relaxed mb-3"
          dir="rtl"
          style={{ fontSize: "clamp(1rem, 3.5vw, 1.2rem)" }}
        >
          {ayah.urdu}
        </p>

        {/* English — tertiary, clearly subordinate */}
        <p className="text-white/65 text-sm leading-relaxed">
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
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-md"
    >
      {/* Subtle left accent bar — thicker */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 gradient-primary rounded-l-2xl" />

      <div className="relative pl-6 pr-5 py-5 sm:pl-7 sm:pr-6 sm:py-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-primary" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest leading-none">
                Daily Hadith
              </p>
              <p className="text-xs text-muted-foreground leading-none mt-1">
                {hadith.reference}
              </p>
            </div>
          </div>
          <button
            onClick={share}
            aria-label="Share this Hadith"
            className="w-9 h-9 rounded-xl border border-border bg-secondary/60 flex items-center justify-center hover:bg-secondary active:scale-90 transition-all"
          >
            {copied
              ? <Check className="w-4 h-4 text-green-500" strokeWidth={2.5} />
              : <Share2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />}
          </button>
        </div>

        {/* Arabic — primary, large */}
        <p
          className="font-arabic text-right text-foreground leading-loose mb-4"
          dir="rtl"
          style={{ fontSize: "clamp(1.2rem, 4.5vw, 1.6rem)", fontWeight: 700 }}
        >
          {hadith.arabic}
        </p>

        {/* English — secondary */}
        <p className="text-[0.9rem] sm:text-base text-foreground/85 leading-relaxed mb-4 font-medium">
          "{hadith.english}"
        </p>

        {/* Narrator — clearly subordinate reference */}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Narrated by{" "}
            <span className="font-semibold text-foreground/65">{hadith.narrator}</span>
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Daily Inspiration</h2>
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
