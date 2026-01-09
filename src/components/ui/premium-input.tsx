import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface PremiumInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
}

const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
            {icon}
          </div>
        )}
        <motion.div
          animate={
            error
              ? { x: [0, -10, 10, -10, 10, 0] }
              : isFocused
              ? { scale: 1.01 }
              : { scale: 1 }
          }
          transition={
            error
              ? { duration: 0.4, ease: "easeInOut" }
              : { type: "spring", stiffness: 400, damping: 25 }
          }
        >
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "transition-all duration-200",
              // Premium enhancements
              "focus-visible:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]",
              "hover:border-primary/50",
              icon && "pl-10",
              error && "border-destructive focus-visible:ring-destructive/50 animate-shake",
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </motion.div>
        {/* Focus glow ring */}
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isFocused ? 1 : 0,
            boxShadow: isFocused
              ? "0 0 0 3px hsl(var(--primary) / 0.15), 0 0 20px hsl(var(--primary) / 0.1)"
              : "none",
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
    );
  }
);
PremiumInput.displayName = "PremiumInput";

// Premium Textarea with same effects
export interface PremiumTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const PremiumTextarea = React.forwardRef<HTMLTextAreaElement, PremiumTextareaProps>(
  ({ className, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className="relative">
        <motion.div
          animate={
            error
              ? { x: [0, -10, 10, -10, 10, 0] }
              : isFocused
              ? { scale: 1.005 }
              : { scale: 1 }
          }
          transition={
            error
              ? { duration: 0.4, ease: "easeInOut" }
              : { type: "spring", stiffness: 400, damping: 25 }
          }
        >
          <textarea
            className={cn(
              "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "transition-all duration-200",
              "focus-visible:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]",
              "hover:border-primary/50",
              error && "border-destructive focus-visible:ring-destructive/50 animate-shake",
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isFocused ? 1 : 0,
            boxShadow: isFocused
              ? "0 0 0 3px hsl(var(--primary) / 0.15), 0 0 20px hsl(var(--primary) / 0.1)"
              : "none",
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
    );
  }
);
PremiumTextarea.displayName = "PremiumTextarea";

export { PremiumInput, PremiumTextarea };
