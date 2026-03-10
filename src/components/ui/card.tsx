import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl border text-card-foreground transition-all duration-300 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-card shadow-sm hover:shadow-md",
        glass: "glass hover:shadow-futuristic",
        glassDark: "glass-dark hover:shadow-futuristic",
        neon: "neon-border bg-card shadow-sm hover:shadow-lg",
        neonAccent: "neon-border-accent bg-card shadow-sm hover:shadow-lg",
        elevated: "bg-card shadow-futuristic hover:shadow-lg hover:-translate-y-1",
        flat: "bg-card border-border/50",
        interactive: "bg-card shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-primary/30",
      },
      glow: {
        none: "",
        primary: "hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]",
        accent: "hover:shadow-[0_0_30px_hsl(var(--accent)/0.2)]",
        success: "hover:shadow-[0_0_30px_hsl(var(--success)/0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
      glow: "none",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  enableHoverGlow?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, glow, enableHoverGlow = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, glow, className }))}
      {...props}
    >
      {/* Hover glow border effect */}
      {enableHoverGlow && (
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-sm" />
        </div>
      )}
      {/* Shine effect on hover */}
      <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
        <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
      </div>
      {props.children}
    </div>
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6 relative z-10", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0 relative z-10", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0 relative z-10", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
