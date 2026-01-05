import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Zap, Crown, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export const FreeTrialCTA = () => {
  const { user } = useAuth();

  // Don't show to logged-in users
  if (user) {
    return null;
  }

  return (
    <section className="relative z-10 py-16 md:py-20 overflow-hidden">
      {/* Futuristic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-background" />
      <div className="absolute inset-0 bg-grid opacity-5" />
      
      {/* Animated Glow Orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary/20 blur-[100px] animate-pulse-soft" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[250px] h-[250px] rounded-full bg-accent/20 blur-[80px] animate-float" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main CTA Card */}
          <div className="relative group">
            {/* Outer Glow Border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-pulse-soft" />
            
            {/* Card Content */}
            <div className="relative glass-frosted rounded-3xl p-8 md:p-12 border border-border/50 overflow-hidden">
              {/* Inner Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-2xl" />
              
              {/* Floating Badge */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-md opacity-50 animate-pulse-soft" />
                  <div className="relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm shadow-lg">
                    <Zap className="h-4 w-4" />
                    <span>Limited Time Offer</span>
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
              </div>
              
              {/* Headline */}
              <div className="text-center mb-8 relative z-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4">
                  Get{' '}
                  <span className="relative">
                    <span className="text-gradient bg-gradient-to-r from-primary via-success to-accent bg-clip-text">
                      Full Business Access
                    </span>
                    <Crown className="absolute -top-6 -right-8 h-8 w-8 text-accent animate-float" />
                  </span>
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                  Free for <span className="text-primary font-bold">7 Days</span> — No Credit Card Required
                </p>
              </div>
              
              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 relative z-10">
                {[
                  { icon: CheckCircle2, text: 'Save up to 10 businesses', highlight: true },
                  { icon: CheckCircle2, text: 'Export PDF & CSV reports', highlight: false },
                  { icon: CheckCircle2, text: 'Tax filing preparation', highlight: false },
                  { icon: CheckCircle2, text: 'CAC verification tools', highlight: true },
                  { icon: CheckCircle2, text: 'Scenario modeling', highlight: false },
                  { icon: CheckCircle2, text: 'Priority AI assistant', highlight: true },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                      feature.highlight 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-secondary/50 border border-border/30'
                    } hover:scale-[1.02] hover:shadow-md`}
                  >
                    <feature.icon className={`h-5 w-5 shrink-0 ${feature.highlight ? 'text-primary' : 'text-success'}`} />
                    <span className="text-sm font-medium text-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>
              
              {/* CTA Button */}
              <div className="flex flex-col items-center gap-4 relative z-10">
                <Link to="/auth">
                  <Button 
                    variant="glow" 
                    size="xl" 
                    className="group shadow-2xl px-10 py-6 text-lg font-bold hover:scale-105 transition-transform duration-300"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    <span>Start Your Free Trial</span>
                    <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Instant access • No payment details needed</span>
                </div>
              </div>
              
              {/* Bottom Stats */}
              <div className="mt-10 pt-8 border-t border-border/30 relative z-10">
                <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                  {[
                    { value: '10,000+', label: 'Businesses trust us' },
                    { value: '₦2.5B+', label: 'Tax calculated' },
                    { value: '4.9/5', label: 'User rating' },
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};