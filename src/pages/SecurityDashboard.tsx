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
  Trash2,
  Star,
  StarOff,
  Tablet,
  Laptop,
  Globe,
  Languages,
  Info
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
  browser_version: string | null;
  os: string | null;
  os_version: string | null;
  device_type: string | null;
  device_model: string | null;
  screen_resolution: string | null;
  timezone: string | null;
  language: string | null;
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
    case 'logout':
      return <LogIn className="h-4 w-4 text-blue-500 rotate-180" />;
    case 'login_failed':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'password_change':
    case 'password_recovery_initiated':
      return <Key className="h-4 w-4 text-amber-500" />;
    case 'email_change':
      return <Mail className="h-4 w-4 text-blue-500" />;
    case '2fa_enabled':
      return <Lock className="h-4 w-4 text-green-500" />;
    case '2fa_disabled':
      return <Unlock className="h-4 w-4 text-amber-500" />;
    case 'backup_codes_generated':
      return <Key className="h-4 w-4 text-purple-500" />;
    case 'signup':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'profile_updated':
      return <Shield className="h-4 w-4 text-blue-500" />;
    default:
      return <Shield className="h-4 w-4 text-muted-foreground" />;
  }
};

const getEventLabel = (eventType: string) => {
  const labels: Record<string, string> = {
    'login': 'Signed in',
    'login_success': 'Signed in successfully',
    'login_failed': 'Failed login attempt',
    'logout': 'Signed out',
    'password_change': 'Password changed',
    'password_recovery_initiated': 'Password recovery started',
    'email_change': 'Email changed',
    '2fa_enabled': '2FA enabled',
    '2fa_disabled': '2FA disabled',
    'signup': 'Account created',
    'backup_codes_generated': 'Backup codes generated',
    'profile_updated': 'Profile updated',
  };
  return labels[eventType] || eventType;
};

const getEventSeverity = (eventType: string): 'success' | 'warning' | 'error' | 'info' => {
  switch (eventType) {
    case 'login':
    case 'login_success':
    case '2fa_enabled':
    case 'backup_codes_generated':
    case 'signup':
      return 'success';
    case 'login_failed':
      return 'error';
    case '2fa_disabled':
    case 'password_change':
    case 'password_recovery_initiated':
      return 'warning';
    case 'logout':
    case 'profile_updated':
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
  const [togglingTrustId, setTogglingTrustId] = useState<string | null>(null);

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
    
    const device = knownDevices.find(d => d.id === deviceId);
    
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

      // Send email notification about device removal
      if (user.email && device) {
        supabase.functions.invoke('send-security-alert', {
          body: {
            userEmail: user.email,
            alertType: 'device_removed',
            timestamp: new Date().toLocaleString(),
            deviceInfo: {
              browser: device.browser || 'Unknown',
              os: device.os || 'Unknown',
              deviceName: device.device_name || 'Unknown Device'
            }
          }
        }).catch(err => console.error('Failed to send device removal alert:', err));
      }
    } catch (error) {
      console.error("Error removing device:", error);
      toast.error("Failed to remove device");
    } finally {
      setRemovingDeviceId(null);
    }
  };

  const handleToggleTrust = async (deviceId: string, currentTrusted: boolean) => {
    if (!user) return;
    
    setTogglingTrustId(deviceId);
    try {
      const { error } = await supabase
        .from('known_devices')
        .update({ is_trusted: !currentTrusted })
        .eq('id', deviceId)
        .eq('user_id', user.id);

      if (error) throw error;

      setKnownDevices(prev => prev.map(d => 
        d.id === deviceId ? { ...d, is_trusted: !currentTrusted } : d
      ));
      toast.success(currentTrusted ? "Device removed from trusted list" : "Device marked as trusted");
    } catch (error) {
      console.error("Error updating device trust status:", error);
      toast.error("Failed to update device");
    } finally {
      setTogglingTrustId(null);
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
          <TabsList className="flex-wrap">
            <TabsTrigger value="devices" className="gap-2">
              <Monitor className="h-4 w-4" />
              Devices
              {knownDevices.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {knownDevices.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <Activity className="h-4 w-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Shield className="h-4 w-4" />
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
                          className={`p-4 rounded-lg border bg-card ${device.is_trusted ? 'border-green-200 dark:border-green-800' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${device.is_trusted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary/10'}`}>
                              {device.device_type === 'mobile' ? (
                                <Smartphone className={`h-6 w-6 ${device.is_trusted ? 'text-green-600' : 'text-primary'}`} />
                              ) : device.device_type === 'tablet' ? (
                                <Tablet className={`h-6 w-6 ${device.is_trusted ? 'text-green-600' : 'text-primary'}`} />
                              ) : (
                                <Laptop className={`h-6 w-6 ${device.is_trusted ? 'text-green-600' : 'text-primary'}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-medium text-sm">
                                      {device.device_model || device.device_name || 'Unknown Device'}
                                    </p>
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {device.device_type || 'desktop'}
                                    </Badge>
                                    {device.is_trusted && (
                                      <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20 text-xs">
                                        Trusted
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {device.browser}{device.browser_version ? ` v${device.browser_version}` : ''} on {device.os}{device.os_version ? ` ${device.os_version}` : ''}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={device.is_trusted ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                                    onClick={() => handleToggleTrust(device.id, device.is_trusted)}
                                    disabled={togglingTrustId === device.id}
                                    title={device.is_trusted ? "Remove from trusted devices" : "Mark as trusted device"}
                                  >
                                    {togglingTrustId === device.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : device.is_trusted ? (
                                      <StarOff className="h-4 w-4" />
                                    ) : (
                                      <Star className="h-4 w-4" />
                                    )}
                                  </Button>
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
                              </div>
                              
                              {/* Device Details Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                                {device.screen_resolution && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Monitor className="h-3 w-3" />
                                    <span>{device.screen_resolution}</span>
                                  </div>
                                )}
                                {device.timezone && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Globe className="h-3 w-3" />
                                    <span className="truncate" title={device.timezone}>
                                      {device.timezone.split('/').pop()?.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                )}
                                {device.language && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Languages className="h-3 w-3" />
                                    <span>{device.language}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Timestamps */}
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
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  Manage your active login sessions across devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Session */}
                  <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm flex items-center gap-2">
                            Current Session
                            <Badge variant="default" className="text-xs">Active</Badge>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                             navigator.userAgent.includes('Firefox') ? 'Firefox' :
                             navigator.userAgent.includes('Safari') ? 'Safari' : 'Browser'} on {
                             navigator.userAgent.includes('Windows') ? 'Windows' :
                             navigator.userAgent.includes('Mac') ? 'macOS' :
                             navigator.userAgent.includes('Linux') ? 'Linux' :
                             navigator.userAgent.includes('Android') ? 'Android' :
                             navigator.userAgent.includes('iPhone') ? 'iOS' : 'Unknown OS'
                            }
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        This device
                      </Badge>
                    </div>
                  </div>

                  {/* Other sessions info */}
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Session Management</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          For security, you can sign out of all other devices by clicking the button below. 
                          This will invalidate all sessions except your current one.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sign out all button */}
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={async () => {
                      try {
                        // Sign out from all sessions except current
                        const { error } = await supabase.auth.signOut({ scope: 'others' });
                        if (error) throw error;
                        toast.success("Signed out of all other devices successfully");
                      } catch (error: any) {
                        toast.error(error.message || "Failed to sign out of other devices");
                      }
                    }}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Sign Out All Other Devices
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Last login: {user?.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'PPpp') : 'Unknown'}
                  </p>
                </div>
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
