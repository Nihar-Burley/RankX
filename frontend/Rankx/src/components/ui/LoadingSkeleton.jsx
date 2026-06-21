import { cn } from "../../lib/cn";

export default function LoadingSkeleton({ lines = 3, className, compact = false }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "animate-pulse rounded-full bg-white/8",
            compact ? "h-3" : "h-4",
            index === 0 ? "w-2/3" : index === lines - 1 ? "w-5/6" : "w-full"
          )}
        />
      ))}
    </div>
  );
}
