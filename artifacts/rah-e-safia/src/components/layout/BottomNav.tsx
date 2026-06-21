import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/constants";

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-2 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-xl min-w-0",
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
                  "text-[10px] font-medium leading-none truncate max-w-full transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.id === "home" ? "Home" : item.label.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
