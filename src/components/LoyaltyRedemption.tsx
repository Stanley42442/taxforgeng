import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLoyaltyPoints } from '@/hooks/useLoyaltyPoints';
import { useAuth } from '@/hooks/useAuth';
import { Gift, Loader2, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LoyaltyRedemptionProps {
  className?: string;
}

export function LoyaltyRedemption({ className }: LoyaltyRedemptionProps) {
  const { user } = useAuth();
  const { balance, redemptionTiers, redeemPoints, loading } = useLoyaltyPoints();
  const [redeeming, setRedeeming] = useState<number | null>(null);
  const [lastRedeemed, setLastRedeemed] = useState<{
    code: string;
    discount: number;
    expiresAt: string;
  } | null>(null);

  if (!user) return null;
  if (loading) return null;

  const handleRedeem = async (tierIndex: number) => {
    const tier = redemptionTiers[tierIndex];
    if (!tier || balance < tier.points) return;

    setRedeeming(tierIndex);
    try {
      const result = await redeemPoints(tierIndex);
      if (result.success) {
        setLastRedeemed({
          code: result.discountCode!,
          discount: result.discountPercentage!,
          expiresAt: result.expiresAt!,
        });
        toast.success(`🎉 You got a ${result.discountPercentage}% discount code!`, {
          description: `Use code: ${result.discountCode}`,
        });
      } else {
        toast.error(result.error || 'Failed to redeem points');
      }
    } catch {
      toast.error('Failed to redeem points');
    } finally {
      setRedeeming(null);
    }
  };

  const handleCopyCode = async () => {
    if (!lastRedeemed) return;
    await navigator.clipboard.writeText(lastRedeemed.code);
    toast.success('Code copied to clipboard!');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Redeem Points
        </CardTitle>
        <CardDescription>
          You have <span className="font-semibold text-primary">{balance.toLocaleString()}</span> points available
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success state */}
        {lastRedeemed && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-center space-y-3">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-success" />
              </div>
            </div>
            <div>
              <p className="text-lg font-bold text-success">{lastRedeemed.discount}% OFF</p>
              <p className="text-sm text-muted-foreground">
                Expires {new Date(lastRedeemed.expiresAt).toLocaleDateString()}
              </p>
            </div>
            <Button onClick={handleCopyCode} className="w-full">
              Copy Code: {lastRedeemed.code}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLastRedeemed(null)}
              className="text-muted-foreground"
            >
              Redeem Another
            </Button>
          </div>
        )}

        {/* Redemption tiers */}
        {!lastRedeemed && (
          <div className="grid gap-3">
            {redemptionTiers.map((tier, index) => {
              const canRedeem = balance >= tier.points;
              const isRedeeming = redeeming === index;
              
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-all",
                    canRedeem 
                      ? "border-primary/30 bg-primary/5 hover:bg-primary/10" 
                      : "border-border bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center font-bold",
                      canRedeem 
                        ? "bg-gradient-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {tier.discount}%
                    </div>
                    <div>
                      <p className={cn("font-medium", !canRedeem && "text-muted-foreground")}>
                        {tier.discount}% Discount
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tier.points.toLocaleString()} points
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canRedeem ? (
                      <Button
                        size="sm"
                        onClick={() => handleRedeem(index)}
                        disabled={isRedeeming}
                      >
                        {isRedeeming ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Redeeming...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Redeem
                          </>
                        )}
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Need {(tier.points - balance).toLocaleString()} more
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
