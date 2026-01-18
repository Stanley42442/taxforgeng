import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface BillingCycleToggleProps {
  value: 'monthly' | 'annually';
  onChange: (value: 'monthly' | 'annually') => void;
  className?: string;
}

export function BillingCycleToggle({ value, onChange, className }: BillingCycleToggleProps) {
  return (
    <div className={cn("flex items-center justify-center gap-1 p-1 bg-muted rounded-lg", className)}>
      <button
        type="button"
        onClick={() => onChange('monthly')}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md transition-all",
          value === 'monthly'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange('annually')}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
          value === 'annually'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Annually
        <Badge variant="secondary" className="bg-success/10 text-success text-xs">
          Save 17%
        </Badge>
      </button>
    </div>
  );
}
