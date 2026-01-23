import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Zap, ArrowRight, Clock } from 'lucide-react';

export const FreeTrialCTA = () => {
  const { user } = useAuth();

  // Don't show to logged-in users
  if (user) {
    return null;
  }

  return (
    <section className="relative z-10 py-10 md:py-14 overflow-hidden">
      {/* Futuristic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-background" />
      <div className="absolute inset-0 bg-grid opacity-5" />
      
      {/* Animated Glow Orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-primary/20 blur-[80px] animate-pulse-soft" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[150px] h-[150px] rounded-full bg-accent/20 blur-[60px] animate-float" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Main CTA Card */}
          <div className="relative group">
            {/* Outer Glow Border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-pulse-soft" />
            
            {/* Card Content */}
            <div className="relative glass-frosted rounded-2xl p-6 md:p-8 border border-border/50 overflow-hidden">
              {/* Inner Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-xl" />
              
              {/* Floating Badge */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-md opacity-50 animate-pulse-soft" />
                  <div className="relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-xs shadow-lg">
                    <Zap className="h-3 w-3" />
                    <span>Limited Time Offer</span>
                    <Sparkles className="h-3 w-3" />
                  </div>
                </div>
              </div>
              
              {/* Headline */}
              <div className="text-center mb-4 relative z-10">
                <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
                  Get{' '}
                  <span className="text-gradient bg-gradient-to-r from-primary via-success to-accent bg-clip-text">
                    Full Business Access
                  </span>
                </h2>
                <p className="text-base md:text-lg text-muted-foreground font-medium">
                  Free for <span className="text-primary font-bold">7 Days</span> — No Credit Card Required
                </p>
              </div>
              
              {/* Tagline Benefits */}
              <p className="text-center text-sm text-muted-foreground mb-5 relative z-10">
                Calculate taxes accurately • Track expenses • Get AI-powered insights
              </p>
              
              {/* CTA Button */}
              <div className="flex flex-col items-center gap-3 relative z-10">
                <Link to="/auth">
                  <Button 
                    variant="glow" 
                    size="default" 
                    className="group shadow-lg px-6 py-2 text-sm font-semibold hover:scale-105 transition-transform duration-300"
                  >
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    <span>Start Your Free Trial</span>
                    <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Instant access • No payment details needed</span>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};