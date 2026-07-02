import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import MiniPlayer from "@/components/quran/MiniPlayer";
import FullPlayer from "@/components/quran/FullPlayer";
import { useQuranPlayer } from "@/context/QuranPlayerContext";

interface AppShellProps {
  children: ReactNode;
}

function AppShellInner({ children }: AppShellProps) {
  const [location] = useLocation();
  const { state } = useQuranPlayer();
  const playerActive = state.surahNumber !== null;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        <div
          className={
            playerActive
              ? "flex-1 pb-[176px] lg:pb-[76px] overflow-y-auto"
              : "flex-1 pb-20 lg:pb-0 overflow-y-auto"
          }
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <BottomNav />
      <MiniPlayer />
      <FullPlayer />
    </div>
  );
}

export default function AppShell({ children }: AppShellProps) {
  return <AppShellInner>{children}</AppShellInner>;
}
