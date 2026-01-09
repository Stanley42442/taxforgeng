import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

// Confetti particle component
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  velocity: { x: number; y: number };
}

const CONFETTI_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "#FFD700",
  "#FF6B6B",
  "#4ECDC4",
  "#A855F7",
  "#F97316",
];

interface ConfettiExplosionProps {
  isActive: boolean;
  particleCount?: number;
  duration?: number;
  origin?: { x: number; y: number };
}

export const ConfettiExplosion = ({
  isActive,
  particleCount = 50,
  duration = 3000,
  origin = { x: 50, y: 50 },
}: ConfettiExplosionProps) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (isActive) {
      const newParticles: ConfettiParticle[] = Array.from({ length: particleCount }).map((_, i) => ({
        id: i,
        x: origin.x,
        y: origin.y,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        velocity: {
          x: (Math.random() - 0.5) * 20,
          y: -10 - Math.random() * 15,
        },
      }));
      setParticles(newParticles);

      const timeout = setTimeout(() => setParticles([]), duration);
      return () => clearTimeout(timeout);
    }
  }, [isActive, particleCount, duration, origin]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: `${particle.x}%`,
              y: `${particle.y}%`,
              scale: 0,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              x: `${particle.x + particle.velocity.x * 10}%`,
              y: `${particle.y + particle.velocity.y * -5 + 50}%`,
              scale: particle.scale,
              rotate: particle.rotation + 360,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: duration / 1000,
              ease: "easeOut",
            }}
            className="absolute w-3 h-3"
            style={{ backgroundColor: particle.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Success celebration component
interface SuccessCelebrationProps {
  isVisible: boolean;
  message?: string;
  description?: string;
  onComplete?: () => void;
  showConfetti?: boolean;
}

export const SuccessCelebration = ({
  isVisible,
  message = "Success!",
  description,
  onComplete,
  showConfetti = true,
}: SuccessCelebrationProps) => {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timeout = setTimeout(onComplete, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, onComplete]);

  return (
    <>
      {showConfetti && <ConfettiExplosion isActive={isVisible} />}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="glass-frosted rounded-3xl p-8 shadow-futuristic text-center max-w-sm mx-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="mx-auto mb-6 relative"
              >
                <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
                {/* Animated rings */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-success/30 mx-auto"
                  style={{ width: 80, height: 80, left: "50%", marginLeft: -40 }}
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1, repeat: 2, ease: "easeOut" }}
                />
              </motion.div>
              
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-foreground mb-2"
              >
                {message}
              </motion.h3>
              
              {description && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground"
                >
                  {description}
                </motion.p>
              )}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center gap-2 mt-4"
              >
                <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                <PartyPopper className="h-5 w-5 text-warning animate-bounce" />
                <Sparkles className="h-5 w-5 text-accent animate-pulse" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Error state component
interface ErrorFeedbackProps {
  isVisible: boolean;
  message?: string;
  description?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorFeedback = ({
  isVisible,
  message = "Something went wrong",
  description,
  onRetry,
  onDismiss,
}: ErrorFeedbackProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="glass-frosted rounded-xl p-6 border border-destructive/30 shadow-lg"
        >
          <motion.div
            initial={{ x: [0, -5, 5, -5, 5, 0] }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-start gap-4"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0"
            >
              <XCircle className="h-6 w-6 text-destructive" />
            </motion.div>
            
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">{message}</h4>
              {description && (
                <p className="text-sm text-muted-foreground mb-3">{description}</p>
              )}
              
              <div className="flex gap-2">
                {onRetry && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onRetry}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
                  >
                    Try Again
                  </motion.button>
                )}
                {onDismiss && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onDismiss}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                  >
                    Dismiss
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Warning feedback component
interface WarningFeedbackProps {
  isVisible: boolean;
  message?: string;
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const WarningFeedback = ({
  isVisible,
  message = "Are you sure?",
  description,
  onConfirm,
  onCancel,
}: WarningFeedbackProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-frosted rounded-xl p-6 border border-warning/30 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0"
            >
              <AlertTriangle className="h-6 w-6 text-warning" />
            </motion.div>
            
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">{message}</h4>
              {description && (
                <p className="text-sm text-muted-foreground mb-3">{description}</p>
              )}
              
              <div className="flex gap-2">
                {onConfirm && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onConfirm}
                    className="px-4 py-2 bg-warning text-warning-foreground rounded-lg text-sm font-medium hover:bg-warning/90 transition-colors"
                  >
                    Confirm
                  </motion.button>
                )}
                {onCancel && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCancel}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Form submission feedback hook
export type FormState = "idle" | "loading" | "success" | "error";

interface UseFormFeedbackOptions {
  successDuration?: number;
  errorDuration?: number;
  onSuccess?: () => void;
  onError?: () => void;
}

export const useFormFeedback = (options: UseFormFeedbackOptions = {}) => {
  const { successDuration = 3000, errorDuration = 5000, onSuccess, onError } = options;
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  const setSuccess = useCallback((msg = "Success!") => {
    setMessage(msg);
    setState("success");
    onSuccess?.();
    
    setTimeout(() => {
      setState("idle");
      setMessage("");
    }, successDuration);
  }, [successDuration, onSuccess]);

  const setError = useCallback((msg = "Something went wrong") => {
    setMessage(msg);
    setState("error");
    onError?.();
    
    setTimeout(() => {
      setState("idle");
      setMessage("");
    }, errorDuration);
  }, [errorDuration, onError]);

  const setLoading = useCallback(() => {
    setState("loading");
    setMessage("");
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setMessage("");
  }, []);

  return {
    state,
    message,
    isLoading: state === "loading",
    isSuccess: state === "success",
    isError: state === "error",
    setSuccess,
    setError,
    setLoading,
    reset,
  };
};

// Inline success indicator
interface InlineSuccessProps {
  isVisible: boolean;
  message?: string;
}

export const InlineSuccess = ({ isVisible, message = "Saved!" }: InlineSuccessProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="flex items-center gap-2 text-success"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CheckCircle2 className="h-4 w-4" />
          </motion.div>
          <span className="text-sm font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
