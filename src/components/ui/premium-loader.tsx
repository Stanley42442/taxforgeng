import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PremiumLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const containerSizes = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-12",
};

export function PremiumLoader({ 
  size = "md", 
  text, 
  className,
  fullScreen = false 
}: PremiumLoaderProps) {
  const content = (
    <div className={cn(
      "glass-frosted rounded-2xl flex flex-col items-center justify-center gap-4 shadow-futuristic",
      containerSizes[size],
      className
    )}>
      {/* Outer glow ring */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
        <div className="relative">
          {/* Spinning gradient ring */}
          <div className={cn(
            "rounded-full border-2 border-transparent animate-spin",
            sizeClasses[size],
            "bg-gradient-to-r from-primary via-accent to-primary bg-clip-border"
          )} style={{
            background: `conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '3px',
          }} />
          {/* Inner spinning icon */}
          <Loader2 className={cn(
            "absolute inset-0 m-auto text-primary animate-spin",
            size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-8 w-8"
          )} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </div>
      
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
}

// Simple inline spinner for buttons
export function InlineLoader({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("h-4 w-4 animate-spin", className)} />
  );
}

// Page-level loader with skeleton effect
export function PageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <PremiumLoader size="lg" text={text} />
    </div>
  );
}

// Skeleton loader with shimmer
export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={cn(
      "glass-frosted rounded-xl overflow-hidden",
      className
    )}>
      <div className="animate-shimmer bg-gradient-to-r from-transparent via-primary/5 to-transparent bg-[length:200%_100%]">
        <div className="h-full w-full bg-muted/30" />
      </div>
    </div>
  );
}

// Dots loader for subtle loading indication
export function DotsLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

// Full page loading screen
export function FullPageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <PremiumLoader size="xl" text={text} className="mx-auto" />
      </div>
    </div>
  );
}
