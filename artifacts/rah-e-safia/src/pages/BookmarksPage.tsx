import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Trash2, ExternalLink, BookOpen } from "lucide-react";
import { useBookmarks } from "@/lib/bookmarks";
import { cn } from "@/lib/utils";

export default function BookmarksPage() {
  const [, navigate] = useLocation();
  const { bookmarks, removeBookmark } = useBookmarks();

  const sorted = [...bookmarks].sort((a, b) => b.timestamp - a.timestamp);

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
            <p className="text-xs text-muted-foreground leading-tight">
              {sorted.length === 0
                ? "No ayahs saved yet"
                : `${sorted.length} saved ayah${sorted.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <p className="font-arabic text-base text-muted-foreground shrink-0" dir="rtl">
            المحفوظات
          </p>
        </div>
      </header>

      <div className="flex-1 px-4 lg:px-8 py-6 max-w-2xl mx-auto w-full">

        {/* ── Empty state ── */}
        {sorted.length === 0 && (
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
                Tap the bookmark icon on any ayah while reading to save it here.
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

        {/* ── Bookmark list ── */}
        {sorted.length > 0 && (
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
                      {/* Ayah badge */}
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
                    {/* Arabic name */}
                    <p
                      className="font-arabic text-base text-primary/70 shrink-0 ml-2"
                      dir="rtl"
                    >
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
                  <div
                    className={cn(
                      "flex items-center gap-2 px-4 pb-4"
                    )}
                  >
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

            {/* Footer hint */}
            <p className="text-center text-xs text-muted-foreground/60 pt-2 pb-4">
              Tap the trash icon to remove a bookmark
            </p>
          </div>
        )}

        <div className="h-10" />
      </div>
    </div>
  );
}
