import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight } from 'lucide-react';

export const FreeTrialCTA = () => {
  const { user } = useAuth();

  if (user) {
    return null;
  }

  return (
    <section className="relative z-10 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center rounded-xl border border-border bg-card p-8 md:p-10">
          <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">
            Limited Time Offer
          </p>
          
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Get Full Business Access
          </h2>
          <p className="text-muted-foreground mb-2">
            Free for <span className="text-primary font-semibold">7 Days</span> — No Credit Card Required
          </p>
          
          <p className="text-sm text-muted-foreground mb-6">
            Calculate taxes accurately · Track expenses · Get AI-powered insights
          </p>
          
          <Link to="/auth">
            <Button size="lg" className="px-8 h-12 text-base font-semibold group">
              Start Your Free Trial
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          
          <p className="mt-4 text-xs text-muted-foreground">
            Instant access · No payment details needed
          </p>
        </div>
      </div>
    </section>
  );
};
