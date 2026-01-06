import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  isLive?: boolean;
  showPulse?: boolean;
  className?: string;
  label?: string;
}

export const LiveIndicator = ({ 
  isLive = true, 
  showPulse = true, 
  className,
  label = "Live"
}: LiveIndicatorProps) => {
  if (!isLive) return null;
  
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="relative flex h-2 w-2">
        {showPulse && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        )}
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="text-xs font-medium text-green-600 dark:text-green-400">
        {label}
      </span>
    </div>
  );
};
