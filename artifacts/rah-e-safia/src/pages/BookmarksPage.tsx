import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Trash2, ExternalLink, BookOpen, HandHeart } from "lucide-react";
import { useBookmarks } from "@/lib/bookmarks";
import { useDuaBookmarks } from "@/lib/dua-bookmarks";
import { cn } from "@/lib/utils";

export default function BookmarksPage() {
  const [, navigate] = useLocation();
  const { bookmarks, removeBookmark } = useBookmarks();
  const { duaBookmarks, removeDuaBookmark } = useDuaBookmarks();

  const sorted = [...bookmarks].sort((a, b) => b.timestamp - a.timestamp);
  const sortedDuas = [...duaBookmarks].sort((a, b) => b.timestamp - a.timestamp);

  const totalCount = sorted.length + sortedDuas.length;
  const hasAyahs = sorted.length > 0;
  const hasDuas = sortedDuas.length > 0;
  const hasAnything = totalCount > 0;

  const headerSubtitle = () => {
    if (totalCount === 0) return "Nothing saved yet";
    const parts: string[] = [];
    if (sorted.length > 0) parts.push(`${sorted.length} ayah${sorted.length === 1 ? "" : "s"}`);
    if (sortedDuas.length > 0) parts.push(`${sortedDuas.length} dua${sortedDuas.length === 1 ? "" : "s"}`);
    return parts.join(" · ");
  };

  return (
    <div className="min-h-full flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-4 lg:px-8 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm shrink-0">
            <Bookmark className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-foreground text-sm leading-tight">Bookmarks</h1>
            <p className="text-xs text-muted-foreground leading-tight">{headerSubtitle()}</p>
          </div>
          <p className="font-arabic text-base text-muted-foreground shrink-0" dir="rtl">
            المحفوظات
          </p>
        </div>
      </header>

      <div className="flex-1 px-4 lg:px-8 py-6 max-w-2xl mx-auto w-full">

        {/* ── Empty state ── */}
        {!hasAnything && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center justify-center gap-5 py-24 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-primary/8 border border-primary/12 flex items-center justify-center">
              <Bookmark className="w-9 h-9 text-primary/40" strokeWidth={1.4} />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1.5">No bookmarks yet</p>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Tap the bookmark icon on any ayah while reading, or bookmark the Daily Dua from the home screen.
              </p>
            </div>
            <button
              onClick={() => navigate("/quran")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
            >
              <BookOpen className="w-4 h-4" strokeWidth={2} />
              Open Qur'an
            </button>
          </motion.div>
        )}

        {/* ── Qur'an Ayahs section ── */}
        {hasAyahs && (
          <div className="mb-8">
            {/* Section heading — only shown when both categories have items */}
            {hasDuas && (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <BookOpen className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground leading-tight">Qur'an Ayahs</h2>
                  <p className="text-[11px] text-muted-foreground">{sorted.length} saved</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {sorted.map((bookmark, idx) => (
                  <motion.div
                    key={bookmark.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.22, delay: idx * 0.03 }}
                    layout
                    className="rounded-2xl border border-primary/12 bg-card shadow-sm"
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm shrink-0">
                          <span className="text-white text-xs font-bold">{bookmark.ayahNumber}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-tight truncate">
                            {bookmark.surahName}
                          </p>
                          <p className="text-xs text-muted-foreground leading-tight">
                            Surah {bookmark.surahNumber} · Ayah {bookmark.ayahNumber}
                          </p>
                        </div>
                      </div>
                      <p className="font-arabic text-base text-primary/70 shrink-0 ml-2" dir="rtl">
                        {bookmark.surahArabicName}
                      </p>
                    </div>

                    {/* Arabic preview */}
                    <div className="px-4 pb-3">
                      <p
                        className="font-arabic text-xl text-foreground leading-[2] text-right line-clamp-2"
                        dir="rtl"
                        lang="ar"
                      >
                        {bookmark.arabicText}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className={cn("flex items-center gap-2 px-4 pb-4")}>
                      <button
                        onClick={() => navigate(`/quran/${bookmark.surahNumber}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/8 hover:bg-primary/14 text-primary text-xs font-semibold transition-colors duration-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                        Open Surah
                      </button>
                      <button
                        onClick={() => removeBookmark(bookmark.id)}
                        className="w-9 h-9 rounded-xl bg-destructive/8 hover:bg-destructive/16 flex items-center justify-center transition-colors duration-200 shrink-0"
                        aria-label="Remove bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" strokeWidth={2} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ── Daily Duas section ── */}
        {hasDuas && (
          <div className="mb-6">
            {/* Section heading — only shown when both categories have items */}
            {hasAyahs && (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <HandHeart className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground leading-tight">Daily Duas</h2>
                  <p className="text-[11px] text-muted-foreground">{sortedDuas.length} saved</p>
                </div>
              </div>
            )}

            {/* Heading when duas are alone */}
            {!hasAyahs && (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <HandHeart className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground leading-tight">Daily Duas</h2>
                  <p className="text-[11px] text-muted-foreground">{sortedDuas.length} saved</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {sortedDuas.map((dua, idx) => (
                  <motion.div
                    key={dua.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.22, delay: idx * 0.03 }}
                    layout
                    className="rounded-2xl border border-primary/12 bg-card shadow-sm overflow-hidden"
                  >
                    {/* Amber accent line at top */}
                    <div className="h-0.5 bg-gradient-to-r from-amber-500/60 via-amber-400/40 to-transparent" />

                    {/* Source badge */}
                    <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
                        <HandHeart className="w-2.5 h-2.5 text-amber-500 shrink-0" strokeWidth={2} />
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                          {dua.source}
                        </span>
                      </div>
                    </div>

                    {/* Arabic text */}
                    <div className="px-4 pb-2">
                      <p
                        className="font-arabic text-xl text-foreground leading-[1.95] text-right line-clamp-3"
                        dir="rtl"
                        lang="ar"
                      >
                        {dua.arabic}
                      </p>
                    </div>

                    {/* Transliteration */}
                    <div className="px-4 pb-2">
                      <p className="text-xs text-muted-foreground italic leading-relaxed line-clamp-2">
                        {dua.transliteration}
                      </p>
                    </div>

                    {/* English */}
                    <div className="px-4 pb-3">
                      <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">
                        "{dua.english}"
                      </p>
                    </div>

                    {/* Remove action */}
                    <div className="flex items-center gap-2 px-4 pb-4">
                      <div className="flex-1" />
                      <button
                        onClick={() => removeDuaBookmark(dua.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive/8 hover:bg-destructive/16 text-destructive text-xs font-medium transition-colors duration-200"
                        aria-label="Remove dua bookmark"
                      >
                        <Trash2 className="w-3 h-3" strokeWidth={2} />
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Footer hint */}
        {hasAnything && (
          <p className="text-center text-xs text-muted-foreground/60 pt-2 pb-4">
            Tap the trash icon to remove a bookmark
          </p>
        )}

        <div className="h-10" />
      </div>
    </div>
  );
}
