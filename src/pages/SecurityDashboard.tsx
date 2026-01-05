import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Shield, 
  LogIn, 
  XCircle, 
  Key, 
  Mail, 
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Loader2,
  Lock,
  Unlock,
  Activity,
  AlertCircle,
  Monitor,
  Trash2
} from "lucide-react";
import { NavMenu } from "@/components/NavMenu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

interface AuthEvent {
  id: string;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: unknown;
  created_at: string;
}

interface BackupCodeAttempt {
  id: string;
  user_id: string;
  attempted_at: string;
  ip_address: string | null;
}

interface KnownDevice {
  id: string;
  device_fingerprint: string;
  device_name: string | null;
  browser: string | null;
  os: string | null;
  is_trusted: boolean;
  first_seen_at: string;
  last_seen_at: string;
}

interface SecurityStats {
  totalLogins: number;
  failedAttempts: number;
  mfaEnabled: boolean;
  backupCodesRemaining: number;
  recentSuspiciousActivity: boolean;
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
      return <Lock className="h-4 w-4 text-green-500" />;
    case '2fa_disabled':
      return <Unlock className="h-4 w-4 text-amber-500" />;
    case 'backup_codes_generated':
      return <Key className="h-4 w-4 text-purple-500" />;
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
    'backup_codes_generated': 'Backup codes generated',
  };
  return labels[eventType] || eventType;
};

const getEventSeverity = (eventType: string): 'success' | 'warning' | 'error' | 'info' => {
  switch (eventType) {
    case 'login':
    case 'login_success':
    case '2fa_enabled':
    case 'backup_codes_generated':
      return 'success';
    case 'login_failed':
      return 'error';
    case '2fa_disabled':
    case 'password_change':
      return 'warning';
    default:
      return 'info';
  }
};

const SecurityDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [backupCodeAttempts, setBackupCodeAttempts] = useState<BackupCodeAttempt[]>([]);
  const [knownDevices, setKnownDevices] = useState<KnownDevice[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalLogins: 0,
    failedAttempts: 0,
    mfaEnabled: false,
    backupCodesRemaining: 0,
    recentSuspiciousActivity: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [removingDeviceId, setRemovingDeviceId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const loadSecurityData = async () => {
    if (!user) return;

    try {
      // Load auth events
      const { data: events } = await supabase
        .from('auth_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setAuthEvents((events || []) as AuthEvent[]);

      // Load backup code attempts
      const { data: attempts } = await supabase
        .from('backup_code_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('attempted_at', { ascending: false })
        .limit(20);

      setBackupCodeAttempts((attempts || []) as BackupCodeAttempt[]);

      // Load known devices
      const { data: devices } = await supabase
        .from('known_devices')
        .select('*')
        .eq('user_id', user.id)
        .order('last_seen_at', { ascending: false });

      setKnownDevices((devices || []) as KnownDevice[]);
      // Load MFA status
      const { data: mfaData } = await supabase.auth.mfa.listFactors();
      const mfaEnabled = (mfaData?.totp || []).some(f => f.status === 'verified');

      // Load backup codes count
      const { count: backupCount } = await supabase
        .from('backup_codes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('used_at', null);

      // Calculate stats
      const logins = (events || []).filter(e => 
        e.event_type === 'login' || e.event_type === 'login_success'
      ).length;
      
      const failed = (events || []).filter(e => 
        e.event_type === 'login_failed'
      ).length;

      // Check for suspicious activity (3+ failed attempts in last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentFailedAttempts = (attempts || []).filter(a => 
        new Date(a.attempted_at) > oneDayAgo
      ).length;

      setStats({
        totalLogins: logins,
        failedAttempts: failed,
        mfaEnabled,
        backupCodesRemaining: backupCount || 0,
        recentSuspiciousActivity: recentFailedAttempts >= 3
      });
    } catch (error) {
      console.error("Error loading security data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSecurityData();
  };

  const handleRemoveDevice = async (deviceId: string) => {
    if (!user) return;
    
    setRemovingDeviceId(deviceId);
    try {
      const { error } = await supabase
        .from('known_devices')
        .delete()
        .eq('id', deviceId)
        .eq('user_id', user.id);

      if (error) throw error;

      setKnownDevices(prev => prev.filter(d => d.id !== deviceId));
      toast.success("Device removed successfully");
    } catch (error) {
      console.error("Error removing device:", error);
      toast.error("Failed to remove device");
    } finally {
      setRemovingDeviceId(null);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <NavMenu />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/settings" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Security Dashboard
              </h1>
              <p className="text-muted-foreground">Monitor your account security and activity</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        {/* Suspicious Activity Alert */}
        {stats.recentSuspiciousActivity && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Suspicious Activity Detected</p>
              <p className="text-sm text-destructive/80">
                Multiple failed backup code attempts were detected in the last 24 hours. 
                If this wasn't you, please change your password and generate new backup codes.
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Logins</p>
                  <p className="text-2xl font-bold">{stats.totalLogins}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <LogIn className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed Attempts</p>
                  <p className="text-2xl font-bold">{stats.failedAttempts}</p>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  stats.failedAttempts > 0 
                    ? 'bg-destructive/10' 
                    : 'bg-muted'
                }`}>
                  <XCircle className={`h-6 w-6 ${
                    stats.failedAttempts > 0 
                      ? 'text-destructive' 
                      : 'text-muted-foreground'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">2FA Status</p>
                  <p className="text-lg font-bold">
                    {stats.mfaEnabled ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Enabled
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> Disabled
                      </span>
                    )}
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  stats.mfaEnabled 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-amber-100 dark:bg-amber-900/30'
                }`}>
                  <Smartphone className={`h-6 w-6 ${
                    stats.mfaEnabled 
                      ? 'text-green-600' 
                      : 'text-amber-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Backup Codes</p>
                  <p className="text-2xl font-bold">{stats.backupCodesRemaining}</p>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  stats.backupCodesRemaining > 3 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : stats.backupCodesRemaining > 0
                      ? 'bg-amber-100 dark:bg-amber-900/30'
                      : 'bg-muted'
                }`}>
                  <Key className={`h-6 w-6 ${
                    stats.backupCodesRemaining > 3 
                      ? 'text-green-600' 
                      : stats.backupCodesRemaining > 0
                        ? 'text-amber-600'
                        : 'text-muted-foreground'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Tabs */}
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList>
            <TabsTrigger value="devices" className="gap-2">
              <Monitor className="h-4 w-4" />
              Devices
              {knownDevices.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {knownDevices.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Activity className="h-4 w-4" />
              Security Events
            </TabsTrigger>
            <TabsTrigger value="attempts" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Failed Attempts
              {backupCodeAttempts.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                  {backupCodeAttempts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="devices">
            <Card>
              <CardHeader>
                <CardTitle>Known Devices</CardTitle>
                <CardDescription>
                  Devices that have logged into your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {knownDevices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Monitor className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No devices recorded yet</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {knownDevices.map((device) => (
                        <div 
                          key={device.id}
                          className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Monitor className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-sm">
                                  {device.device_name || 'Unknown Device'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {device.browser} on {device.os}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveDevice(device.id)}
                                disabled={removingDeviceId === device.id}
                              >
                                {removingDeviceId === device.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                First seen: {format(new Date(device.first_seen_at), 'PP')}
                              </div>
                              <div className="flex items-center gap-1">
                                <RefreshCw className="h-3 w-3" />
                                Last active: {formatDistanceToNow(new Date(device.last_seen_at), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>
                  Login activity, password changes, and 2FA updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {authEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No security events recorded yet</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {authEvents.map((event) => {
                        const severity = getEventSeverity(event.event_type);
                        return (
                          <div 
                            key={event.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border ${
                              severity === 'error' 
                                ? 'bg-destructive/5 border-destructive/20' 
                                : severity === 'warning'
                                  ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                                  : severity === 'success'
                                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                                    : 'bg-muted/50 border-border'
                            }`}
                          >
                            <div className="mt-0.5">
                              {getEventIcon(event.event_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-medium text-sm">
                                  {getEventLabel(event.event_type)}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(event.created_at), 'PPpp')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attempts">
            <Card>
              <CardHeader>
                <CardTitle>Failed Backup Code Attempts</CardTitle>
                <CardDescription>
                  Recent failed attempts to use backup codes for login
                </CardDescription>
              </CardHeader>
              <CardContent>
                {backupCodeAttempts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-70" />
                    <p className="font-medium text-green-600">No failed attempts</p>
                    <p className="text-sm">Your account has no recent failed backup code attempts</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {backupCodeAttempts.map((attempt) => (
                        <div 
                          key={attempt.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                        >
                          <div className="mt-0.5">
                            <XCircle className="h-4 w-4 text-destructive" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-sm text-destructive">
                                Failed backup code attempt
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(attempt.attempted_at), { addSuffix: true })}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(attempt.attempted_at), 'PPpp')}
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

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link to="/settings">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Link>
              </Button>
              {!stats.mfaEnabled && (
                <Button variant="default" asChild>
                  <Link to="/settings">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Enable 2FA
                  </Link>
                </Button>
              )}
              {stats.backupCodesRemaining <= 3 && stats.mfaEnabled && (
                <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50" asChild>
                  <Link to="/settings">
                    <Key className="h-4 w-4 mr-2" />
                    Generate Backup Codes
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SecurityDashboard;
