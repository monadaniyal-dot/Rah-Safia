import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/constants";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Heart } from "lucide-react";
import { useAppLanguage } from "@/lib/i18n";

export default function Sidebar() {
  const [location, navigate] = useLocation();
  const lang = useAppLanguage();
  const isArabic = lang === "ar";

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-border bg-card overflow-hidden">
      {/* Islamic pattern top strip */}
      <div className="h-1.5 w-full gradient-primary" />

      {/* Logo / App name */}
      <div className="px-6 pt-6 pb-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white text-xl shrink-0 shadow-sm">
            🌙
          </div>
          <div>
            <h1 className="font-semibold text-foreground text-base leading-tight">
              Rah-e-Safia
            </h1>
            <p className="font-arabic text-muted-foreground text-sm leading-tight" dir="rtl">
              راہِ صافیہ
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        <p className="px-3 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Features
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left",
                "transition-all duration-200 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/70 hover:bg-secondary hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200",
                  isActive
                    ? "bg-white/20"
                    : "bg-secondary group-hover:bg-accent"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-primary-foreground" : "text-foreground/60 group-hover:text-foreground"
                  )}
                  strokeWidth={1.8}
                />
              </span>
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "text-sm font-medium block leading-tight",
                  isActive ? "text-primary-foreground" : "",
                  isArabic && "font-arabic"
                )}>
                  {isArabic ? item.arabicLabel : item.label}
                </span>
                {!isArabic && (
                  <span
                    className={cn(
                      "font-arabic text-xs block leading-tight",
                      isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                    dir="rtl"
                  >
                    {item.arabicLabel}
                  </span>
                )}
              </div>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-dot"
                  className="w-1.5 h-1.5 rounded-full bg-primary-foreground/70 shrink-0"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Appearance</span>
          <ThemeToggle compact />
        </div>
        <div className="bg-gold-muted rounded-xl p-3 text-center">
          <p className="font-arabic text-gold text-sm mb-0.5" dir="rtl">
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Heart className="w-3 h-3 text-gold fill-gold" />
            In memory of Safia Bano
          </p>
        </div>
      </div>
    </aside>
  );
}
