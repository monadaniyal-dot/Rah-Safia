import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FeatureCard as FeatureCardType } from "@/lib/constants";

interface FeatureCardProps {
  card: FeatureCardType;
  index: number;
  onClick?: () => void;
}

export default function FeatureCard({ card, index, onClick }: FeatureCardProps) {
  const Icon = card.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "group relative w-full text-left rounded-2xl overflow-hidden",
        "bg-gradient-to-br text-white shadow-md hover:shadow-xl",
        "transition-shadow duration-300 cursor-pointer",
        card.colorClass
      )}
    >
      {/* Islamic geometric pattern overlay */}
      <div
        className="absolute inset-0 islamic-pattern opacity-100"
        aria-hidden="true"
      />

      {/* Shine overlay on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="relative p-5 flex items-center gap-4">
        {/* Icon container — tighter padding so icon feels more prominent */}
        <div
          className={cn(
            "shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
            "bg-white/15 backdrop-blur-sm border border-white/20",
            "group-hover:bg-white/20 transition-colors duration-300"
          )}
        >
          <Icon className="w-8 h-8 text-white" strokeWidth={2} />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          {/* Arabic title — equal weight to English */}
          <p
            className="font-arabic font-semibold text-white/95 text-right leading-snug mb-0.5"
            dir="rtl"
            style={{ fontSize: "1.05rem" }}
          >
            {card.arabicTitle}
          </p>
          {/* English title — 15–20% larger, bold */}
          <h3 className="text-xl font-bold text-white leading-tight">
            {card.title}
          </h3>
          {/* Description — clearly secondary */}
          <p className="text-xs text-white/55 mt-1 leading-snug line-clamp-2">
            {card.description}
          </p>
        </div>

        {/* Arrow */}
        <ChevronRight
          className="shrink-0 w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-200"
          strokeWidth={2.5}
        />
      </div>
    </motion.button>
  );
}
