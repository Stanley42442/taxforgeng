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

export const WelcomeSplash = ({ onComplete }: WelcomeSplashProps) => {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);

  const TOUR_STEPS = [
    {
      icon: Calculator,
      title: "Tax Calculator",
      description: "Calculate CIT, VAT, PIT with 2026 rules support",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Building2,
      title: "Multi-Business Support",
      description: "Manage multiple businesses with separate profiles",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: Receipt,
      title: "Expense Tracking",
      description: "Track deductible expenses to reduce your tax burden",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description: "Never miss a tax deadline with automated reminders",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      icon: GraduationCap,
      title: "Tax Academy",
      description: "Learn Nigerian tax laws with our educational content",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

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
    try { localStorage.setItem('taxforge_welcome_shown', 'true'); } catch { /* ignore */ }
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
              Welcome to TaxForge NG!
            </h2>
            
            <p className="text-muted-foreground mb-6 animate-fade-in">
              Your intelligent Nigerian tax companion
            </p>

            <div className="space-y-3 mb-6 animate-fade-in">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-sm text-left">Accurate tax calculations for Nigerian businesses</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-sm text-left">Multi-business & expense tracking</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-sm text-left">Demo data loaded for exploration</span>
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