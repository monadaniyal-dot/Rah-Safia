import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Bookmark, BookmarkCheck, Check, BookOpen, MessageSquare } from "lucide-react";
import { getDailyAyah, getDailyHadith } from "@/lib/daily-inspiration";

// ─── Saved inspirations (localStorage) ───────────────────────────────────────

const SAVED_KEY = "rah-e-safia:saved-inspirations";

function loadSaved(): Set<string> {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function persistSaved(s: Set<string>) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify([...s]));
  } catch { /* ignore */ }
}

function useSaved(key: string) {
  const [saved, setSaved] = useState(() => loadSaved().has(key));

  const toggle = useCallback(() => {
    setSaved((prev) => {
      const all = loadSaved();
      if (prev) all.delete(key);
      else all.add(key);
      persistSaved(all);
      return !prev;
    });
  }, [key]);

  return { saved, toggle };
}

// ─── Action buttons ───────────────────────────────────────────────────────────

type ActionState = "idle" | "copied" | "shared";

function useActions(getText: () => string) {
  const [state, setState] = useState<ActionState>("idle");

  const share = async () => {
    const text = getText();
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(text);
      setState("shared");
      setTimeout(() => setState("idle"), 2000);
    } catch { /* blocked */ }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch { /* blocked */ }
  };

  return { state, share, copy };
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = "ayah" | "hadith";

// ─── Ayah hero ────────────────────────────────────────────────────────────────

