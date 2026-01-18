import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useLoyaltyPoints } from '@/hooks/useLoyaltyPoints';
import { useAuth } from '@/hooks/useAuth';
import { Star, Gift, TrendingUp, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LoyaltyPointsCardProps {
  className?: string;
  compact?: boolean;
}

export function LoyaltyPointsCard({ className, compact = false }: LoyaltyPointsCardProps) {
  const { user } = useAuth();
  const { balance, redemptionTiers, availableRedemptions, loading, error } = useLoyaltyPoints();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!user) return null;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className={compact ? 'pb-2' : ''}>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Unable to load loyalty points</p>
        </CardContent>
      </Card>
    );
  }

  // Find next tier
  const nextTier = redemptionTiers.find(t => t.points > balance) || redemptionTiers[redemptionTiers.length - 1];
  const prevTier = redemptionTiers.filter(t => t.points <= balance).pop();
  const progressToNext = nextTier ? Math.min((balance / nextTier.points) * 100, 100) : 100;

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Discount code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (compact) {
    return (
      <Card className={cn("bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20", className)}>
        <CardContent className="pt-4 pb-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <Star className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{balance.toLocaleString()} points</p>
                {nextTier && balance < nextTier.points && (
                  <p className="text-xs text-muted-foreground">
                    {nextTier.points - balance} to {nextTier.discount}% off
                  </p>
                )}
              </div>
            </div>
            {availableRedemptions.length > 0 && (
              <Badge variant="secondary" className="bg-success/10 text-success">
                {availableRedemptions.length} reward{availableRedemptions.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-1" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center glow-sm">
              <Star className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Loyalty Points</CardTitle>
              <CardDescription>Earn rewards with every subscription</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{balance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">points</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress to next tier */}
        {nextTier && balance < nextTier.points && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to {nextTier.discount}% discount</span>
              <span className="font-medium">{nextTier.points - balance} more</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}

        {/* Available redemptions */}
        {availableRedemptions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              Your Rewards
            </h4>
            <div className="space-y-2">
              {availableRedemptions.map((redemption) => (
                <div 
                  key={redemption.id}
                  className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-success">{redemption.discount_percentage}% OFF</p>
                    <p className="text-xs text-muted-foreground">
                      Expires {new Date(redemption.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyCode(redemption.discount_code)}
                    className="gap-1"
                  >
                    {copiedCode === redemption.discount_code ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        {redemption.discount_code}
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How to earn */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            How to Earn
          </h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Each subscription payment</span>
              <span className="font-medium">+100 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Refer a friend (signup)</span>
              <span className="font-medium">+500 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Referral becomes paid</span>
              <span className="font-medium">+1,000 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Annual subscription</span>
              <span className="font-medium">+200 pts</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
