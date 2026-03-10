import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PageLayout } from "@/components/PageLayout";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Info,
  MapPin,
  History,
  Ban,
  ShieldCheck,
  Wifi,
  WifiOff
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { getDeviceInfo } from "@/lib/deviceFingerprint";
import { IPWhitelistManager } from "@/components/IPWhitelistManager";
import { TimeAccessManager } from "@/components/TimeAccessManager";
import { SecurityAnalytics } from "@/components/SecurityAnalytics";
import { NotificationDeliveryLog } from "@/components/NotificationDeliveryLog";
import { BlockedLoginAttemptsLog } from "@/components/BlockedLoginAttemptsLog";
import { getErrorMessage } from "@/lib/errorUtils";
import logger from "@/lib/logger";

interface LocationData {
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
}

interface AuthEvent {
  id: string;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: unknown;
  created_at: string;
  location?: LocationData | null;
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
  is_blocked: boolean;
  first_seen_at: string;
  last_seen_at: string;
  last_country: string | null;
  last_city: string | null;
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
    case 'sessions_revoked':
      return <Lock className="h-4 w-4 text-amber-500" />;
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
    'sessions_revoked': 'Signed out all other devices',
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
    case 'sessions_revoked':
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
  const [togglingBlockId, setTogglingBlockId] = useState<string | null>(null);
  const [isSigningOutOthers, setIsSigningOutOthers] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [loginHistory, setLoginHistory] = useState<AuthEvent[]>([]);
  
  // Realtime presence for active devices
  const [activeDevices, setActiveDevices] = useState<{ fingerprint: string; browser: string; os: string; deviceType: string; lastSeen: string }[]>([]);
  const [currentFingerprint, setCurrentFingerprint] = useState<string | null>(null);
  
  // 2FA verification states for unblocking devices
  const [showUnblockDialog, setShowUnblockDialog] = useState(false);
  const [unblockDeviceId, setUnblockDeviceId] = useState<string | null>(null);
  const [unblockTotpCode, setUnblockTotpCode] = useState("");
  const [unblockBackupCode, setUnblockBackupCode] = useState("");
  const [useBackupCodeForUnblock, setUseBackupCodeForUnblock] = useState(false);
  const [isVerifyingUnblock, setIsVerifyingUnblock] = useState(false);

  // Hash function for backup code verification
  const hashCode = async (code: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(code.toUpperCase().replace(/-/g, ''));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Realtime presence tracking for active devices
  useEffect(() => {
    if (!user) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupPresence = async () => {
      const deviceInfo = await getDeviceInfo();
      setCurrentFingerprint(deviceInfo.fingerprint);

      channel = supabase.channel(`user-presence:${user.id}`, {
        config: { presence: { key: deviceInfo.fingerprint } }
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel?.presenceState() || {};
          const devices: { fingerprint: string; browser: string; os: string; deviceType: string; lastSeen: string }[] = [];
          
          Object.keys(state).forEach((key) => {
            const presences = state[key] as any[];
            if (presences && presences.length > 0) {
              const presence = presences[0];
              devices.push({
                fingerprint: key,
                browser: presence.browser || 'Unknown',
                os: presence.os || 'Unknown',
                deviceType: presence.deviceType || 'desktop',
                lastSeen: presence.lastSeen || new Date().toISOString()
              });
            }
          });
          
          setActiveDevices(devices);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel?.track({
              browser: deviceInfo.browser,
              os: deviceInfo.os,
              deviceType: deviceInfo.deviceType,
              deviceModel: deviceInfo.deviceModel,
              lastSeen: new Date().toISOString()
            });
          }
        });
    };

    setupPresence();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user]);

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

      // Cast and set auth events with location data
      const typedEvents = (events || []) as AuthEvent[];
      setAuthEvents(typedEvents);

      // Filter login events for login history and fetch locations
      const loginEvents = typedEvents.filter(e => 
        e.event_type === 'login' || e.event_type === 'login_success'
      );
      
