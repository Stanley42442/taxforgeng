import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Calculator, 
  ChevronRight, 
  Building2, 
  Receipt, 
  Bell, 
  GraduationCap,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface WelcomeSplashProps {
  onComplete: () => void;
}

const TOUR_STEPS = [
  {
    icon: Calculator,
    title: "Smart Tax Calculator",
    description: "Calculate CIT, PIT, VAT, and more with Nigeria Tax Act 2026 rules built-in. Get accurate estimates in seconds.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Building2,
    title: "Multi-Business Support",
    description: "Save and manage multiple businesses. Track LLCs and Business Names separately with proper tax treatment.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Receipt,
    title: "Expense Tracking",
    description: "Log income and expenses, categorize deductibles, and see real-time tax impact visualizations.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: Bell,
    title: "Filing Reminders",
    description: "Never miss a deadline. Set reminders for VAT, PAYE, CIT, and other tax filing dates.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    icon: GraduationCap,
    title: "Tax Academy",
    description: "Learn about Nigerian tax laws, exemptions, and compliance requirements. Stay informed.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

export const WelcomeSplash = ({ onComplete }: WelcomeSplashProps) => {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('taxforge_welcome_shown', 'true');
    setOpen(false);
    onComplete();
  };

  const currentStep = TOUR_STEPS[step];
  const StepIcon = currentStep.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {step === 0 ? (
          // Welcome Screen
          <div className="p-6 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary animate-fade-in">
              <Sparkles className="h-10 w-10 text-primary-foreground" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2 animate-fade-in">
              Welcome to TaxForge NG
            </h2>
            
            <p className="text-muted-foreground mb-6 animate-fade-in">
              Navigate the 2026 Nigeria Tax Act reforms with confidence. Let's take a quick tour of your tax toolkit.
            </p>

            <div className="space-y-3 mb-6 animate-fade-in">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-sm text-left">Accurate 2026 tax calculations</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-sm text-left">Multi-business expense tracking</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-sm text-left">Demo data pre-loaded for you</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSkip} className="flex-1">
                Skip Tour
              </Button>
              <Button variant="hero" onClick={handleNext} className="flex-1">
                Start Tour
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          // Tour Steps
          <div className="p-6">
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {TOUR_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === step 
                      ? 'w-6 bg-primary' 
                      : idx < step 
                        ? 'w-2 bg-primary/50' 
                        : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>

            <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${currentStep.bgColor} animate-scale-in`}>
              <StepIcon className={`h-8 w-8 ${currentStep.color}`} />
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2 text-center animate-fade-in">
              {currentStep.title}
            </h3>

            <p className="text-muted-foreground mb-6 text-center animate-fade-in">
              {currentStep.description}
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSkip} className="flex-1">
                Skip
              </Button>
              <Button variant="hero" onClick={handleNext} className="flex-1">
                {step === TOUR_STEPS.length - 1 ? "Get Started" : "Next"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
