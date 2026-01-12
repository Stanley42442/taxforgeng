import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Send
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import { SecurityScoreWidget } from "@/components/SecurityScoreWidget";
import { ReportScheduleSettings } from "@/components/ReportScheduleSettings";
import { WhatsAppVerification } from "@/components/WhatsAppVerification";

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
  const { tier } = useSubscription();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, email, whatsapp_number')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setFullName(data?.full_name || "");
        setWhatsappNumber(data?.whatsapp_number || "");
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    const loadMfaFactors = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;
        setMfaFactors((data?.totp || []) as MFAFactor[]);
      } catch (error) {
        console.error("Error loading MFA factors:", error);
      } finally {
        setMfaLoading(false);
      }
    };

    loadMfaFactors();
  }, [user]);

  useEffect(() => {
    const loadAuthEvents = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('auth_events')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setAuthEvents((data || []) as AuthEvent[]);
      } catch (error) {
        console.error("Error loading auth events:", error);
      } finally {
        setEventsLoading(false);
      }
    };

    loadAuthEvents();
  }, [user]);

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
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
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
    } catch (error: any) {
      toast.error(error.message || "Failed to update email");
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
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
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
        <TabsList className="grid w-full grid-cols-4 mb-6 glass-frosted">
          <TabsTrigger value="profile" className="data-[state=active]:glow-sm">
            <User className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Profile</span>
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
