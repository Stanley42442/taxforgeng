import { useSubscription } from '@/contexts/SubscriptionContext';
import { Sparkles, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export const TrialBanner = () => {
  const { isOnTrial, trialEndsAt, effectiveTier, loading } = useSubscription();
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!trialEndsAt) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const diff = trialEndsAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    // Set initial value
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [trialEndsAt]);

  // Wait for subscription data to load before deciding
  if (loading) {
    return null;
  }

  if (!isOnTrial || !trialEndsAt) {
    return null;
  }

  const { days, hours, minutes } = timeRemaining;

  // Format the countdown display
  const formatTimeUnit = (value: number, unit: string) => (
    <span className="inline-flex items-center gap-0.5">
      <span className="font-bold tabular-nums">{value}</span>
      <span className="text-primary-foreground/80 text-xs">{unit}</span>
    </span>
  );

  return (
    <div className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground px-4 py-2.5 sticky top-0 z-40 w-full">
      <div className="container mx-auto flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium text-xs sm:text-sm">Free Trial</span>
          </div>
          
          {/* Countdown Timer */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Clock className="h-3.5 w-3.5 shrink-0 hidden sm:block" />
            <div className="flex items-center gap-1 sm:gap-2">
              {days > 0 && formatTimeUnit(days, 'd')}
              {formatTimeUnit(hours, 'h')}
              {formatTimeUnit(minutes, 'm')}
            </div>
            <span className="hidden sm:inline text-primary-foreground/80">
              left of <span className="font-semibold capitalize">{effectiveTier}</span>
            </span>
          </div>
        </div>
        
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="h-7 text-xs font-medium shrink-0"
        >
          <Link to="/pricing">Upgrade</Link>
        </Button>
      </div>
    </div>
  );
};
