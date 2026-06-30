import { cn } from "@/lib/utils";

export default function SoundBars({ className }: { className?: string }) {
  return (
    <span
      aria-label="Playing"
      className={cn("inline-flex items-end gap-[2px] h-3.5", className)}
    >
      <span className="w-[2px] rounded-full bg-current soundbar-1" style={{ height: "55%" }} />
      <span className="w-[2px] rounded-full bg-current soundbar-2" style={{ height: "100%" }} />
      <span className="w-[2px] rounded-full bg-current soundbar-3" style={{ height: "40%" }} />
    </span>
  );
}
