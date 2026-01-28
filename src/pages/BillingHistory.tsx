import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { 
  CreditCard, 
  Receipt, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DownloadInvoiceButton } from '@/components/DownloadInvoiceButton';
import logger from '@/lib/logger';

interface BillingTransaction {
  id: string;
  reference: string;
  amount: number;
  originalAmount: number | null;
  discountAmount: number | null;
  discountCode: string | null;
  tier: string;
  billingCycle: string;
  status: string;
  receiptNumber: string | null;
  createdAt: string;
}

interface SubscriptionInfo {
  id: string;
  tier: string;
  billingCycle: string;
  status: string;
  amount: number;
  currentPeriodEnd: string | null;
  nextPaymentDate: string | null;
  cancelAtPeriodEnd: boolean;
  cancellationReason: string | null;
}

interface BillingData {
  subscription: SubscriptionInfo | null;
  billingHistory: BillingTransaction[];
  profile: {
    tier: string;
    trialExpiresAt: string | null;
  };
  status: {
    isActive: boolean;
    subscriptionStatus: string;
    willCancel: boolean;
    currentPeriodEnd: string | null;
  };
}

export default function BillingHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!user) return;
      
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const response = await supabase.functions.invoke('paystack-get-subscription', {
          headers: { Authorization: `Bearer ${sessionData.session?.access_token}` }
        });

        if (response.error) throw new Error(response.error.message);
        if (!response.data.success) throw new Error(response.data.error);

        setBillingData(response.data);
      } catch (err) {
        logger.error('Error fetching billing data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load billing data');
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [user]);

  // KOBO TO NAIRA CONVERSION - Database stores kobo (100 kobo = 1 Naira)
  // 629930 kobo ÷ 100 = ₦6,299.30
  const formatCurrency = (amountInKobo: number): string => {
    if (!amountInKobo || isNaN(amountInKobo)) return '₦0.00';
    const amountInNaira = Number(amountInKobo) / 100;
    return `₦${amountInNaira.toLocaleString('en-NG', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-success/10 text-success"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSubscriptionStatusBadge = (status: string, willCancel: boolean) => {
    if (willCancel) {
      return <Badge variant="secondary" className="bg-warning/10 text-warning">Cancelling</Badge>;
    }
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success/10 text-success">Active</Badge>;
      case 'trial':
        return <Badge variant="secondary" className="bg-primary/10 text-primary">Trial</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <PageLayout maxWidth="4xl">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Please sign in to view billing</h2>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout maxWidth="4xl">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout maxWidth="4xl">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Billing</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
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
            <h1 className="text-3xl font-bold">Billing & Subscription</h1>
            <p className="text-muted-foreground">Manage your subscription and view billing history</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/pricing')}>
              <TrendingUp className="h-4 w-4 mr-2" />
              View Plans
            </Button>
            {billingData?.subscription && !billingData.status.willCancel && (
              <Button variant="outline" onClick={() => navigate('/cancel-subscription')}>
                Cancel Subscription
              </Button>
            )}
          </div>
        </div>

        {/* Current Plan Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold capitalize">
                    {billingData?.profile.tier || 'Free'}
                  </span>
                  {getSubscriptionStatusBadge(
                    billingData?.status.subscriptionStatus || 'none',
                    billingData?.status.willCancel || false
                  )}
                </div>
                {billingData?.subscription && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      {formatCurrency(billingData.subscription.amount)} / {billingData.subscription.billingCycle === 'annually' ? 'year' : 'month'}
                    </p>
                    {billingData.status.currentPeriodEnd && (
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {billingData.status.willCancel ? 'Access until' : 'Next billing date'}: {format(new Date(billingData.status.currentPeriodEnd), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                )}
                {billingData?.profile.trialExpiresAt && !billingData.subscription && (
                  <p className="text-sm text-muted-foreground">
                    Trial ends: {format(new Date(billingData.profile.trialExpiresAt), 'MMM dd, yyyy')}
                  </p>
                )}
                {billingData?.status.willCancel && (
                  <p className="text-sm text-warning mt-2">
                    Your subscription will not renew. You'll have access until the end of your billing period.
                  </p>
                )}
              </div>
              {!billingData?.subscription && (
                <Button onClick={() => navigate('/pricing')}>
                  Upgrade Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Billing History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription>Your past payments and invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {billingData?.billingHistory && billingData.billingHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingData.billingHistory.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="capitalize">{transaction.tier} Plan - {transaction.billingCycle}</p>
                          {transaction.discountCode && (
                            <p className="text-xs text-muted-foreground">
                              Discount: {transaction.discountCode} (-{formatCurrency(transaction.discountAmount || 0)})
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.originalAmount && transaction.originalAmount !== transaction.amount ? (
                          <div>
                            <span className="line-through text-muted-foreground text-sm mr-2">
                              {formatCurrency(transaction.originalAmount)}
                            </span>
                            <span>{formatCurrency(transaction.amount)}</span>
                          </div>
                        ) : (
                          formatCurrency(transaction.amount)
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-right">
                        <DownloadInvoiceButton transactionReference={transaction.reference} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No billing history yet</p>
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
