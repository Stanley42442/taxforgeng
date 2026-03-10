import { AlertTriangle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';

export const GracePeriodBanner = () => {
  const { gracePeriodEndsAt, isInGracePeriod, loading } = useSubscription();
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    if (!gracePeriodEndsAt) return;

    const calculate = () => {
      const diff = gracePeriodEndsAt.getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      };
    };

    setTimeRemaining(calculate());
    const interval = setInterval(() => setTimeRemaining(calculate()), 60000);
    return () => clearInterval(interval);
  }, [gracePeriodEndsAt]);

  if (loading || !isInGracePeriod || !gracePeriodEndsAt) return null;

  const { days, hours, minutes } = timeRemaining;

  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-2.5 w-full">
      <div className="container mx-auto flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium text-xs sm:text-sm">Payment Overdue</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm animate-pulse">
            <Clock className="h-3.5 w-3.5 shrink-0 hidden sm:block" />
            <span>
              <span className="font-bold tabular-nums">{days}d {hours}h {minutes}m</span>
              <span className="hidden sm:inline text-destructive-foreground/80"> left before downgrade</span>
            </span>
          </div>
        </div>
        <Button asChild size="sm" variant="secondary" className="h-7 text-xs font-medium shrink-0">
          <Link to="/pricing">Update Payment</Link>
        </Button>
      </div>
    </div>
  );
};
