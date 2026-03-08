import { PageLayout } from '@/components/PageLayout';
import { LoyaltyPointsCard } from '@/components/LoyaltyPointsCard';
import { LoyaltyRedemption } from '@/components/LoyaltyRedemption';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLoyaltyPoints } from '@/hooks/useLoyaltyPoints';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { 
  Star, 
  History, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  Gift
} from 'lucide-react';

export default function LoyaltyRewards() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { transactions, loading } = useLoyaltyPoints();

  if (authLoading) {
    return (
      <PageLayout maxWidth="4xl">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout maxWidth="4xl">
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">Sign in to view your rewards</h2>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Gift className="h-8 w-8 text-primary" />
              Loyalty Rewards
            </h1>
            <p className="text-muted-foreground">Earn points and redeem exclusive discounts</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/referrals')}>
            Invite Friends
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Main content */}
        <div className="grid gap-6 md:grid-cols-2">
          <LoyaltyPointsCard />
          <LoyaltyRedemption />
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Points History
            </CardTitle>
            <CardDescription>Your recent points activity</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        transaction.points > 0 
                          ? 'bg-success/10 text-success' 
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {transaction.points > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={transaction.points > 0 ? 'default' : 'secondary'}
                      className={transaction.points > 0 
                        ? 'bg-success/10 text-success hover:bg-success/20' 
                        : ''
                      }
                    >
                      {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString()}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No points activity yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Subscribe to a plan to start earning points!
                </p>
                <Button className="mt-4" onClick={() => navigate('/pricing')}>
                  View Plans
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
