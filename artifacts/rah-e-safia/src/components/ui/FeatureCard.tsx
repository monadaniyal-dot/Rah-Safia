import { memo, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FeatureCard as FeatureCardType } from "@/lib/constants";

interface FeatureCardProps {
  card: FeatureCardType;
  index: number;
  onClick?: () => void;
  /** Optional badge rendered below the description — used for the Prayer Times countdown. */
  badge?: ReactNode;
}

// Wrapped in React.memo so cards only re-render when their own props change.
// With stable onClick references (created once in HomePage via useMemo) and
// stable badge nodes (memoized in HomePage), only the prayer card re-renders
// when the countdown ticks — the other four cards are completely skipped.
const FeatureCard = memo(function FeatureCard({ card, index, onClick, badge }: FeatureCardProps) {
  const Icon = card.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{
        y: -2,
        transition: { type: "spring", stiffness: 380, damping: 28 },
      }}
      whileTap={{
        scale: 0.965,
        transition: { duration: 0.1, ease: "easeIn" },
      }}
      onClick={onClick}
      className={cn(
        "group relative w-full text-left rounded-2xl overflow-hidden",
        "bg-gradient-to-br text-white",
        "shadow-[0_2px_12px_rgba(0,0,0,0.18)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.28)]",
        "transition-shadow duration-300 cursor-pointer",
        card.colorClass
      )}
    >
      {/* Islamic geometric pattern overlay */}
      <div className="absolute inset-0 islamic-pattern opacity-100" aria-hidden="true" />

      {/* Shine sweep on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 55%)" }}
        aria-hidden="true"
      />

      <div className="relative px-5 py-4 flex items-center gap-4">

        {/* ── Icon container ──────────────────────────────────────── */}
        <div
          className={cn(
            "shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center",
            "bg-white/15 border border-white/20",
            "group-hover:bg-white/22 transition-colors duration-200"
          )}
        >
          <Icon className="w-[1.65rem] h-[1.65rem] text-white" strokeWidth={2} aria-hidden="true" />
        </div>

        {/* ── Text block ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Arabic title */}
          <p
            className="font-arabic font-bold text-white text-right truncate"
            dir="rtl"
            style={{ fontSize: "1.2rem", lineHeight: 1.75 }}
          >
            {card.arabicTitle}
          </p>

          {/* English title */}
          <h3 className="font-bold text-white leading-tight -mt-0.5" style={{ fontSize: "1.2rem" }}>
            {card.title}
          </h3>

          {/* Description */}
          <p className="text-white/52 leading-snug line-clamp-2 mt-1.5" style={{ fontSize: "0.78rem" }}>
            {card.description}
          </p>

          {/* Optional badge slot — prayer countdown */}
          {badge && <div className="mt-1.5">{badge}</div>}
        </div>

        {/* ── Chevron ─────────────────────────────────────────────── */}
        <ChevronRight
          className={cn(
            "shrink-0 w-[1.1rem] h-[1.1rem] text-white/55",
            "group-hover:text-white group-hover:translate-x-1 group-hover:scale-110",
            "transition-all duration-200"
          )}
          strokeWidth={2.5}
        />
      </div>
    </motion.button>
  );
});

export default FeatureCard;
