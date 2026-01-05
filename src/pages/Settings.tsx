import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
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
  Monitor,
  XCircle,
  Loader2
} from "lucide-react";
import { NavMenu } from "@/components/NavMenu";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";

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

  // Profile state
  const [fullName, setFullName] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Email state
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA state
  const [mfaFactors, setMfaFactors] = useState<MFAFactor[]>([]);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [mfaEnrolling, setMfaEnrolling] = useState(false);
  const [mfaVerifying, setMfaVerifying] = useState(false);

  // Activity log state
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setFullName(data?.full_name || "");
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Load MFA factors
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

  // Load auth events
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

  // Log auth event helper
  const logAuthEvent = async (eventType: string, metadata: object = {}) => {
    if (!user) return;
    
    try {
      await supabase.from('auth_events').insert([{
        user_id: user.id,
        event_type: eventType,
        metadata: metadata as unknown,
      }] as any);
      
      // Refresh events list
      const { data } = await supabase
        .from('auth_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) setAuthEvents(data as AuthEvent[]);
    } catch (error) {
      console.error("Error logging auth event:", error);
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

      toast.success("Profile updated successfully!");
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

      await logAuthEvent('email_change', { new_email: newEmail });
      toast.success("Verification email sent! Check your inbox to confirm the new email.");
      setNewEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update email");
    } finally {
      setSavingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPwResult = passwordSchema.safeParse(newPassword);
    if (!newPwResult.success) {
      setErrors({ newPassword: newPwResult.error.errors[0].message });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }
    setErrors({});

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      await logAuthEvent('password_change');
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  // 2FA Setup
  const handleStartMfaEnrollment = async () => {
    setMfaEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App'
      });

      if (error) throw error;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setTotpSecret(data.totp.secret);
      setShowMfaSetup(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to start 2FA setup");
    } finally {
      setMfaEnrolling(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!factorId || verifyCode.length !== 6) return;

    setMfaVerifying(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode
      });

      if (verifyError) throw verifyError;

      await logAuthEvent('2fa_enabled');
      
      // Refresh MFA factors
      const { data: factors } = await supabase.auth.mfa.listFactors();
      setMfaFactors((factors?.totp || []) as MFAFactor[]);

      setShowMfaSetup(false);
      setVerifyCode("");
      setQrCode(null);
      setTotpSecret(null);
      setFactorId(null);
      
      toast.success("Two-factor authentication enabled successfully!");
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code");
    } finally {
      setMfaVerifying(false);
    }
  };

  const handleDisableMfa = async (factorId: string) => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;

      await logAuthEvent('2fa_disabled');

      // Refresh MFA factors
      const { data: factors } = await supabase.auth.mfa.listFactors();
      setMfaFactors((factors?.totp || []) as MFAFactor[]);

      toast.success("Two-factor authentication disabled");
    } catch (error: any) {
      toast.error(error.message || "Failed to disable 2FA");
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isEmailVerified = user?.email_confirmed_at != null;
  const hasMfaEnabled = mfaFactors.some(f => f.status === 'verified');

  return (
    <div className="min-h-screen bg-background">
      <NavMenu />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile and security settings</p>
        </div>

        <div className="space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Account Status
                  </CardTitle>
                  <CardDescription>Your account information and verification status</CardDescription>
                </div>
                <Badge variant={tier === 'free' ? 'secondary' : 'default'} className="capitalize">
                  {tier} Plan
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user?.email}</span>
                {isEmailVerified ? (
                  <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-amber-600 border-amber-600">
                    <AlertCircle className="h-3 w-3" />
                    Unverified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Two-Factor Authentication</span>
                {hasMfaEnabled ? (
                  <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-amber-600 border-amber-600">
                    <AlertCircle className="h-3 w-3" />
                    Disabled
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your display name</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    placeholder="John Doe"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? "Saving..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account using an authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mfaLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : hasMfaEnabled ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        2FA is enabled
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Your account is protected with an authenticator app
                      </p>
                    </div>
                  </div>
                  {mfaFactors.filter(f => f.status === 'verified').map((factor) => (
                    <div key={factor.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{factor.friendly_name || 'Authenticator App'}</p>
                          <p className="text-xs text-muted-foreground">
                            Added {formatDistanceToNow(new Date(factor.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDisableMfa(factor.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use an authenticator app like Google Authenticator, Authy, or 1Password to generate 
                    one-time codes for signing in.
                  </p>
                  <Button onClick={handleStartMfaEnrollment} disabled={mfaEnrolling}>
                    {mfaEnrolling ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Setting up...
                      </>
                    ) : (
                      "Enable 2FA"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email Address
              </CardTitle>
              <CardDescription>Change your email address (requires verification)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentEmail">Current Email</Label>
                  <Input
                    id="currentEmail"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newEmail">New Email</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    placeholder="newemail@example.com"
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <Button type="submit" disabled={savingEmail || !newEmail}>
                  {savingEmail ? "Sending..." : "Update Email"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, newPassword: "" }));
                      }}
                      placeholder="••••••••"
                      className={errors.newPassword ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-sm text-destructive">{errors.newPassword}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    placeholder="••••••••"
                    className={errors.confirmPassword ? 'border-destructive' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
                <Button type="submit" disabled={savingPassword || !newPassword || !confirmPassword}>
                  {savingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your recent account security events</CardDescription>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading activity...
                </div>
              ) : authEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity to display.</p>
              ) : (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {authEvents.map((event) => (
                      <div 
                        key={event.id} 
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        {getEventIcon(event.event_type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{getEventLabel(event.event_type)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                          </p>
                          {event.ip_address && (
                            <div className="flex items-center gap-1 mt-1">
                              <Globe className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{event.ip_address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={() => toast.info("Please contact support to delete your account.")}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 2FA Setup Dialog */}
      <Dialog open={showMfaSetup} onOpenChange={setShowMfaSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app, then enter the 6-digit code to verify.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {qrCode && (
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            )}
            {totpSecret && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">
                  Can't scan? Enter this code manually:
                </p>
                <code className="text-sm font-mono break-all">{totpSecret}</code>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="verifyCode">Verification Code</Label>
              <Input
                id="verifyCode"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>
            <Button 
              onClick={handleVerifyMfa} 
              className="w-full"
              disabled={verifyCode.length !== 6 || mfaVerifying}
            >
              {mfaVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify and Enable"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
