import { useSubscription } from '@/contexts/SubscriptionContext';
import { Sparkles, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const TrialBanner = () => {
  const { isOnTrial, trialEndsAt, effectiveTier, loading } = useSubscription();

  // Wait for subscription data to load before deciding
  if (loading) {
    return null;
  }

  if (!isOnTrial || !trialEndsAt) {
    return null;
  }

  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const hoursRemaining = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60)));

  const timeText = daysRemaining > 1 
    ? `${daysRemaining} days` 
    : daysRemaining === 1 
      ? '1 day' 
      : `${hoursRemaining} hours`;

  return (
    <div className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground px-4 py-2.5 sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium text-sm">Free Trial</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-primary-foreground/90">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {timeText} left of full <span className="font-semibold capitalize">{effectiveTier}</span> access
            </span>
          </div>
          <div className="sm:hidden text-sm text-primary-foreground/90">
            {timeText} left
          </div>
        </div>
        
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="h-7 text-xs font-medium"
        >
          <Link to="/pricing">Upgrade Now</Link>
        </Button>
      </div>
    </div>
  );
};
