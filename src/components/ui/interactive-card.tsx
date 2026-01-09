import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const interactiveCardVariants = cva(
  "rounded-xl border text-card-foreground transition-all duration-300 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-card shadow-sm",
        glass: "glass",
        glassDark: "glass-dark",
        neon: "neon-border bg-card shadow-sm",
        neonAccent: "neon-border-accent bg-card shadow-sm",
        elevated: "bg-card shadow-futuristic",
        flat: "bg-card border-border/50",
      },
      glow: {
        none: "",
        primary: "hover-glow-primary",
        accent: "hover-glow-accent",
        success: "hover-glow-success",
      },
      hoverEffect: {
        none: "",
        lift: "hover:-translate-y-2",
        scale: "hover:scale-[1.02]",
        tilt: "",
      },
    },
    defaultVariants: {
      variant: "default",
      glow: "none",
      hoverEffect: "lift",
    },
  }
);

export interface InteractiveCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof interactiveCardVariants> {
  enableShine?: boolean;
  enableTilt?: boolean;
}

const InteractiveCard = React.forwardRef<HTMLDivElement, InteractiveCardProps>(
  ({ className, variant, glow, hoverEffect, enableShine = true, enableTilt = false, children, ...props }, ref) => {
    const [mousePosition, setMousePosition] = React.useState({ x: 0.5, y: 0.5 });
    const [isHovered, setIsHovered] = React.useState(false);
    const cardRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || !enableTilt) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      setMousePosition({ x, y });
    };

    const glowShadow = glow === "primary" 
      ? "0 0 30px hsl(var(--primary) / 0.3)" 
      : glow === "accent"
      ? "0 0 30px hsl(var(--accent) / 0.3)"
      : glow === "success"
      ? "0 0 30px hsl(var(--success) / 0.3)"
      : "0 10px 40px rgba(0, 0, 0, 0.1)";

    const tiltStyle = enableTilt && isHovered ? {
      transform: `perspective(1000px) rotateX(${(mousePosition.y - 0.5) * -10}deg) rotateY(${(mousePosition.x - 0.5) * 10}deg)`,
    } : {};

    return (
      <motion.div
        ref={ref}
        className={cn(interactiveCardVariants({ variant, glow, hoverEffect, className }))}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setMousePosition({ x: 0.5, y: 0.5 });
        }}
        style={tiltStyle}
        whileHover={{ boxShadow: glowShadow }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Shine effect overlay */}
        {enableShine && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              background: isHovered
                ? `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, hsl(var(--primary) / 0.1) 0%, transparent 50%)`
                : "none",
            }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Border glow effect */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            boxShadow: isHovered ? "inset 0 0 0 1px hsl(var(--primary) / 0.3)" : "none",
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Content */}
        <div className="relative z-0">
          {children}
        </div>
      </motion.div>
    );
  }
);
InteractiveCard.displayName = "InteractiveCard";

// Sub-components matching original Card API
const InteractiveCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
InteractiveCardHeader.displayName = "InteractiveCardHeader";

const InteractiveCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
InteractiveCardTitle.displayName = "InteractiveCardTitle";

const InteractiveCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
InteractiveCardDescription.displayName = "InteractiveCardDescription";

const InteractiveCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
InteractiveCardContent.displayName = "InteractiveCardContent";

const InteractiveCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
InteractiveCardFooter.displayName = "InteractiveCardFooter";

export {
  InteractiveCard,
  InteractiveCardHeader,
  InteractiveCardTitle,
  InteractiveCardDescription,
  InteractiveCardContent,
  InteractiveCardFooter,
  interactiveCardVariants,
};