function AyahHero({ active }: { active: boolean }) {
  const ayah = getDailyAyah();
  const key = `ayah-${ayah.surah}-${ayah.ayah}`;
  const { saved, toggle: toggleSave } = useSaved(key);
  const { state, share, copy } = useActions(() =>
    `${ayah.arabic}\n\n${ayah.urdu}\n\n"${ayah.english}"\n\n— Quran ${ayah.surah}:${ayah.ayah} (${ayah.surahName})\n\nShared from Rah-e-Safia · راہِ صافیہ`
  );

  return (
    <AnimatePresence mode="wait">
      {active && (
        <motion.div
          key="ayah"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.38, ease: "easeOut" }}
          className="flex flex-col items-center text-center px-6 sm:px-10 md:px-14 pt-8 pb-8 gap-6"
        >
          {/* Source badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/25">
            <BookOpen className="w-3 h-3 text-amber-300 shrink-0" strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-300/90">
              {ayah.surahName} · {ayah.surah}:{ayah.ayah}
            </span>
          </div>

          {/* Arabic — hero text */}
          <p
            className="font-arabic text-white leading-[1.9] w-full"
            dir="rtl"
            style={{ fontSize: "clamp(1.7rem, 5.5vw, 2.9rem)", fontWeight: 700, textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}
          >
            {ayah.arabic}
          </p>

          {/* Gold divider */}
          <div className="flex items-center gap-3 w-full max-w-xs">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
            <span className="text-amber-400/70 text-base">✦</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
          </div>

          {/* Urdu */}
          <p
            className="font-arabic text-amber-100/90 leading-relaxed w-full"
            dir="rtl"
            style={{ fontSize: "clamp(1rem, 3vw, 1.3rem)" }}
          >
            {ayah.urdu}
          </p>

          {/* English */}
          <p
            className="text-white/70 leading-relaxed max-w-lg"
            style={{ fontSize: "clamp(0.875rem, 2.5vw, 1.05rem)" }}
          >
            "{ayah.english}"
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Hadith hero ──────────────────────────────────────────────────────────────

function HadithHero({ active }: { active: boolean }) {
  const hadith = getDailyHadith();
  const key = `hadith-${hadith.reference}`;
  const { saved, toggle: toggleSave } = useSaved(key);
  const { state, share, copy } = useActions(() =>
    `${hadith.arabic}\n\n"${hadith.english}"\n\nNarrated by: ${hadith.narrator}\n— ${hadith.reference}\n\nShared from Rah-e-Safia · راہِ صافیہ`
  );

  return (
    <AnimatePresence mode="wait">
      {active && (
        <motion.div
          key="hadith"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.38, ease: "easeOut" }}
          className="flex flex-col items-center text-center px-6 sm:px-10 md:px-14 pt-8 pb-8 gap-6"
        >
          {/* Source badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/25">
            <MessageSquare className="w-3 h-3 text-amber-300 shrink-0" strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-300/90">
              {hadith.reference}
            </span>
          </div>

          {/* Arabic — hero text */}
          <p
            className="font-arabic text-white leading-[1.9] w-full"
            dir="rtl"
            style={{ fontSize: "clamp(1.5rem, 5vw, 2.6rem)", fontWeight: 700, textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}
          >
            {hadith.arabic}
          </p>

          {/* Gold divider */}
          <div className="flex items-center gap-3 w-full max-w-xs">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
            <span className="text-amber-400/70 text-base">✦</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
          </div>

          {/* English */}
          <p
            className="text-white/85 leading-relaxed max-w-lg font-medium"
            style={{ fontSize: "clamp(0.95rem, 2.8vw, 1.15rem)" }}
          >
            "{hadith.english}"
          </p>

          {/* Narrator */}
          <p className="text-white/45 text-xs tracking-wide">
            Narrated by{" "}
            <span className="text-white/65 font-semibold">{hadith.narrator}</span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Action bar ───────────────────────────────────────────────────────────────

function ActionBar({
  onShare, onCopy, onSave,
  actionState, saved,
}: {
  onShare: () => void;
  onCopy: () => void;
  onSave: () => void;
  actionState: ActionState;
  saved: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-3 px-6 pb-7">
      {/* Share */}
      <button
        onClick={onShare}
        aria-label="Share"
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/18 active:scale-95 transition-all text-white/80 text-xs font-semibold"
      >
        <Share2 className="w-3.5 h-3.5" strokeWidth={2} />
        Share
      </button>

      {/* Copy */}
      <button
        onClick={onCopy}
        aria-label="Copy"
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/18 active:scale-95 transition-all text-white/80 text-xs font-semibold"
      >
        {actionState === "copied"
          ? <Check className="w-3.5 h-3.5 text-green-400" strokeWidth={2.5} />
          : <Copy className="w-3.5 h-3.5" strokeWidth={2} />}
        {actionState === "copied" ? "Copied!" : "Copy"}
      </button>

      {/* Save */}
      <button
        onClick={onSave}
        aria-label={saved ? "Unsave" : "Save"}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border active:scale-95 transition-all text-xs font-semibold ${
          saved
            ? "bg-amber-400/25 border-amber-400/50 text-amber-300"
            : "bg-white/10 border-white/20 hover:bg-white/18 text-white/80"
        }`}
      >
        {saved
          ? <BookmarkCheck className="w-3.5 h-3.5" strokeWidth={2} />
          : <Bookmark className="w-3.5 h-3.5" strokeWidth={2} />}
        {saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}

// ─── Main hero card ───────────────────────────────────────────────────────────

export default function DailyInspiration() {
  const [tab, setTab] = useState<Tab>("ayah");

  const ayah = getDailyAyah();
  const hadith = getDailyHadith();

  const ayahKey = `ayah-${ayah.surah}-${ayah.ayah}`;
  const hadithKey = `hadith-${hadith.reference}`;

  const { saved: ayahSaved, toggle: toggleAyahSave } = useSaved(ayahKey);
  const { saved: hadithSaved, toggle: toggleHadithSave } = useSaved(hadithKey);

  const {
    state: ayahActionState, share: shareAyah, copy: copyAyah,
  } = useActions(() =>
    `${ayah.arabic}\n\n${ayah.urdu}\n\n"${ayah.english}"\n\n— Quran ${ayah.surah}:${ayah.ayah} (${ayah.surahName})\n\nShared from Rah-e-Safia · راہِ صافیہ`
  );

  const {
    state: hadithActionState, share: shareHadith, copy: copyHadith,
  } = useActions(() =>
    `${hadith.arabic}\n\n"${hadith.english}"\n\nNarrated by: ${hadith.narrator}\n— ${hadith.reference}\n\nShared from Rah-e-Safia · راہِ صافیہ`
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-8"
    >
      {/* Section label */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Daily Inspiration</h2>
          <p className="text-xs text-muted-foreground mt-0.5">A new Ayah and Hadith every day</p>
        </div>
        <div className="font-arabic text-muted-foreground text-sm" dir="rtl">وَحْيٌ يَوْمِيٌّ</div>
      </div>

      {/* Hero card */}
      <div
        className="relative w-full overflow-hidden rounded-3xl shadow-2xl"
        style={{ background: "linear-gradient(160deg, #1c4a31 0%, #0e2d1f 40%, #081a12 100%)" }}
      >
        {/* Islamic pattern */}
        <div className="absolute inset-0 islamic-pattern opacity-30 pointer-events-none" aria-hidden="true" />

        {/* Top-right radial glow */}
        <div
          className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        {/* Bottom-left radial glow */}
        <div
          className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        {/* Centre vignette for text legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.25) 100%)" }}
          aria-hidden="true"
        />

        {/* Tab switcher */}
        <div className="relative flex items-center justify-center pt-6 px-6 gap-2">
          {(["ayah", "hadith"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                tab === t
                  ? "text-amber-200"
                  : "text-white/40 hover:text-white/65"
              }`}
            >
              {tab === t && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-amber-400/20 border border-amber-400/40"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              {t === "ayah"
                ? <><BookOpen className="w-3 h-3 relative" strokeWidth={2} /><span className="relative">Daily Ayah</span></>
                : <><MessageSquare className="w-3 h-3 relative" strokeWidth={2} /><span className="relative">Daily Hadith</span></>
              }
            </button>
          ))}
        </div>

        {/* Content area — fixed min-height so card stays tall */}
        <div className="relative min-h-[400px] sm:min-h-[460px] flex flex-col justify-center">
          {tab === "ayah" ? (
            <AyahHero active={tab === "ayah"} />
          ) : (
            <HadithHero active={tab === "hadith"} />
          )}
        </div>

        {/* Action bar */}
        <div className="relative border-t border-white/10">
          {tab === "ayah" ? (
            <ActionBar
              onShare={shareAyah}
              onCopy={copyAyah}
              onSave={toggleAyahSave}
              actionState={ayahActionState}
              saved={ayahSaved}
            />
          ) : (
            <ActionBar
              onShare={shareHadith}
              onCopy={copyHadith}
              onSave={toggleHadithSave}
              actionState={hadithActionState}
              saved={hadithSaved}
            />
          )}
        </div>
      </div>
    </motion.section>
  );
}
