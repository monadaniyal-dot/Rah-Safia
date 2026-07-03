import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { SearchX, Home } from "lucide-react";

export default function NotFoundPage() {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-5 max-w-sm"
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-md">
          <SearchX className="w-7 h-7 text-white" strokeWidth={1.8} />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">Page Not Found</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This page doesn't exist or may have been moved.
          </p>
        </div>

        {/* Home button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
        >
          <Home className="w-4 h-4" strokeWidth={2} />
          Go to Home
        </button>
      </motion.div>
    </div>
  );
}
