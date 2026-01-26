import { useState } from 'react';
import logger from '@/lib/logger';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TRIAL_DURATION_DAYS, TRIAL_DURATION_MS } from '@/lib/constants';

interface TierSelectionModalProps {
  open: boolean;
  onComplete: () => void;
  userId: string;
}

const tiers = [
  {
    id: 'free',
    name: 'Free',
    price: '₦0',
    period: 'forever',
    description: 'Basic tax calculations for individuals',
    icon: Zap,
    features: [
      'Basic tax calculator',
      'Individual tax calculations',
      '1 saved business',
      'Community support',
    ],
    highlighted: false,
    trial: false,
  },
  {
    id: 'business',
    name: 'Business',
    price: '₦0',
    period: `for ${TRIAL_DURATION_DAYS} days`,
    description: 'Full access to all business features',
    icon: Crown,
    features: [
      'Save up to 10 businesses',
      'Export PDF & CSV reports',
      'Tax filing preparation',
      'CAC verification tools',
      'Scenario modeling',
      'Priority AI assistant',
      'Expense tracking & analytics',
    ],
    highlighted: true,
    trial: true,
    originalPrice: '₦4,999/mo',
  },
];

export const TierSelectionModal = ({ open, onComplete, userId }: TierSelectionModalProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectTier = async (tierId: string, isTrial: boolean) => {
    setLoading(tierId);
    
    try {
      const now = new Date();
      const trialExpiry = isTrial ? new Date(now.getTime() + TRIAL_DURATION_MS) : null;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: tierId,
          has_selected_initial_tier: true,
          trial_started_at: isTrial ? now.toISOString() : null,
          trial_expires_at: trialExpiry?.toISOString() || null,
        })
        .eq('id', userId);

      if (error) throw error;

      if (isTrial) {
        toast.success(`Welcome! Your ${TRIAL_DURATION_DAYS}-day Business trial has started.`, {
          description: 'Enjoy full access to all premium features.',
        });
      } else {
        toast.success('Welcome! You\'re on the Free plan.', {
          description: 'You can upgrade anytime to unlock more features.',
        });
      }
      
      onComplete();
    } catch (error) {
      logger.error('Error selecting tier:', error);
      toast.error('Failed to set up your account. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" hideCloseButton>
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold">Welcome! Choose Your Plan</DialogTitle>
          <DialogDescription className="text-base">
            Get started with the plan that's right for you
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {tiers.map((tier) => (
            <Card 
              key={tier.id}
              className={`relative transition-all duration-300 hover:shadow-lg ${
                tier.highlighted 
                  ? 'border-primary shadow-md ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {tier.trial && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-3 py-1 text-xs font-semibold">
                    <Crown className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pt-6 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${tier.highlighted ? 'bg-primary/10' : 'bg-secondary'}`}>
                    <tier.icon className={`h-5 w-5 ${tier.highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                </div>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </div>
                
                {tier.trial && tier.originalPrice && (
                  <p className="text-xs text-muted-foreground">
                    Then {tier.originalPrice} after trial
                  </p>
                )}
                
                <CardDescription className="text-sm mt-2">
                  {tier.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-2 pb-4">
                <ul className="space-y-2 mb-4">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${tier.highlighted ? 'text-primary' : 'text-success'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSelectTier(tier.id, tier.trial)}
                  disabled={loading !== null}
                  className="w-full"
                  variant={tier.highlighted ? 'default' : 'outline'}
                >
                  {loading === tier.id ? (
                    'Setting up...'
                  ) : tier.trial ? (
                    'Start Free Trial'
                  ) : (
                    'Continue with Free'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <p className="text-xs text-center text-muted-foreground pt-2">
          No credit card required • Cancel anytime • Trial auto-downgrades to Free
        </p>
      </DialogContent>
    </Dialog>
  );
};
