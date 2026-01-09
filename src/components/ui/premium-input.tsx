import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface PremiumInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
  successIcon?: React.ReactNode;
  showSuccessState?: boolean;
}

const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ className, type, error, icon, successIcon, showSuccessState, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className="relative group">
        {/* Icon with animation */}
        <AnimatePresence mode="wait">
          {icon && (
            <motion.div 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
              initial={{ scale: 1 }}
              animate={{ 
                scale: isFocused ? 1.1 : 1,
                color: isFocused ? "hsl(var(--primary))" : undefined
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {showSuccessState && successIcon ? successIcon : icon}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          animate={
            error
              ? { x: [0, -8, 8, -8, 8, 0] }
              : {}
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
              "flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "transition-all duration-300 ease-out",
              // Premium glow effect
              "focus-visible:shadow-[0_0_0_4px_hsl(var(--primary)/0.1),0_0_20px_hsl(var(--primary)/0.15)]",
              "hover:border-primary/50 hover:shadow-sm",
              icon && "pl-11",
              error && "border-destructive focus-visible:ring-destructive/40 focus-visible:shadow-[0_0_0_4px_hsl(var(--destructive)/0.1)]",
              showSuccessState && "border-success focus-visible:ring-success/40",
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
            onChange={handleChange}
            {...props}
          />
        </motion.div>

        {/* Animated focus ring */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isFocused ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          style={{
            boxShadow: isFocused
              ? "0 0 0 3px hsl(var(--primary) / 0.1), inset 0 0 0 1px hsl(var(--primary) / 0.3)"
              : "none",
          }}
        />

        {/* Focus line animation */}
        <motion.div
          className="absolute bottom-0 left-1/2 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
          initial={{ width: 0, x: "-50%" }}
          animate={{
            width: isFocused ? "100%" : 0,
            x: "-50%",
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    );
  }
);
PremiumInput.displayName = "PremiumInput";

// Premium Textarea with enhanced effects
export interface PremiumTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const PremiumTextarea = React.forwardRef<HTMLTextAreaElement, PremiumTextareaProps>(
  ({ className, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [charCount, setCharCount] = React.useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    return (
      <div className="relative group">
        <motion.div
          animate={
            error
              ? { x: [0, -8, 8, -8, 8, 0] }
              : {}
          }
          transition={
            error
              ? { duration: 0.4, ease: "easeInOut" }
              : { type: "spring", stiffness: 400, damping: 25 }
          }
        >
          <textarea
            className={cn(
              "flex min-h-[100px] w-full rounded-xl border border-input bg-background px-4 py-3 text-base ring-offset-background",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "transition-all duration-300 ease-out resize-none",
              "focus-visible:shadow-[0_0_0_4px_hsl(var(--primary)/0.1),0_0_20px_hsl(var(--primary)/0.15)]",
              "hover:border-primary/50 hover:shadow-sm",
              error && "border-destructive focus-visible:ring-destructive/40",
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
            onChange={handleChange}
            {...props}
          />
        </motion.div>

        {/* Focus ring */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isFocused ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            boxShadow: isFocused
              ? "0 0 0 3px hsl(var(--primary) / 0.1), inset 0 0 0 1px hsl(var(--primary) / 0.3)"
              : "none",
          }}
        />

        {/* Character count indicator */}
        {props.maxLength && (
          <motion.div
            className="absolute bottom-2 right-3 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: isFocused ? 1 : 0 }}
          >
            {charCount}/{props.maxLength}
          </motion.div>
        )}
      </div>
    );
  }
);
PremiumTextarea.displayName = "PremiumTextarea";

export { PremiumInput, PremiumTextarea };