      // Fetch locations for login events that don't have them
      const eventsWithLocations = await Promise.all(
        loginEvents.map(async (event) => {
          // Check if location is already in metadata
          const metadata = event.metadata as { location?: LocationData } | null;
          if (metadata?.location) {
            return { ...event, location: metadata.location };
          }
          
          // Fetch location if IP exists and no cached location
          if (event.ip_address && event.ip_address !== '127.0.0.1') {
            try {
              const { data: locationData } = await supabase.functions.invoke('get-ip-location', {
                body: { ip: event.ip_address }
              });
              if (locationData && !locationData.error) {
                return { 
                  ...event, 
                  location: {
                    city: locationData.city,
                    region: locationData.region,
                    country: locationData.country,
                    country_code: locationData.country_code
                  }
                };
              }
            } catch (err) {
              logger.error('Failed to get location for IP:', event.ip_address, err);
            }
          }
          return event;
        })
      );
      
      setLoginHistory(eventsWithLocations);

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
      const logins = loginEvents.length;
      
      const failed = typedEvents.filter(e => 
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
      logger.error("Error loading security data:", error);
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
        }).catch(err => logger.error('Failed to send device removal alert:', err));
      }
    } catch (error) {
      logger.error("Error removing device:", error);
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
      logger.error("Error updating device trust status:", error);
      toast.error("Failed to update device");
    } finally {
      setTogglingTrustId(null);
    }
  };

  const handleToggleBlock = async (deviceId: string, currentBlocked: boolean) => {
    if (!user) return;
    
    // If trying to unblock and 2FA is enabled, require verification
    if (currentBlocked && stats.mfaEnabled) {
      setUnblockDeviceId(deviceId);
      setUnblockTotpCode("");
      setShowUnblockDialog(true);
      return;
    }
    
    // Otherwise proceed with blocking/unblocking (no 2FA needed for blocking)
    await executeToggleBlock(deviceId, currentBlocked);
  };

  const executeToggleBlock = async (deviceId: string, currentBlocked: boolean) => {
    if (!user) return;
    
    const device = knownDevices.find(d => d.id === deviceId);
    
    setTogglingBlockId(deviceId);
    try {
      const { error } = await supabase
        .from('known_devices')
        .update({ is_blocked: !currentBlocked })
        .eq('id', deviceId)
        .eq('user_id', user.id);

      if (error) throw error;

      setKnownDevices(prev => prev.map(d => 
        d.id === deviceId ? { ...d, is_blocked: !currentBlocked } : d
      ));
      toast.success(currentBlocked ? "Device unblocked successfully" : "Device blocked - it won't be able to log in");

      // Send email notification when blocking a device
      if (!currentBlocked && user.email && device) {
        supabase.functions.invoke('send-security-alert', {
          body: {
            userEmail: user.email,
            alertType: 'device_blocked',
            timestamp: new Date().toLocaleString(),
            deviceInfo: {
              browser: device.browser || 'Unknown',
              os: device.os || 'Unknown',
              deviceName: device.device_name || 'Unknown Device'
            }
          }
        }).catch(err => logger.error('Failed to send device blocked alert:', err));
      }
    } catch (error) {
      logger.error("Error updating device block status:", error);
      toast.error("Failed to update device");
    } finally {
      setTogglingBlockId(null);
    }
  };

  const handleUnblockWithMfa = async () => {
    if (!user || !unblockDeviceId) return;
    
    // Validate input based on mode
    if (useBackupCodeForUnblock) {
      if (!unblockBackupCode || unblockBackupCode.length < 8) {
        toast.error("Please enter a valid backup code");
        return;
      }
    } else {
      if (unblockTotpCode.length !== 6) {
        toast.error("Please enter a valid 6-digit code");
        return;
      }
    }
    
    setIsVerifyingUnblock(true);
    try {
      if (useBackupCodeForUnblock) {
        // Verify using backup code
        const codeHash = await hashCode(unblockBackupCode);
        
        // Check if backup code exists and is unused
        const { data: codes, error: fetchError } = await supabase
          .from('backup_codes')
          .select('id, used_at')
          .eq('user_id', user.id)
          .eq('code_hash', codeHash)
          .single();

        if (fetchError || !codes) {
          toast.error("Invalid backup code. Please try again.");
          return;
        }

        if (codes.used_at) {
          toast.error("This backup code has already been used.");
          return;
        }

        // Mark backup code as used
        await supabase
          .from('backup_codes')
          .update({ used_at: new Date().toISOString() })
          .eq('id', codes.id);

        // Verification successful with backup code
        setShowUnblockDialog(false);
        await executeToggleBlock(unblockDeviceId, true);
        
        // Log the security event
        await supabase.from('auth_events').insert({
          user_id: user.id,
          event_type: 'device_unblocked_with_backup_code',
          user_agent: navigator.userAgent,
          metadata: { device_id: unblockDeviceId }
        });
        
        toast.success("Device unblocked successfully. Note: The backup code used has been consumed.");
        
      } else {
        // Verify using TOTP
        const { data: factorsData } = await supabase.auth.mfa.listFactors();
        const verifiedFactor = factorsData?.totp?.find(f => f.status === 'verified');
        
        if (!verifiedFactor) {
          toast.error("No verified 2FA factor found");
          return;
        }
        
        // Create and verify challenge
        const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId: verifiedFactor.id
        });
        
        if (challengeError) throw challengeError;
        
        const { error: verifyError } = await supabase.auth.mfa.verify({
          factorId: verifiedFactor.id,
          challengeId: challengeData.id,
          code: unblockTotpCode
        });
        
        if (verifyError) {
          toast.error("Invalid verification code. Please try again.");
          return;
        }
        
        // Verification successful, proceed with unblocking
        setShowUnblockDialog(false);
        await executeToggleBlock(unblockDeviceId, true);
        
        // Log the security event
        await supabase.from('auth_events').insert({
          user_id: user.id,
          event_type: 'device_unblocked_with_mfa',
          user_agent: navigator.userAgent,
          metadata: { device_id: unblockDeviceId }
        });
      }
      
    } catch (error) {
      logger.error("Error verifying:", error);
      toast.error(getErrorMessage(error, "Failed to verify. Please try again."));
    } finally {
      setIsVerifyingUnblock(false);
      setUnblockTotpCode("");
      setUnblockBackupCode("");
      setUnblockDeviceId(null);
      setUseBackupCodeForUnblock(false);
    }
  };

  if (loading || isLoading) {
    return (
      <PageLayout title="Security Dashboard" icon={Shield} maxWidth="6xl">
        <div className="space-y-6 animate-fade-in">
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-frosted rounded-xl p-5">
                <div className="skeleton-shimmer h-3 w-24 mb-3 rounded" />
                <div className="skeleton-shimmer h-8 w-32 mb-2 rounded" />
                <div className="skeleton-shimmer h-3 w-16 rounded" />
              </div>
            ))}
          </div>
          
          {/* Tabs skeleton */}
          <div className="glass-frosted rounded-xl p-6">
            <div className="flex gap-2 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton-shimmer h-10 w-24 rounded-lg" />
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border/30">
                  <div className="skeleton-shimmer h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton-shimmer h-4 w-3/4 rounded" />
                    <div className="skeleton-shimmer h-3 w-1/2 rounded" />
                  </div>
                  <div className="skeleton-shimmer h-8 w-20 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Security Dashboard" 
      description="Monitor your account security" 
      icon={Shield} 
      maxWidth="6xl"
      headerActions={
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="shrink-0">
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      }
    >

        {/* Suspicious Activity Alert */}
        {stats.recentSuspiciousActivity && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Suspicious Activity Detected</p>
              <p className="text-sm text-destructive/80">
                Multiple failed backup code attempts detected in the last 24 hours
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
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <LogIn className="h-6 w-6 text-success" />
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
                    ? 'bg-success/10' 
                    : 'bg-warning/10'
                }`}>
                  <Smartphone className={`h-6 w-6 ${
                    stats.mfaEnabled 
                      ? 'text-success' 
                      : 'text-warning'
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
                    ? 'bg-success/10' 
                    : stats.backupCodesRemaining > 0
                      ? 'bg-warning/10'
                      : 'bg-muted'
                }`}>
                  <Key className={`h-6 w-6 ${
                    stats.backupCodesRemaining > 3 
                      ? 'text-success' 
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
        <Tabs defaultValue="analytics" className="space-y-4">
          <div className="overflow-x-auto -mx-4 px-4">
            <TabsList className="inline-flex h-auto flex-wrap gap-1 p-1 w-auto min-w-full sm:min-w-0">
              <TabsTrigger value="analytics" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
                <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="restrictions" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Access Rules
              </TabsTrigger>
              <TabsTrigger value="devices" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
                <Monitor className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Devices</span>
                <span className="xs:hidden">Dev</span>
                {knownDevices.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {knownDevices.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sessions" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
                <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Sessions
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
                <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Login History</span>
                <span className="xs:hidden">History</span>
                {loginHistory.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {loginHistory.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Security Events</span>
                <span className="xs:hidden">Events</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Notifications</span>
                <span className="xs:hidden">Notif</span>
              </TabsTrigger>
              <TabsTrigger value="blocked" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
                <Ban className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Blocked Logins</span>
                <span className="xs:hidden">Blocked</span>
              </TabsTrigger>
              <TabsTrigger value="attempts" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Failed Attempts</span>
                <span className="xs:hidden">Failed</span>
                {backupCodeAttempts.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                    {backupCodeAttempts.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <SecurityAnalytics authEvents={authEvents} loginHistory={loginHistory} />
          </TabsContent>

          {/* Access Restrictions Tab */}
          <TabsContent value="restrictions" className="space-y-6">
            {user && (
              <>
                <IPWhitelistManager userId={user.id} />
                <TimeAccessManager userId={user.id} />
              </>
            )}
          </TabsContent>

          <TabsContent value="devices">
            <Card className="overflow-hidden">
              <CardHeader className="px-3 sm:px-6">
                <CardTitle>Known Devices</CardTitle>
                <CardDescription>
                  Devices that have accessed your account
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-4">
                {knownDevices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Monitor className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No known devices yet</p>
                  </div>
                ) : (
                  <div className="h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                    <div className="space-y-3 mr-2">
                      {knownDevices.map((device) => (
                        <div 
                          key={device.id}
                          className={`p-3 rounded-lg border bg-card ${
                            device.is_blocked 
                              ? 'border-destructive/50 bg-destructive/5' 
                              : device.is_trusted 
                                ? 'border-green-200 dark:border-green-800' 
                                : ''
                          }`}
                        >
                          <div className="flex items-start gap-2 w-full">
                            <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${
                              device.is_blocked 
                                ? 'bg-destructive/10' 
                                : device.is_trusted 
                                   ? 'bg-success/10' 
                                   : 'bg-primary/10'
                            }`}>
                              {device.is_blocked ? (
                                <Ban className="h-4 w-4 text-destructive" />
                              ) : device.device_type === 'mobile' ? (
                                <Smartphone className={`h-4 w-4 ${device.is_trusted ? 'text-success' : 'text-primary'}`} />
                              ) : device.device_type === 'tablet' ? (
                                <Tablet className={`h-4 w-4 ${device.is_trusted ? 'text-success' : 'text-primary'}`} />
                              ) : (
                                <Laptop className={`h-4 w-4 ${device.is_trusted ? 'text-green-600' : 'text-primary'}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                              {/* Header: Name + Actions */}
                              <div className="flex items-start justify-between gap-1">
                                <div className="min-w-0 flex-1">
                                  <p className={`font-medium text-sm truncate ${device.is_blocked ? 'text-destructive' : ''}`}>
                                    {device.device_model || device.device_name || 'Unknown Device'}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    {device.browser}{device.browser_version ? ` ${device.browser_version}` : ''} · {device.os}
                                  </p>
                                </div>
                                <div className="flex items-center shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-7 w-7 ${device.is_blocked 
                                      ? "text-green-600 hover:text-green-700 hover:bg-green-50" 
                                      : "text-destructive hover:text-destructive hover:bg-destructive/10"
                                    }`}
                                    onClick={() => handleToggleBlock(device.id, device.is_blocked)}
                                    disabled={togglingBlockId === device.id}
                                  >
                                    {togglingBlockId === device.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : device.is_blocked ? (
                                      <ShieldCheck className="h-3.5 w-3.5" />
                                    ) : (
                                      <Ban className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                  {!device.is_blocked && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`h-7 w-7 ${device.is_trusted ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}`}
                                      onClick={() => handleToggleTrust(device.id, device.is_trusted)}
                                      disabled={togglingTrustId === device.id}
                                    >
                                      {togglingTrustId === device.id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : device.is_trusted ? (
                                        <StarOff className="h-3.5 w-3.5" />
                                      ) : (
                                        <Star className="h-3.5 w-3.5" />
                                      )}
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleRemoveDevice(device.id)}
                                    disabled={removingDeviceId === device.id}
                                  >
                                    {removingDeviceId === device.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Badges */}
                              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                <Badge variant="outline" className="text-[10px] capitalize h-5 px-1.5">
                                  {device.device_type || 'desktop'}
                                </Badge>
                                {device.is_blocked && (
                                  <Badge variant="destructive" className="text-[10px] h-5 px-1.5">Blocked</Badge>
                                )}
                                {device.is_trusted && !device.is_blocked && (
                                  <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20 text-[10px] h-5 px-1.5">Trusted</Badge>
                                )}
                              </div>
                              
                              {/* Location */}
                              {(device.last_city || device.last_country) && (
                                <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-primary shrink-0" />
                                  <span className="truncate">{[device.last_city, device.last_country].filter(Boolean).join(', ')}</span>
                                </p>
                              )}
                              
                              {/* Details */}
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-muted-foreground">
                                {device.screen_resolution && (
                                  <span className="flex items-center gap-1">
                                    <Monitor className="h-3 w-3" />
                                    {device.screen_resolution}
                                  </span>
                                )}
                                {device.timezone && (
                                  <span className="flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    {device.timezone.split('/').pop()?.replace(/_/g, ' ')}
                                  </span>
                                )}
                                {device.language && (
                                  <span className="flex items-center gap-1">
                                    <Languages className="h-3 w-3" />
                                    {device.language}
                                  </span>
                                )}
                              </div>
                              
                              {/* Timestamps */}
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  First seen: {format(new Date(device.first_seen_at), 'PP')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <RefreshCw className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(device.last_seen_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active Sessions
                </CardTitle>
                <CardDescription>
                  Devices currently online
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Currently Active Devices */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span>Currently Online ({activeDevices.length})</span>
                    </div>
                    
                    {activeDevices.length === 0 ? (
                      <div className="p-4 rounded-lg border bg-muted/30 text-center text-sm text-muted-foreground">
                        <WifiOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No active sessions detected</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activeDevices.map((device) => {
                          const isCurrentDevice = device.fingerprint === currentFingerprint;
                          const matchingDevice = knownDevices.find(d => d.device_fingerprint === device.fingerprint);
                          
                          return (
                            <div 
                              key={device.fingerprint}
                              className={`p-3 rounded-lg border ${
                                isCurrentDevice 
                                  ? 'border-primary bg-primary/5' 
                                  : 'bg-card hover:bg-muted/50'
                              } transition-colors`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${
                                  isCurrentDevice ? 'bg-primary/10' : 'bg-green-100 dark:bg-green-900/30'
                                }`}>
                                  {device.deviceType === 'mobile' ? (
                                    <Smartphone className={`h-4 w-4 ${isCurrentDevice ? 'text-primary' : 'text-green-600'}`} />
                                  ) : device.deviceType === 'tablet' ? (
                                    <Tablet className={`h-4 w-4 ${isCurrentDevice ? 'text-primary' : 'text-green-600'}`} />
                                  ) : (
                                    <Laptop className={`h-4 w-4 ${isCurrentDevice ? 'text-primary' : 'text-green-600'}`} />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="font-medium text-sm truncate">
                                      {matchingDevice?.device_model || matchingDevice?.device_name || `${device.browser} on ${device.os}`}
                                    </p>
                                    <div className="flex items-center gap-1">
                                      <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                      </span>
                                      <span className="text-[10px] text-green-600 font-medium">Online</span>
                                    </div>
                                    {isCurrentDevice && (
                                      <Badge variant="outline" className="text-primary border-primary/30 text-[10px] h-5 px-1.5">
                                        This Device
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {device.browser} on {device.os}
                                    {matchingDevice?.last_city && ` · ${matchingDevice.last_city}`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Session Management Info */}
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Session Management</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Use the Sign Out All button below to end all sessions except this one
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sign out all button */}
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    disabled={isSigningOutOthers}
                    onClick={async () => {
                      if (!user) return;
                      setIsSigningOutOthers(true);
                      try {
                        // Sign out from all sessions except current
                        const { error } = await supabase.auth.signOut({ scope: 'others' });
                        if (error) throw error;
                        
                        // Send email notification
                        if (user.email) {
                          supabase.functions.invoke('send-security-alert', {
                            body: {
                              userEmail: user.email,
                              alertType: 'sessions_revoked',
                              timestamp: new Date().toLocaleString(),
                            }
                          }).catch(err => logger.error('Failed to send session revocation alert:', err));
                        }
                        
                        // Log the event
                        await supabase.from('auth_events').insert({
                          user_id: user.id,
                          event_type: 'sessions_revoked',
                          ip_address: null,
                          user_agent: navigator.userAgent,
                        });
                        
                        toast.success("Signed out of all other devices successfully");
                      } catch (error) {
                        toast.error(getErrorMessage(error, "Failed to sign out of other devices"));
                      } finally {
                        setIsSigningOutOthers(false);
                      }
                    }}
                  >
                    {isSigningOutOthers ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4 mr-2" />
                    )}
                    Sign Out All Other Devices
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Last Login: {user?.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'PPpp') : 'Unknown'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Login History
                  </CardTitle>
                  <CardDescription>
                    Recent successful sign-ins to your account
                  </CardDescription>
                </div>
                {loginHistory.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={isClearingHistory}
                    onClick={async () => {
                      if (!user) return;
                      setIsClearingHistory(true);
                      try {
                        // Delete login events only
                        const { error } = await supabase
                          .from('auth_events')
                          .delete()
                          .eq('user_id', user.id)
                          .in('event_type', ['login', 'login_success']);
                        
                        if (error) throw error;
                        
                        setLoginHistory([]);
                        setAuthEvents(prev => prev.filter(e => 
                          e.event_type !== 'login' && e.event_type !== 'login_success'
                        ));
                        setStats(prev => ({ ...prev, totalLogins: 0 }));
                        toast.success("Login history cleared successfully");
                      } catch (error) {
                        toast.error(getErrorMessage(error, "Failed to clear login history"));
                      } finally {
                        setIsClearingHistory(false);
                      }
                    }}
                  >
                    {isClearingHistory ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline ml-1.5">Clear History</span>
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {loginHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No login history available</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {loginHistory.map((event) => (
                        <div 
                          key={event.id}
                          className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <LogIn className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                              <p className="font-medium text-sm">
                                Signed in successfully
                              </p>
                              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground shrink-0">
                                <Clock className="h-3 w-3" />
                                <span className="truncate">{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</span>
                              </div>
                            </div>
                            
                            {/* Location Info */}
                            {event.location && (event.location.city || event.location.country) && (
                              <div className="flex items-center gap-1 mt-1 text-xs sm:text-sm text-muted-foreground overflow-hidden">
                                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary shrink-0" />
                                <span className="truncate">
                                  {[event.location.city, event.location.region, event.location.country]
                                    .filter(Boolean)
                                    .join(', ')}
                                </span>
                              </div>
                            )}
                            
                            {/* IP and Time */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-[10px] sm:text-xs text-muted-foreground">
                              {event.ip_address && (
                                <div className="flex items-center gap-1 overflow-hidden">
                                  <Globe className="h-3 w-3 shrink-0" />
                                  <span className="font-mono truncate">{event.ip_address}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1 overflow-hidden">
                                <Clock className="h-3 w-3 shrink-0" />
                                <span className="truncate">{format(new Date(event.created_at), 'PPpp')}</span>
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
                  All security-related activity on your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {authEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No security events recorded</p>
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

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationDeliveryLog />
          </TabsContent>

          {/* Blocked Logins Tab */}
          <TabsContent value="blocked">
            {user && <BlockedLoginAttemptsLog userId={user.id} />}
          </TabsContent>

          <TabsContent value="attempts">
            <Card>
              <CardHeader>
                <CardTitle>Failed Backup Code Attempts</CardTitle>
                <CardDescription>
                  Invalid backup code usage attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {backupCodeAttempts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-70" />
                    <p className="font-medium text-green-600">No Failed Attempts</p>
                    <p className="text-sm">Your backup codes have not been misused</p>
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
            <CardDescription>Common security actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm" asChild>
                <Link to="/settings">
                  <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Security Settings
                </Link>
              </Button>
              {!stats.mfaEnabled && (
                <Button variant="default" size="sm" className="text-xs sm:text-sm" asChild>
                  <Link to="/settings">
                    <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Enable 2FA
                  </Link>
                </Button>
              )}
              {stats.backupCodesRemaining <= 3 && stats.mfaEnabled && (
                <Button variant="outline" size="sm" className="border-amber-500 text-amber-600 hover:bg-amber-50 text-xs sm:text-sm" asChild>
                  <Link to="/settings">
                    <Key className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Generate Backup Codes
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

      {/* 2FA Verification Dialog for Unblocking Devices */}
      <Dialog open={showUnblockDialog} onOpenChange={(open) => {
        if (!open) {
          setShowUnblockDialog(false);
          setUnblockDeviceId(null);
          setUnblockTotpCode("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Verify Your Identity
            </DialogTitle>
            <DialogDescription>
              Enter your 2FA code to unblock this device
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium">Security Notice</p>
                  <p className="text-xs mt-1">Unblocking a device will allow it to log in again</p>
                </div>
              </div>
            </div>
            
            {useBackupCodeForUnblock ? (
              <div className="space-y-2">
                <Label htmlFor="unblock-backup">Backup Code</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="unblock-backup"
                    type="text"
                    placeholder="XXXX-XXXX"
                    value={unblockBackupCode}
                    onChange={(e) => setUnblockBackupCode(e.target.value.toUpperCase())}
                    className="pl-10 font-mono tracking-wider text-center text-lg"
                    maxLength={9}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This code will be consumed after use
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="unblock-totp">Verification Code</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="unblock-totp"
                    type="text"
                    placeholder="000000"
                    value={unblockTotpCode}
                    onChange={(e) => setUnblockTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-10 font-mono tracking-wider text-center text-lg"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}
            
            {stats.backupCodesRemaining > 0 && (
              <Button
                variant="link"
                className="text-xs p-0 h-auto"
                onClick={() => {
                  setUseBackupCodeForUnblock(!useBackupCodeForUnblock);
                  setUnblockTotpCode("");
                  setUnblockBackupCode("");
                }}
              >
                {useBackupCodeForUnblock 
                  ? 'Use authenticator app instead'
                  : 'Use a backup code instead'
                }
              </Button>
            )}
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowUnblockDialog(false);
                setUnblockDeviceId(null);
                setUnblockTotpCode("");
                setUnblockBackupCode("");
                setUseBackupCodeForUnblock(false);
              }}
              disabled={isVerifyingUnblock}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnblockWithMfa}
              disabled={isVerifyingUnblock || (useBackupCodeForUnblock ? unblockBackupCode.length < 8 : unblockTotpCode.length !== 6)}
            >
              {isVerifyingUnblock ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Verify & Unblock
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default SecurityDashboard;
