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
        {/* Icon container */}
        <div
          className={cn(
            "shrink-0 w-14 h-14 rounded-xl flex items-center justify-center",
            "bg-white/15 backdrop-blur-sm border border-white/20",
            "group-hover:bg-white/20 transition-colors duration-300"
          )}
        >
          <Icon className="w-7 h-7 text-white" strokeWidth={1.6} />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <p
            className="font-arabic text-base text-white/80 leading-none mb-1 text-right"
            dir="rtl"
          >
            {card.arabicTitle}
          </p>
          <h3 className="text-lg font-semibold text-white leading-tight">
            {card.title}
          </h3>
          <p className="text-sm text-white/70 mt-0.5 leading-snug line-clamp-2">
            {card.description}
          </p>
        </div>

        {/* Arrow */}
        <ChevronRight
          className="shrink-0 w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-200"
          strokeWidth={2}
        />
      </div>
    </motion.button>
  );
}
