import * as React from "react";
import { cn } from "@/lib/utils";

interface LiveIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  isLive?: boolean;
  showPulse?: boolean;
  label?: string;
}

const LiveIndicator = React.forwardRef<HTMLDivElement, LiveIndicatorProps>(
  ({ isLive = true, showPulse = true, className, label = "Live", ...props }, ref) => {
    if (!isLive) return null;
    
    return (
      <div ref={ref} className={cn("flex items-center gap-1.5", className)} {...props}>
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
  }
);
LiveIndicator.displayName = "LiveIndicator";

export { LiveIndicator };
