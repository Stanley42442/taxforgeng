import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RippleButton } from "@/components/ui/ripple-button";
import { 
  Calculator, 
  ChevronRight, 
  ChevronLeft,
  Building2, 
  Receipt, 
  Bell, 
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
} from "lucide-react";
import { safeLocalStorage } from "@/lib/safeStorage";

interface PremiumOnboardingProps {
  onComplete: () => void;
}

const TOUR_STEPS = [
  {
    icon: Calculator,
    title: "Tax Calculator",
    description: "Calculate CIT, VAT, PIT with 2026 rules support. Get accurate tax estimates in seconds.",
    color: "text-primary",
    bgGradient: "from-primary/20 to-primary/5",
    features: ["CIT, VAT, PIT calculations", "2026 tax rules", "Instant estimates"],
  },
  {
    icon: Building2,
    title: "Multi-Business Support",
    description: "Manage multiple businesses with separate profiles and consolidated reporting.",
    color: "text-success",
    bgGradient: "from-success/20 to-success/5",
    features: ["Unlimited businesses", "Separate profiles", "Consolidated reports"],
  },
  {
    icon: Receipt,
    title: "Expense Tracking",
    description: "Track deductible expenses to reduce your tax burden with OCR receipt scanning.",
    color: "text-warning",
    bgGradient: "from-warning/20 to-warning/5",
    features: ["OCR receipt scanning", "Auto-categorization", "Tax deductions"],
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Never miss a tax deadline with automated email and WhatsApp reminders.",
    color: "text-destructive",
    bgGradient: "from-destructive/20 to-destructive/5",
    features: ["Email notifications", "WhatsApp alerts", "Calendar sync"],
  },
  {
    icon: GraduationCap,
    title: "Tax Academy",
    description: "Learn Nigerian tax laws with our educational content and AI-powered assistant.",
    color: "text-info",
    bgGradient: "from-info/20 to-info/5",
    features: ["Video tutorials", "AI assistant", "Tax guides"],
  },
];

export const PremiumOnboarding = ({ onComplete }: PremiumOnboardingProps) => {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const handleNext = () => {
    if (step < TOUR_STEPS.length) {
      setDirection(1);
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    safeLocalStorage.setItem('taxforge_welcome_shown', 'true');
    setOpen(false);
    onComplete();
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  const currentStep = TOUR_STEPS[step - 1];
  const StepIcon = currentStep?.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className="sm:max-w-lg p-0 overflow-hidden glass-frosted border-primary/20 shadow-futuristic"
        hideCloseButton
      >
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 ? (
            // Welcome Screen
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="p-8"
            >
              {/* Animated Logo */}
              <motion.div 
                className="mx-auto mb-8 relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-primary shadow-lg">
                  <Sparkles className="h-12 w-12 text-primary-foreground" />
                </div>
                {/* Animated rings */}
                <motion.div
                  className="absolute inset-0 rounded-3xl border-2 border-primary/30"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-3xl border-2 border-primary/20"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                />
              </motion.div>
              
              <motion.h2 
                className="text-3xl font-bold text-foreground mb-3 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Welcome to TaxForge NG!
              </motion.h2>
              
              <motion.p 
                className="text-muted-foreground mb-8 text-center text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Your intelligent Nigerian tax companion
              </motion.p>

              {/* Feature highlights */}
              <motion.div 
                className="space-y-3 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[
                  { icon: Zap, text: "Lightning-fast tax calculations", color: "text-warning" },
                  { icon: Shield, text: "Secure & compliant with Nigerian law", color: "text-success" },
                  { icon: TrendingUp, text: "Optimize your tax savings", color: "text-primary" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl glass border border-border/50"
                  >
                    <div className={`p-2 rounded-lg bg-background/50 ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div 
                className="flex gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <RippleButton variant="outline" onClick={handleSkip} className="flex-1">
                  Skip Tour
                </RippleButton>
                <RippleButton variant="hero" onClick={handleNext} className="flex-1 group">
                  Start Tour
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </RippleButton>
              </motion.div>
            </motion.div>
          ) : step <= TOUR_STEPS.length ? (
            // Tour Steps
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-8"
            >
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">
                    Step {step} of {TOUR_STEPS.length}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round((step / TOUR_STEPS.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-primary rounded-full"
                    initial={{ width: `${((step - 1) / TOUR_STEPS.length) * 100}%` }}
                    animate={{ width: `${(step / TOUR_STEPS.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Icon with gradient background */}
              <motion.div
                className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${currentStep.bgGradient} shadow-lg`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {StepIcon && <StepIcon className={`h-10 w-10 ${currentStep.color}`} />}
              </motion.div>

              <motion.h3 
                className="text-2xl font-bold text-foreground mb-3 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {currentStep.title}
              </motion.h3>

              <motion.p 
                className="text-muted-foreground mb-6 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {currentStep.description}
              </motion.p>

              {/* Feature list */}
              <motion.div 
                className="space-y-2 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {currentStep.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <CheckCircle2 className={`h-5 w-5 ${currentStep.color} flex-shrink-0`} />
                    <span className="text-sm">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Navigation */}
              <div className="flex gap-3">
                <RippleButton 
                  variant="outline" 
                  onClick={handleBack}
                  className="w-12"
                >
                  <ChevronLeft className="h-4 w-4" />
                </RippleButton>
                <RippleButton variant="ghost" onClick={handleSkip} className="flex-1">
                  Skip
                </RippleButton>
                <RippleButton variant="hero" onClick={handleNext} className="flex-1">
                  {step === TOUR_STEPS.length ? "Get Started" : "Next"}
                  <ChevronRight className="h-4 w-4" />
                </RippleButton>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
