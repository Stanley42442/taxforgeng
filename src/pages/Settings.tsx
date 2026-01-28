import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Shield,
  Smartphone,
  History,
  LogIn,
  Key,
  Globe,
  XCircle,
  Loader2,
  Copy,
  Download,
  RefreshCw,
  Settings as SettingsIcon,
  AlertTriangle,
  MessageCircle,
  Send,
  Crown,
  CreditCard,
  Calendar,
  Database,
  CheckCircle,
  Clock,
  Building2,
  FileText,
  Receipt,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import { SecurityScoreWidget } from "@/components/SecurityScoreWidget";
import { ReportScheduleSettings } from "@/components/ReportScheduleSettings";
import { WhatsAppVerification } from "@/components/WhatsAppVerification";
import logger from "@/lib/logger";
import { safeLocalStorage } from "@/lib/safeStorage";

const nameSchema = z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters");
const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

interface AuthEvent {
  id: string;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: unknown;
  created_at: string;
}

interface MFAFactor {
  id: string;
  friendly_name?: string | null;
  factor_type: string;
  status: string;
  created_at: string;
}

interface SubscriptionHistoryItem {
  id: string;
  previous_tier: string | null;
  new_tier: string;
  change_type: string;
  reason: string | null;
  created_at: string;
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

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'login':
    case 'login_success':
      return <LogIn className="h-4 w-4 text-green-500" />;
    case 'login_failed':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'password_change':
      return <Key className="h-4 w-4 text-amber-500" />;
    case 'email_change':
      return <Mail className="h-4 w-4 text-blue-500" />;
    case '2fa_enabled':
    case '2fa_disabled':
      return <Smartphone className="h-4 w-4 text-purple-500" />;
    default:
      return <Shield className="h-4 w-4 text-muted-foreground" />;
  }
};

const getEventLabel = (eventType: string) => {
  const labels: Record<string, string> = {
    'login': 'Signed in',
    'login_success': 'Signed in successfully',
    'login_failed': 'Failed login attempt',
    'password_change': 'Password changed',
    'email_change': 'Email changed',
    '2fa_enabled': '2FA enabled',
    '2fa_disabled': '2FA disabled',
    'signup': 'Account created',
  };
  return labels[eventType] || eventType;
};

