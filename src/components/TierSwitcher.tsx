import { useSubscription, SubscriptionTier } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FlaskConical } from "lucide-react";

const TIER_INFO: Record<SubscriptionTier, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-muted text-muted-foreground' },
  basic: { label: 'Basic', color: 'bg-primary/20 text-primary' },
  freelancer: { label: 'Freelancer', color: 'bg-accent/20 text-accent-foreground' },
  business: { label: 'Business', color: 'bg-success/20 text-success' },
  corporate: { label: 'Corporate', color: 'bg-warning/20 text-warning' },
};

export const TierSwitcher = () => {
  const { tier, setTier } = useSubscription();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-warning/50 bg-warning/5">
      <FlaskConical className="h-4 w-4 text-warning" />
      <span className="text-xs text-muted-foreground hidden sm:inline">Test Mode:</span>
      <Select value={tier} onValueChange={(value) => setTier(value as SubscriptionTier)}>
        <SelectTrigger className="h-7 w-[110px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(TIER_INFO) as SubscriptionTier[]).map((t) => (
            <SelectItem key={t} value={t}>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-xs ${TIER_INFO[t].color}`}>
                  {TIER_INFO[t].label}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
