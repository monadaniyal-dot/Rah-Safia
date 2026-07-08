import { useState, useCallback, useEffect, useMemo, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2, Copy, Bookmark, BookmarkCheck, Check,
  BookOpen, MessageSquare, HandHeart, WifiOff, RefreshCw,
} from "lucide-react";
import { getDailyAyah, getDailyHadith, type DailyAyah, type DailyHadith } from "@/lib/daily-inspiration";
import { getDailyDua, type DailyDua } from "@/lib/daily-dua";
import { useDuaBookmarks } from "@/lib/dua-bookmarks";

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

  // Re-sync when key changes (e.g. "" → real key after a retry cycle).
  useEffect(() => {
    setSaved(loadSaved().has(key));
  }, [key]);

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

// ─── Action utilities ─────────────────────────────────────────────────────────

type ActionState = "idle" | "copied" | "shared";

function useActions(getText: () => string) {
  const [state, setState] = useState<ActionState>("idle");

  // Keep a ref so share/copy always use the latest getText without needing to
  // recreate the callbacks (avoids ActionBar re-renders on every content change).
  const getTextRef = useRef(getText);
  useEffect(() => { getTextRef.current = getText; });

  const share = useCallback(async () => {
    const text = getTextRef.current();
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(text);
      setState("shared");
      setTimeout(() => setState("idle"), 2000);
    } catch { /* blocked */ }
  }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getTextRef.current());
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch { /* blocked */ }
  }, []);

  return { state, share, copy };
}

// ─── Action bar ───────────────────────────────────────────────────────────────
// Memoized: only re-renders when actionState or saved changes (user interaction).

