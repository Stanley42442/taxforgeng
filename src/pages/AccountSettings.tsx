import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSubscription, SubscriptionTier } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, 
  CreditCard, 
  History, 
  Shield, 
  Crown, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Database,
  CheckCircle,
  Clock,
  User,
  Mail,
  Building2,
  FileText,
  Receipt,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface SubscriptionHistoryItem {
  id: string;
  previous_tier: string | null;
  new_tier: string;
  change_type: string;
  reason: string | null;
  created_at: string;
}

interface DataSnapshot {
  id: string;
  snapshot_tier: string;
  data_type: string;
  data_count: number;
  snapshot_date: string;
  is_active: boolean;
}

const TIER_DISPLAY_NAMES: Record<string, string> = {
  free: 'Individual',
  starter: 'Starter',
  basic: 'Basic',
  professional: 'Professional',
  business: 'Business',
  corporate: 'Corporate',
};

const TIER_COLORS: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  starter: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  basic: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  professional: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  business: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  corporate: 'bg-gradient-to-r from-primary to-accent text-primary-foreground',
};

const DATA_TYPE_ICONS: Record<string, React.ReactNode> = {
  businesses: <Building2 className="h-4 w-4" />,
  invoices: <FileText className="h-4 w-4" />,
  expenses: <Receipt className="h-4 w-4" />,
  calculations: <BarChart3 className="h-4 w-4" />,
};

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier, trialEndsAt, isOnTrial, savedBusinesses } = useSubscription();
  
  // Calculate trial days left
  const trialDaysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [dataSnapshots, setDataSnapshots] = useState<DataSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataCounts, setDataCounts] = useState({
    businesses: 0,
    invoices: 0,
    expenses: 0,
    calculations: 0,
  });

  useEffect(() => {
    if (user) {
      fetchSubscriptionHistory();
      fetchDataSnapshots();
      fetchDataCounts();
    }
  }, [user]);

  const fetchSubscriptionHistory = async () => {
    const { data, error } = await supabase
      .from('subscription_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (!error && data) {
      setSubscriptionHistory(data);
    }
    setIsLoading(false);
  };

  const fetchDataSnapshots = async () => {
    const { data, error } = await supabase
      .from('tier_data_snapshots')
      .select('*')
      .eq('is_active', true)
      .order('snapshot_date', { ascending: false });
    
    if (!error && data) {
      setDataSnapshots(data);
    }
  };

  const fetchDataCounts = async () => {
    const [businesses, invoices, expenses, calculations] = await Promise.all([
      supabase.from('businesses').select('id', { count: 'exact', head: true }),
      supabase.from('invoices').select('id', { count: 'exact', head: true }),
      supabase.from('expenses').select('id', { count: 'exact', head: true }),
      supabase.from('tax_calculations').select('id', { count: 'exact', head: true }),
    ]);

    setDataCounts({
      businesses: businesses.count || 0,
      invoices: invoices.count || 0,
      expenses: expenses.count || 0,
      calculations: calculations.count || 0,
    });
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'upgrade':
        return <ArrowUpRight className="h-4 w-4 text-success" />;
      case 'downgrade':
        return <ArrowDownRight className="h-4 w-4 text-warning" />;
      case 'trial_start':
        return <Clock className="h-4 w-4 text-primary" />;
      case 'trial_end':
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <History className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getChangeTypeLabel = (changeType: string) => {
    switch (changeType) {
      case 'upgrade':
        return 'Upgraded';
      case 'downgrade':
        return 'Downgraded';
      case 'trial_start':
        return 'Trial Started';
      case 'trial_end':
        return 'Trial Ended';
      default:
        return 'Changed';
    }
  };

  return (
    <PageLayout title="Account Settings" description="Manage your subscription and account" icon={Settings}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card className="glass-frosted border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <Crown className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>Your active subscription details</CardDescription>
                  </div>
                </div>
                <Badge className={TIER_COLORS[tier]}>
                  {TIER_DISPLAY_NAMES[tier]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trial Status */}
              {isOnTrial && trialDaysLeft !== null && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Trial Active</p>
                      <p className="text-sm text-muted-foreground">
                        {trialDaysLeft} days remaining in your {TIER_DISPLAY_NAMES[tier]} trial
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Account</p>
                    <p className="font-medium text-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium text-foreground">
                      {user?.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button variant="hero" onClick={() => navigate('/pricing')}>
                  <CreditCard className="h-4 w-4" />
                  {tier === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                </Button>
                <Button variant="outline" onClick={() => navigate('/security')}>
                  <Shield className="h-4 w-4" />
                  Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Your Data</CardTitle>
                  <CardDescription>Preserved across tier changes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">Businesses</span>
                </div>
                <span className="font-medium text-foreground">{dataCounts.businesses}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Invoices</span>
                </div>
                <span className="font-medium text-foreground">{dataCounts.invoices}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Receipt className="h-4 w-4" />
                  <span className="text-sm">Expenses</span>
                </div>
                <span className="font-medium text-foreground">{dataCounts.expenses}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm">Calculations</span>
                </div>
                <span className="font-medium text-foreground">{dataCounts.calculations}</span>
              </div>

              <div className="pt-4">
                <div className="rounded-lg bg-success/10 border border-success/30 p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-xs text-success font-medium">All data is preserved</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your data remains safe even if you change plans
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscription History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Subscription History</CardTitle>
                  <CardDescription>Track your plan changes over time</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : subscriptionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No subscription changes yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Your plan history will appear here when you upgrade or change plans
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptionHistory.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        {getChangeTypeIcon(item.change_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">
                            {getChangeTypeLabel(item.change_type)}
                          </span>
                          {item.previous_tier && (
                            <>
                              <span className="text-muted-foreground">from</span>
                              <Badge variant="outline" className="text-xs">
                                {TIER_DISPLAY_NAMES[item.previous_tier] || item.previous_tier}
                              </Badge>
                            </>
                          )}
                          <span className="text-muted-foreground">to</span>
                          <Badge className={TIER_COLORS[item.new_tier] || 'bg-muted'}>
                            {TIER_DISPLAY_NAMES[item.new_tier] || item.new_tier}
                          </Badge>
                        </div>
                        {item.reason && (
                          <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(item.created_at), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {format(new Date(item.created_at), 'h:mm a')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default AccountSettings;
