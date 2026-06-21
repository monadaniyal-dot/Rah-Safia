import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Content */}
        <div className="flex-1 pb-20 lg:pb-0 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  );
}