const ActionBar = memo(function ActionBar({
  onShare, onCopy, onSave, actionState, saved,
}: {
  onShare: () => void;
  onCopy: () => void;
  onSave: () => void;
  actionState: ActionState;
  saved: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-3 px-6 pb-7">
      <button
        onClick={onShare}
        aria-label="Share"
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/18 active:scale-95 transition-all text-white/80 text-xs font-semibold"
      >
        <Share2 className="w-3.5 h-3.5" strokeWidth={2} />
        Share
      </button>
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
});

// ─── Compact action bar (for the Dua card) ────────────────────────────────────
// Memoized: only re-renders when actionState or saved changes (user interaction).

const CompactActionBar = memo(function CompactActionBar({
  onShare, onCopy, onSave, actionState, saved,
}: {
  onShare: () => void;
  onCopy: () => void;
  onSave: () => void;
  actionState: ActionState;
  saved: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-2.5 px-5 pb-5">
      <button
        onClick={onShare}
        aria-label="Share"
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/18 active:scale-95 transition-all text-white/75 text-[11px] font-semibold"
      >
        <Share2 className="w-3 h-3" strokeWidth={2} />
        Share
      </button>
      <button
        onClick={onCopy}
        aria-label="Copy"
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/18 active:scale-95 transition-all text-white/75 text-[11px] font-semibold"
      >
        {actionState === "copied"
          ? <Check className="w-3 h-3 text-green-400" strokeWidth={2.5} />
          : <Copy className="w-3 h-3" strokeWidth={2} />}
        {actionState === "copied" ? "Copied!" : "Copy"}
      </button>
      <button
        onClick={onSave}
        aria-label={saved ? "Unbookmark" : "Bookmark"}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border active:scale-95 transition-all text-[11px] font-semibold ${
          saved
            ? "bg-amber-400/25 border-amber-400/50 text-amber-300"
            : "bg-white/10 border-white/20 hover:bg-white/18 text-white/75"
        }`}
      >
        {saved
          ? <BookmarkCheck className="w-3 h-3" strokeWidth={2} />
          : <Bookmark className="w-3 h-3" strokeWidth={2} />}
        {saved ? "Saved" : "Bookmark"}
      </button>
    </div>
  );
});

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = "ayah" | "hadith";

// ─── Ayah hero ────────────────────────────────────────────────────────────────
// Receives pre-computed data as a prop (parent calls getDailyAyah once).
// Memoized: only re-renders when active changes (tab switch).

const AyahHero = memo(function AyahHero({ active, ayah }: { active: boolean; ayah: DailyAyah }) {
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
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/25">
            <BookOpen className="w-3 h-3 text-amber-300 shrink-0" strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-300/90">
              {ayah.surahName} · {ayah.surah}:{ayah.ayah}
            </span>
          </div>
          <p
            className="font-arabic text-white leading-[1.9] w-full"
            dir="rtl"
            style={{ fontSize: "clamp(1.7rem, 5.5vw, 2.9rem)", fontWeight: 700, textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}
          >
            {ayah.arabic}
          </p>
          <div className="flex items-center gap-3 w-full max-w-xs">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
            <span className="text-amber-400/70 text-base">✦</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
          </div>
          <p
            className="font-arabic text-amber-100/90 leading-relaxed w-full"
            dir="rtl"
            style={{ fontSize: "clamp(1rem, 3vw, 1.3rem)" }}
          >
            {ayah.urdu}
          </p>
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
});

// ─── Hadith hero ──────────────────────────────────────────────────────────────
// Receives pre-computed data as a prop (parent calls getDailyHadith once).
// Memoized: only re-renders when active changes (tab switch).

const HadithHero = memo(function HadithHero({ active, hadith }: { active: boolean; hadith: DailyHadith }) {
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
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/25">
            <MessageSquare className="w-3 h-3 text-amber-300 shrink-0" strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-300/90">
              {hadith.reference}
            </span>
          </div>
          <p
            className="font-arabic text-white leading-[1.9] w-full"
            dir="rtl"
            style={{ fontSize: "clamp(1.5rem, 5vw, 2.6rem)", fontWeight: 700, textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}
          >
            {hadith.arabic}
          </p>
          <div className="flex items-center gap-3 w-full max-w-xs">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
            <span className="text-amber-400/70 text-base">✦</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
          </div>
          <p
            className="text-white/85 leading-relaxed max-w-lg font-medium"
            style={{ fontSize: "clamp(0.95rem, 2.8vw, 1.15rem)" }}
          >
            "{hadith.english}"
          </p>
          <p className="text-white/45 text-xs tracking-wide">
            Narrated by{" "}
            <span className="text-white/65 font-semibold">{hadith.narrator}</span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// ─── Daily Dua card ───────────────────────────────────────────────────────────
// Memoized: receives stable dua data (computed once per day in parent via useMemo).
// Only re-renders when the user bookmarks or copies.

const DuaCard = memo(function DuaCard({ dua }: { dua: DailyDua }) {
  const { isDuaBookmarked, toggleDuaBookmark } = useDuaBookmarks();
  const bookmarked = isDuaBookmarked(dua.id);

  const getText = useCallback(
    () => `${dua.arabic}\n\n${dua.transliteration}\n\n"${dua.english}"\n\n— ${dua.source}\n\nShared from Quran Al-Falah · قرآن الفلاح`,
    [dua]
  );

  const { state, share, copy } = useActions(getText);

  const handleBookmark = useCallback(() => {
    toggleDuaBookmark({
      id: dua.id,
      arabic: dua.arabic,
      transliteration: dua.transliteration,
      english: dua.english,
      source: dua.source,
    });
  }, [dua, toggleDuaBookmark]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
      className="relative w-full overflow-hidden rounded-3xl shadow-xl"
      style={{ background: "linear-gradient(160deg, #192e22 0%, #0c2018 50%, #070f0d 100%)" }}
    >
      {/* Islamic pattern overlay */}
      <div className="absolute inset-0 islamic-pattern opacity-20 pointer-events-none" aria-hidden="true" />

      {/* Top-left glow */}
      <div
        className="absolute -top-10 -left-10 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      {/* Bottom-right glow */}
      <div
        className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Header — source badge */}
      <div className="relative flex flex-col items-center text-center px-6 sm:px-10 pt-6 gap-5">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/12 border border-amber-400/22">
          <HandHeart className="w-3 h-3 text-amber-300/90 shrink-0" strokeWidth={2} />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-300/80">
            {dua.source}
          </span>
        </div>

        {/* Arabic */}
        <p
          className="font-arabic text-white leading-[1.95] w-full"
          dir="rtl"
          style={{
            fontSize: "clamp(1.35rem, 4.5vw, 1.9rem)",
            fontWeight: 700,
            textShadow: "0 2px 16px rgba(0,0,0,0.45)",
          }}
        >
          {dua.arabic}
        </p>

        {/* Transliteration */}
        <p
          className="text-white/50 italic leading-relaxed max-w-lg"
          style={{ fontSize: "clamp(0.75rem, 2vw, 0.88rem)" }}
        >
          {dua.transliteration}
        </p>

        {/* Gold divider */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
          <span className="text-amber-400/55 text-sm">✦</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        </div>

        {/* English */}
        <p
          className="text-white/78 leading-relaxed max-w-lg pb-1"
          style={{ fontSize: "clamp(0.85rem, 2.4vw, 1rem)" }}
        >
          "{dua.english}"
        </p>
      </div>

      {/* Compact action bar */}
      <div className="relative mt-4 border-t border-white/8 pt-1">
        <CompactActionBar
          onShare={share}
          onCopy={copy}
          onSave={handleBookmark}
          actionState={state}
          saved={bookmarked}
        />
      </div>
    </motion.div>
  );
});

// ─── Content unavailable fallback ─────────────────────────────────────────────
// Shown when daily content data fails to load (e.g. storage error, bad state).

function DailyContentUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      {/* Section label */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Daily Inspiration</h2>
          <p className="text-xs text-muted-foreground mt-0.5">A new Ayah, Hadith, and Dua every day</p>
        </div>
        <div className="font-arabic text-muted-foreground text-sm" dir="rtl">وَحْيٌ يَوْمِيٌّ</div>
      </div>

      {/* Error card — matches the hero card's rounded/shadow style */}
      <div
        className="relative w-full overflow-hidden rounded-3xl shadow-xl flex flex-col items-center justify-center gap-5 py-16 text-center px-8"
        style={{ background: "linear-gradient(160deg, #1c4a31 0%, #0e2d1f 40%, #081a12 100%)" }}
      >
        <div className="absolute inset-0 islamic-pattern opacity-20 pointer-events-none" aria-hidden="true" />

        <div className="relative w-14 h-14 rounded-2xl bg-white/8 border border-white/15 flex items-center justify-center">
          <WifiOff className="w-6 h-6 text-white/40" strokeWidth={1.5} />
        </div>

        <div className="relative space-y-2">
          <p className="font-arabic text-amber-300/60 text-base" dir="rtl">لا يتوفر المحتوى</p>
          <p className="text-white/80 font-semibold text-sm">Daily content unavailable</p>
          <p className="text-white/45 text-xs max-w-[240px] leading-relaxed">
            Today's inspiration could not be loaded. Please try again in a moment.
          </p>
        </div>

        <button
          onClick={onRetry}
          className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition-colors text-white/80 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
          Try again
        </button>
      </div>
    </motion.section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DailyInspiration() {
  const [tab, setTab] = useState<Tab>("ayah");
  const [retryKey, setRetryKey] = useState(0);

  // getDailyAyah / getDailyHadith / getDailyDua are deterministic (stable within a day).
  // Wrapped in try-catch so any storage/data error shows the fallback instead of crashing.
  // Memoizing with [retryKey] re-evaluates only when the user taps "Try again".
  const ayah   = useMemo(() => { try { return getDailyAyah();   } catch { return null; } }, [retryKey]);  // eslint-disable-line react-hooks/exhaustive-deps
  const hadith = useMemo(() => { try { return getDailyHadith(); } catch { return null; } }, [retryKey]);  // eslint-disable-line react-hooks/exhaustive-deps
  const dua    = useMemo(() => { try { return getDailyDua();    } catch { return null; } }, [retryKey]);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = useCallback(() => setRetryKey((k) => k + 1), []);

  // Keys computed unconditionally — empty string when data is null (safe: useSaved
  // just reads localStorage and returns false for an empty key).
  const ayahKey   = ayah   ? `ayah-${ayah.surah}-${ayah.ayah}` : "";
  const hadithKey = hadith ? `hadith-${hadith.reference}`       : "";

  // All hooks must be called unconditionally — before any early return.
  const { saved: ayahSaved,   toggle: toggleAyahSave   } = useSaved(ayahKey);
  const { saved: hadithSaved, toggle: toggleHadithSave } = useSaved(hadithKey);

  // Stable text getters for the action bars — useCallback so useActions' share/copy
  // are created once and don't force ActionBar re-renders through new references.
  const getAyahText = useCallback(
    () => ayah ? `${ayah.arabic}\n\n${ayah.urdu}\n\n"${ayah.english}"\n\n— Quran ${ayah.surah}:${ayah.ayah} (${ayah.surahName})\n\nShared from Quran Al-Falah · قرآن الفلاح` : "",
    [ayah]
  );
  const getHadithText = useCallback(
    () => hadith ? `${hadith.arabic}\n\n"${hadith.english}"\n\nNarrated by: ${hadith.narrator}\n— ${hadith.reference}\n\nShared from Quran Al-Falah · قرآن الفلاح` : "",
    [hadith]
  );

  const { state: ayahActionState,   share: shareAyah,   copy: copyAyah   } = useActions(getAyahText);
  const { state: hadithActionState, share: shareHadith, copy: copyHadith } = useActions(getHadithText);

  // Show the unavailable state if any piece of content failed to load.
  // This return is now AFTER all hooks — Rules of Hooks compliant.
  if (!ayah || !hadith || !dua) {
    return <DailyContentUnavailable onRetry={handleRetry} />;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-8"
    >
      {/* ── Section label ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Daily Inspiration</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            A new Ayah, Hadith, and Dua every day
          </p>
        </div>
        <div className="font-arabic text-muted-foreground text-sm" dir="rtl">وَحْيٌ يَوْمِيٌّ</div>
      </div>

      {/* ── Ayah / Hadith hero card ── */}
      <div
        className="relative w-full overflow-hidden rounded-3xl shadow-2xl"
        style={{ background: "linear-gradient(160deg, #1c4a31 0%, #0e2d1f 40%, #081a12 100%)" }}
      >
        <div className="absolute inset-0 islamic-pattern opacity-30 pointer-events-none" aria-hidden="true" />
        <div
          className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)" }}
          aria-hidden="true"
        />
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
                tab === t ? "text-amber-200" : "text-white/40 hover:text-white/65"
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

        {/* Content — heroes receive data as props (no redundant getDailyX() calls inside) */}
        <div className="relative min-h-[400px] sm:min-h-[460px] flex flex-col justify-center">
          {tab === "ayah"
            ? <AyahHero active={tab === "ayah"} ayah={ayah} />
            : <HadithHero active={tab === "hadith"} hadith={hadith} />
          }
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

      {/* ── Visual separator: Daily Dua ── */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.18em]">
            Daily Dua
          </span>
          <span className="font-arabic text-[11px] text-muted-foreground/55" dir="rtl">
            الدعاء اليومي
          </span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* ── Daily Dua card — receives stable dua object (memoized above) ── */}
      <DuaCard dua={dua} />
    </motion.section>
  );
}
