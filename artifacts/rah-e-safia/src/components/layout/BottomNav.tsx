import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/constants";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAppLanguage } from "@/lib/i18n";

const PRIMARY_IDS = ["home", "prayer", "quran", "hadith"];
const primaryItems = navItems.filter((n) => PRIMARY_IDS.includes(n.id));
const moreItems = navItems.filter((n) => !PRIMARY_IDS.includes(n.id));

export default function BottomNav() {
  const [location, navigate] = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const lang = useAppLanguage();
  const isArabic = lang === "ar";

  const isMoreActive = moreItems.some((n) => n.path === location);

  function handleNavClick(path: string) {
    setMoreOpen(false);
    navigate(path);
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* More drawer — slides up from above the bottom nav */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            key="more-drawer"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className={cn(
              "lg:hidden fixed left-3 right-3 z-50 rounded-2xl",
              "bg-card border border-border shadow-2xl overflow-hidden",
            )}
            style={{
              bottom: `calc(env(safe-area-inset-bottom) + 4.5rem)`,
            }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
              <div>
                <p className="text-sm font-semibold text-foreground">More</p>
                <p className="text-xs text-muted-foreground">All features</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Appearance</span>
                  <ThemeToggle compact />
                </div>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Drawer nav items — 2-column grid */}
            <div className="p-3 grid grid-cols-2 gap-2">
              {moreItems.map((item, i) => {
                const Icon = item.icon;
                const isActive = location === item.path;

                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleNavClick(item.path)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl text-left",
                      "transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary/60 text-foreground hover:bg-secondary"
                    )}
                  >
                    <span
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                        isActive ? "bg-white/20" : "bg-background/80"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4.5 h-4.5",
                          isActive ? "text-primary-foreground" : "text-primary"
                        )}
                        strokeWidth={1.8}
                      />
                    </span>
                    <div className="min-w-0">
                      <span
                        className={cn(
                          "text-sm font-medium block leading-tight",
                          isActive ? "text-primary-foreground" : "text-foreground",
                          isArabic && "font-arabic"
                        )}
                      >
                        {isArabic ? item.arabicLabel : item.label}
                      </span>
                      {!isArabic && (
                        <span
                          className={cn(
                            "font-arabic text-[11px] block leading-tight mt-0.5",
                            isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}
                          dir="rtl"
                        >
                          {item.arabicLabel}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom navigation bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch justify-around h-16">
          {/* Primary items */}
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setMoreOpen(false);
                  navigate(item.path);
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2",
                  "flex-1 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={item.label}
              >
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-bg"
                      className="absolute -inset-2 rounded-xl bg-primary/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "relative w-5 h-5 transition-all duration-200",
                      isActive ? "scale-110" : "scale-100"
                    )}
                    strokeWidth={isActive ? 2.2 : 1.6}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-none transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground",
                    isArabic && "font-arabic"
                  )}
                >
                  {isArabic
                    ? item.arabicLabel.split(" ")[0]
                    : (item.id === "home" ? "Home" : item.label.split(" ")[0])}
                </span>
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen((o) => !o)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2",
              "flex-1 transition-colors duration-200",
              (moreOpen || isMoreActive) ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="More"
            aria-expanded={moreOpen}
          >
            <div className="relative">
              {(moreOpen || isMoreActive) && (
                <motion.div
                  layoutId="bottom-nav-bg"
                  className="absolute -inset-2 rounded-xl bg-primary/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                />
              )}
              <div className="relative">
                {/* Dot indicator when a "more" route is active but drawer is closed */}
                {isMoreActive && !moreOpen && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
                <MoreHorizontal
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    (moreOpen || isMoreActive) ? "scale-110" : "scale-100"
                  )}
                  strokeWidth={(moreOpen || isMoreActive) ? 2.2 : 1.6}
                />
              </div>
            </div>
            <span
              className={cn(
                "text-[10px] font-medium leading-none transition-colors duration-200",
                (moreOpen || isMoreActive) ? "text-primary" : "text-muted-foreground"
              )}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