const Settings = () => {
  const { user, loading } = useAuth();
  const { tier, trialEndsAt, isOnTrial, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const trialDaysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  const [fullName, setFullName] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [mfaFactors, setMfaFactors] = useState<MFAFactor[]>([]);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [dataCounts, setDataCounts] = useState({
    businesses: 0,
    invoices: 0,
    expenses: 0,
    calculations: 0,
  });

  // Force refresh subscription data on page mount
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Parallelized data loading for performance
  useEffect(() => {
    const loadAllData = async () => {
      if (!user) return;

      try {
        const [
          profileRes,
          mfaRes,
          authEventsRes,
          historyRes,
          businessesRes,
          invoicesRes,
          expensesRes,
          calculationsRes,
        ] = await Promise.all([
          supabase.from('profiles').select('full_name, email, whatsapp_number').eq('id', user.id).maybeSingle(),
          supabase.auth.mfa.listFactors(),
          supabase.from('auth_events').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
          supabase.from('subscription_history').select('*').order('created_at', { ascending: false }).limit(20),
          supabase.from('businesses').select('id', { count: 'exact', head: true }).is('deleted_at', null),
          supabase.from('invoices').select('id', { count: 'exact', head: true }).is('deleted_at', null),
          supabase.from('expenses').select('id', { count: 'exact', head: true }).is('deleted_at', null),
          supabase.from('tax_calculations').select('id', { count: 'exact', head: true }).is('deleted_at', null),
        ]);

        // Set profile data
        if (!profileRes.error && profileRes.data) {
          setFullName(profileRes.data.full_name || "");
          setWhatsappNumber(profileRes.data.whatsapp_number || "");
        }

        // Set MFA factors
        if (!mfaRes.error && mfaRes.data) {
          setMfaFactors((mfaRes.data.totp || []) as MFAFactor[]);
        }

        // Set auth events
        if (!authEventsRes.error && authEventsRes.data) {
          setAuthEvents(authEventsRes.data as AuthEvent[]);
        }

        // Set subscription history
        if (historyRes.data) {
          setSubscriptionHistory(historyRes.data);
        }

        // Set data counts
        setDataCounts({
          businesses: businessesRes.count || 0,
          invoices: invoicesRes.count || 0,
          expenses: expensesRes.count || 0,
          calculations: calculationsRes.count || 0,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load settings data';
        logger.error("Error loading settings data:", message);
      } finally {
        setProfileLoading(false);
        setMfaLoading(false);
        setEventsLoading(false);
        setSubscriptionLoading(false);
      }
    };

    loadAllData();
  }, [user]);

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = nameSchema.safeParse(fullName);
    if (!result.success) {
      setErrors({ name: result.error.errors[0].message });
      return;
    }
    setErrors({});

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user?.id);

      if (error) throw error;

      await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = emailSchema.safeParse(newEmail);
    if (!result.success) {
      setErrors({ email: result.error.errors[0].message });
      return;
    }
    setErrors({});

    setSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;
      
      toast.success("Confirmation email sent to your new address");
      setNewEmail("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update email";
      toast.error(message);
    } finally {
      setSavingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    const result = passwordSchema.safeParse(newPassword);
    if (!result.success) {
      setErrors({ newPassword: result.error.errors[0].message });
      return;
    }
    setErrors({});

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update password";
      toast.error(message);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-6 animate-fade-in">
          {/* Header skeleton */}
          <div className="flex items-center gap-4">
            <div className="skeleton-shimmer h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <div className="skeleton-shimmer h-6 w-32 rounded" />
              <div className="skeleton-shimmer h-4 w-48 rounded" />
            </div>
          </div>
          
          {/* Tabs skeleton */}
          <div className="skeleton-shimmer h-12 w-full rounded-xl" />
          
          {/* Form skeleton */}
          <div className="glass-frosted rounded-xl p-6 space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton-shimmer h-4 w-20 rounded" />
                <div className="skeleton-shimmer h-10 w-full rounded-lg" />
              </div>
            ))}
            <div className="skeleton-shimmer h-10 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageLayout title="Settings" description="Manage your account and preferences" icon={SettingsIcon} maxWidth="4xl">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6 glass-frosted">
          <TabsTrigger value="profile" className="data-[state=active]:glow-sm">
            <User className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="data-[state=active]:glow-sm">
            <Crown className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Plan</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:glow-sm">
            <Shield className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:glow-sm">
            <MessageCircle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:glow-sm">
            <History className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="glass-frosted hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center glow-sm">
                  <User className="h-4 w-4 text-primary" />
                </div>
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="input-premium"
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1 animate-shake">{errors.name}</p>}
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input value={user.email || ""} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground mt-1">To change email, use the form below</p>
                </div>
                <div>
                  <Label>Subscription Tier</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="capitalize">{tier}</Badge>
                    <Link to="/pricing" className="text-sm text-primary hover:underline">
                      Upgrade
                    </Link>
                  </div>
                </div>
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="glass-frosted hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center glow-sm">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                Change Email
              </CardTitle>
              <CardDescription>Update your email address</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div>
                  <Label>New Email Address</Label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email"
                    className="input-premium"
                  />
                  {errors.email && <p className="text-sm text-destructive mt-1 animate-shake">{errors.email}</p>}
                </div>
                <Button type="submit" disabled={savingEmail || !newEmail}>
                  {savingEmail && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Update Email
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="glass-frosted hover-lift border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 text-destructive" />
                </div>
                App Cache
              </CardTitle>
              <CardDescription>
                If the app shows outdated content or isn't working correctly, clear the cache to get the latest version.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={async () => {
                  const toastId = toast.loading("Clearing cache...");
                  try {
                    // Unregister all service workers
                    if ('serviceWorker' in navigator) {
                      const registrations = await navigator.serviceWorker.getRegistrations();
                      await Promise.all(registrations.map(r => r.unregister()));
                    }
                    // Clear all caches
                    if ('caches' in window) {
                      const cacheNames = await caches.keys();
                      await Promise.all(cacheNames.map(name => caches.delete(name)));
                    }
                    // Clear localStorage cache version
                    safeLocalStorage.removeItem('cache-version');
                    toast.dismiss(toastId);
                    toast.success("Cache cleared! Reloading...");
                    setTimeout(() => window.location.reload(), 500);
                  } catch (error) {
                    toast.dismiss(toastId);
                    toast.error("Failed to clear cache. Please try again.");
                  }
                }}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Cache & Reload
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          {/* Current Plan Card */}
          <Card className="glass-frosted border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
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
                    <p className="font-medium text-foreground truncate">{user.email}</p>
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
              </div>
            </CardContent>
          </Card>

          {/* Data Summary Card */}
          <Card className="glass-frosted">
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Businesses</p>
                    <p className="font-medium text-foreground text-lg">{dataCounts.businesses}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Invoices</p>
                    <p className="font-medium text-foreground text-lg">{dataCounts.invoices}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                  <Receipt className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Expenses</p>
                    <p className="font-medium text-foreground text-lg">{dataCounts.expenses}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Calculations</p>
                    <p className="font-medium text-foreground text-lg">{dataCounts.calculations}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-success/10 border border-success/30 p-4 mt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm text-success font-medium">All data is preserved</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your data remains safe even if you change plans. Downgrading won't delete anything.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription History Card */}
          <Card className="glass-frosted">
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
              {subscriptionLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {subscriptionHistory.map((item) => (
                      <div
                        key={item.id}
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
                                <span className="text-muted-foreground text-sm">from</span>
                                <Badge variant="outline" className="text-xs">
                                  {TIER_DISPLAY_NAMES[item.previous_tier] || item.previous_tier}
                                </Badge>
                              </>
                            )}
                            <span className="text-muted-foreground text-sm">to</span>
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
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="glass-frosted hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center glow-sm">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                Change Password
              </CardTitle>
              <CardDescription>Update your password for better security</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="input-premium"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.newPassword && <p className="text-sm text-destructive mt-1">{errors.newPassword}</p>}
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
                </div>
                <Button type="submit" disabled={savingPassword || !newPassword}>
                  {savingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="glass-frosted hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center glow-sm">
                  <Smartphone className="h-4 w-4 text-primary" />
                </div>
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>Add an extra layer of security</CardDescription>
            </CardHeader>
            <CardContent>
              {mfaLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : mfaFactors.length > 0 ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-medium text-sm">2FA Enabled</p>
                    <p className="text-xs text-muted-foreground">Your account is protected with 2FA</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium text-sm">2FA Not Enabled</p>
                    <p className="text-xs text-muted-foreground">Consider enabling 2FA for better security</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Dashboard Link */}
          <Card className="glass-frosted hover-lift border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center glow-sm">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                Advanced Security
              </CardTitle>
              <CardDescription>
                Manage devices, IP whitelist, time restrictions, and view blocked login attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  View and manage your security settings, trusted devices, and access controls.
                </p>
                <Button asChild>
                  <Link to="/security">
                    <Shield className="h-4 w-4 mr-2" />
                    Open Security Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <WhatsAppVerification />
          <ReportScheduleSettings />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="glass-frosted hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center glow-sm">
                  <History className="h-4 w-4 text-primary" />
                </div>
                Recent Activity
              </CardTitle>
              <CardDescription>Your recent account activity</CardDescription>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : authEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {authEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                        {getEventIcon(event.event_type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{getEventLabel(event.event_type)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Settings;
