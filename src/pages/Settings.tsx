import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { NavMenu } from "@/components/NavMenu";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import { SecurityScoreWidget } from "@/components/SecurityScoreWidget";
import { ReportScheduleSettings } from "@/components/ReportScheduleSettings";
import { WhatsAppVerification } from "@/components/WhatsAppVerification";
import { useLanguage, getToastMessage } from "@/contexts/LanguageContext";

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
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Profile state
  const [fullName, setFullName] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Email state
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswordVerification, setShowPasswordVerification] = useState(false);
  const [passwordVerificationCode, setPasswordVerificationCode] = useState("");
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [passwordBreached, setPasswordBreached] = useState<boolean | null>(null);
  const [checkingBreach, setCheckingBreach] = useState(false);

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

  // Backup codes state
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [hasBackupCodes, setHasBackupCodes] = useState(false);
  const [remainingBackupCodes, setRemainingBackupCodes] = useState(0);
  const [backupCodesLoading, setBackupCodesLoading] = useState(true);
  const [generatingBackupCodes, setGeneratingBackupCodes] = useState(false);

  // Activity log state
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Password last changed date
  const [passwordLastChanged, setPasswordLastChanged] = useState<Date | null>(null);
  const [hasKnownDevices, setHasKnownDevices] = useState(false);

  // WhatsApp notification settings
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [testingWhatsapp, setTestingWhatsapp] = useState(false);

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

  // Load backup codes status
  useEffect(() => {
    const loadBackupCodesStatus = async () => {
      if (!user) return;

      try {
        const { count, error } = await supabase
          .from('backup_codes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .is('used_at', null);

        if (error) throw error;
        const remaining = count || 0;
        setRemainingBackupCodes(remaining);
        setHasBackupCodes(remaining > 0);
      } catch (error) {
        console.error("Error loading backup codes status:", error);
      } finally {
        setBackupCodesLoading(false);
      }
    };

    loadBackupCodesStatus();
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

  // Load password last changed and known devices status
  useEffect(() => {
    const loadSecurityStatus = async () => {
      if (!user) return;

      try {
        // Get most recent password change event
        const { data: passwordEvent } = await supabase
          .from('auth_events')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('event_type', 'password_change')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (passwordEvent) {
          setPasswordLastChanged(new Date(passwordEvent.created_at));
        }

        // Check if user has known devices
        const { count } = await supabase
          .from('known_devices')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setHasKnownDevices((count || 0) > 0);
      } catch (error) {
        console.error("Error loading security status:", error);
      }
    };

    loadSecurityStatus();
  }, [user]);

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

      toast.success(getToastMessage('updateSuccess', language));
    } catch (error: any) {
      toast.error(error.message || getToastMessage('updateFailed', language));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number format (basic validation for international numbers)
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    const cleanNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '');
    
    if (cleanNumber && !phoneRegex.test(cleanNumber)) {
      setErrors({ whatsapp: "Please enter a valid phone number (e.g., +234812345678)" });
      return;
    }
    setErrors({});

    setSavingWhatsapp(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ whatsapp_number: cleanNumber || null })
        .eq('id', user?.id);

      if (error) throw error;
      
      toast.success(getToastMessage('updateSuccess', language));
    } catch (error: any) {
      toast.error(error.message || getToastMessage('updateFailed', language));
    } finally {
      setSavingWhatsapp(false);
    }
  };

  const handleTestWhatsappNotification = async () => {
    const cleanNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '');
    
    if (!cleanNumber) {
      toast.error(getToastMessage('invalidInput', language));
      return;
    }

    setTestingWhatsapp(true);
    try {
      const { error } = await supabase.functions.invoke('send-security-alert', {
        body: {
          userEmail: user?.email,
          alertType: 'account_locked',
          attemptCount: 0,
          timestamp: new Date().toLocaleString(),
          whatsappNumber: cleanNumber
        }
      });

      if (error) throw error;
      
      toast.success(getToastMessage('whatsappSent', language));
    } catch (error: any) {
      toast.error(getToastMessage('whatsappFailed', language));
    } finally {
      setTestingWhatsapp(false);
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
      
      // Send email notification to current email
      await sendSecurityNotification('email_changed', { newEmail });
      
      toast.success(getToastMessage('emailSent', language));
      setNewEmail("");
    } catch (error: any) {
      toast.error(error.message || getToastMessage('updateFailed', language));
    } finally {
      setSavingEmail(false);
    }
  };

  // Password breach check using Have I Been Pwned API (k-anonymity model)
  const checkPasswordBreach = async (password: string): Promise<boolean> => {
    try {
      // Create SHA-1 hash of the password
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      
      // Send only first 5 characters (k-anonymity)
      const prefix = hashHex.slice(0, 5);
      const suffix = hashHex.slice(5);
      
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      if (!response.ok) return false;
      
      const text = await response.text();
      const hashes = text.split('\n');
      
      // Check if our suffix appears in the results
      for (const line of hashes) {
        const [hashSuffix] = line.split(':');
        if (hashSuffix.trim() === suffix) {
          return true; // Password has been breached
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking password breach:', error);
      return false; // Fail open - don't block user if API is down
    }
  };

  // Debounced password breach check
  useEffect(() => {
    if (newPassword.length < 6) {
      setPasswordBreached(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingBreach(true);
      const breached = await checkPasswordBreach(newPassword);
      setPasswordBreached(breached);
      setCheckingBreach(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [newPassword]);

  // Password strength calculation
  const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    
    if (score <= 2) return { score, label: 'Weak', color: 'bg-destructive' };
    if (score <= 4) return { score, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 5) return { score, label: 'Good', color: 'bg-green-500' };
    return { score, label: 'Strong', color: 'bg-green-600' };
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  // Send security notification email
  const sendSecurityNotification = async (alertType: string, extraData: object = {}) => {
    if (!user?.email) return;
    
    try {
      await supabase.functions.invoke('send-security-alert', {
        body: {
          userEmail: user.email,
          alertType,
          timestamp: new Date().toLocaleString(),
          ...extraData
        }
      });
    } catch (error) {
      console.error('Failed to send security notification:', error);
    }
  };

  const handleInitiatePasswordChange = async (e: React.FormEvent) => {
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

    if (!currentPassword) {
      setErrors({ currentPassword: "Current password is required" });
      return;
    }

    setErrors({});

    // If 2FA is enabled, require verification
    const hasMfa = mfaFactors.some(f => f.status === 'verified');
    if (hasMfa) {
      setShowPasswordVerification(true);
      return;
    }

    // Otherwise, verify current password and update
    await executePasswordChange();
  };

  const executePasswordChange = async () => {
    setSavingPassword(true);
    try {
      // Re-authenticate with current password to verify identity
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });

      if (signInError) {
        setErrors({ currentPassword: "Current password is incorrect" });
        setSavingPassword(false);
        return;
      }

      // Check password history - prevent reusing last 5 passwords
      const newPasswordHash = await hashPasswordForHistory(newPassword);
      const { data: history } = await supabase
        .from('password_history')
        .select('password_hash')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (history && history.length > 0) {
        for (const entry of history) {
          if (entry.password_hash === newPasswordHash) {
            setErrors({ newPassword: "You cannot reuse any of your last 5 passwords. Please choose a different password." });
            setSavingPassword(false);
            return;
          }
        }
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Store the new password hash in history
      await supabase.from('password_history').insert({
        user_id: user?.id,
        password_hash: newPasswordHash
      });

      await logAuthEvent('password_change');
      
      // Send email notification
      await sendSecurityNotification('password_changed');
      
      toast.success(getToastMessage('updateSuccess', language));
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setPasswordBreached(null);
      setShowPasswordVerification(false);
      setPasswordVerificationCode("");
    } catch (error: any) {
      toast.error(error.message || getToastMessage('updateFailed', language));
    } finally {
      setSavingPassword(false);
    }
  };

  // Hash password for history comparison (different from breach check)
  const hashPasswordForHistory = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    // Add a salt based on user ID for security
    const data = encoder.encode(password + (user?.id || ''));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleVerifyAndChangePassword = async () => {
    if (passwordVerificationCode.length !== 6) return;

    setIsVerifyingPassword(true);
    try {
      const verifiedFactor = mfaFactors.find(f => f.status === 'verified');
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
        code: passwordVerificationCode
      });

      if (verifyError) {
        toast.error("Invalid verification code. Please try again.");
        return;
      }

      // 2FA verified, proceed with password change
      await executePasswordChange();
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    } finally {
      setIsVerifyingPassword(false);
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
      
      // Send email notification
      await sendSecurityNotification('2fa_enabled');
      
      // Refresh MFA factors
      const { data: factors } = await supabase.auth.mfa.listFactors();
      setMfaFactors((factors?.totp || []) as MFAFactor[]);

      setShowMfaSetup(false);
      setVerifyCode("");
      setQrCode(null);
      setTotpSecret(null);
      setFactorId(null);
      
      toast.success(getToastMessage('updateSuccess', language));
    } catch (error: any) {
      toast.error(error.message || getToastMessage('verificationFailed', language));
    } finally {
      setMfaVerifying(false);
    }
  };

  const handleDisableMfa = async (factorId: string) => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;

      await logAuthEvent('2fa_disabled');
      
      // Send email notification
      await sendSecurityNotification('2fa_disabled');

      // Refresh MFA factors
      const { data: factors } = await supabase.auth.mfa.listFactors();
      setMfaFactors((factors?.totp || []) as MFAFactor[]);

      // Delete backup codes when 2FA is disabled
      await supabase.from('backup_codes').delete().eq('user_id', user?.id);
      setHasBackupCodes(false);
      setRemainingBackupCodes(0);

      toast.success(getToastMessage('updateSuccess', language));
    } catch (error: any) {
      toast.error(error.message || getToastMessage('updateFailed', language));
    }
  };

  // Generate backup codes
  const generateBackupCodes = (): string[] => {
    const codes: string[] = [];
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
    for (let i = 0; i < 10; i++) {
      let code = '';
      for (let j = 0; j < 8; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      codes.push(code.slice(0, 4) + '-' + code.slice(4));
    }
    return codes;
  };

  // Simple hash function for backup codes (in production, use bcrypt on server)
  const hashCode = async (code: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(code.replace('-', '').toUpperCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleGenerateBackupCodes = async () => {
    if (!user) return;

    setGeneratingBackupCodes(true);
    try {
      // Delete existing backup codes
      await supabase.from('backup_codes').delete().eq('user_id', user.id);

      // Generate new codes
      const codes = generateBackupCodes();
      setBackupCodes(codes);

      // Store hashed codes in database
      const hashedCodes = await Promise.all(
        codes.map(async (code) => ({
          user_id: user.id,
          code_hash: await hashCode(code),
        }))
      );

      const { error } = await supabase.from('backup_codes').insert(hashedCodes as any);
      if (error) throw error;

      setHasBackupCodes(true);
      setRemainingBackupCodes(10); // 10 new codes generated
      setShowBackupCodes(true);
      await logAuthEvent('backup_codes_generated');
      
      // Send email notification
      await sendSecurityNotification('backup_codes_generated');
      
      toast.success(getToastMessage('saveSuccess', language));
    } catch (error: any) {
      toast.error(error.message || getToastMessage('saveFailed', language));
    } finally {
      setGeneratingBackupCodes(false);
    }
  };

  const handleCopyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    toast.success(getToastMessage('copySuccess', language));
  };

  const handleDownloadBackupCodes = () => {
    const codesText = `TaxForge NG - 2FA Backup Codes\n${'='.repeat(35)}\n\nThese codes can be used to sign in if you lose access to your authenticator app.\nEach code can only be used once.\n\n${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}\n\nGenerated: ${new Date().toLocaleString()}\n\nKeep these codes in a safe place!`;
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taxforge-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(getToastMessage('downloadSuccess', language));
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
    <div className="min-h-screen bg-gradient-hero">
      <NavMenu />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 min-w-0">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
                <span className="truncate">{t('settings.title')}</span>
              </h1>
              <p className="text-sm text-muted-foreground truncate">{t('settings.profile')}</p>
            </div>
          </div>
          <Badge variant={tier === 'free' ? 'secondary' : 'default'} className="capitalize shrink-0 self-start sm:self-auto">
            {tier} Plan
          </Badge>
        </div>

        {/* Security Score Widget */}
        <div className="mb-8">
          <SecurityScoreWidget
            isEmailVerified={isEmailVerified}
            hasMfaEnabled={hasMfaEnabled}
            hasBackupCodes={hasBackupCodes}
            remainingBackupCodes={remainingBackupCodes}
            recentLoginCount={authEvents.length}
            hasKnownDevices={hasKnownDevices}
            passwordLastChanged={passwordLastChanged}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Email Status</p>
                  <p className="text-lg font-bold">
                    {isEmailVerified ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Verified
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> Unverified
                      </span>
                    )}
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  isEmailVerified 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-amber-100 dark:bg-amber-900/30'
                }`}>
                  <Mail className={`h-6 w-6 ${
                    isEmailVerified ? 'text-green-600' : 'text-amber-600'
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
                    {hasMfaEnabled ? (
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
                  hasMfaEnabled 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-amber-100 dark:bg-amber-900/30'
                }`}>
                  <Smartphone className={`h-6 w-6 ${
                    hasMfaEnabled ? 'text-green-600' : 'text-amber-600'
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
                  <p className="text-2xl font-bold">{remainingBackupCodes}</p>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  remainingBackupCodes > 3 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : remainingBackupCodes > 0
                      ? 'bg-amber-100 dark:bg-amber-900/30'
                      : 'bg-muted'
                }`}>
                  <Key className={`h-6 w-6 ${
                    remainingBackupCodes > 3 
                      ? 'text-green-600' 
                      : remainingBackupCodes > 0
                        ? 'text-amber-600'
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
                  <p className="text-sm text-muted-foreground">Recent Events</p>
                  <p className="text-2xl font-bold">{authEvents.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <History className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-4">
          <div className="overflow-x-auto -mx-4 px-4">
            <TabsList className="inline-flex h-auto flex-wrap gap-1 p-1 w-auto min-w-full sm:min-w-0">
              <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {t('settings.profile')}
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {t('settings.security')}
              </TabsTrigger>
              <TabsTrigger value="credentials" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
                <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Credentials
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
                <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Activity
                {authEvents.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {authEvents.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Account Status
                    </CardTitle>
                    <CardDescription>Your account information and verification status</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate max-w-[200px] sm:max-w-none">{user?.email}</span>
                  {isEmailVerified ? (
                    <Badge variant="outline" className="gap-1 text-green-600 border-green-600 shrink-0">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-amber-600 border-amber-600 shrink-0">
                      <AlertCircle className="h-3 w-3" />
                      Unverified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Smartphone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">Two-Factor Authentication</span>
                  {hasMfaEnabled ? (
                    <Badge variant="outline" className="gap-1 text-green-600 border-green-600 shrink-0">
                      <CheckCircle2 className="h-3 w-3" />
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-amber-600 border-amber-600 shrink-0">
                      <AlertCircle className="h-3 w-3" />
                      Disabled
                    </Badge>
                  )}
                </div>
                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/security">
                      <Shield className="h-4 w-4 mr-2" />
                      View Security Dashboard
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {t('settings.profile')}
                </CardTitle>
                <CardDescription>{t('common.edit')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('settings.profile')}</Label>
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
                    {savingProfile ? t('common.loading') : t('common.save')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
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

            {/* Backup Codes */}
            {hasMfaEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    Backup Codes
                  </CardTitle>
                  <CardDescription>
                    Recovery codes to use if you lose access to your authenticator app
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {backupCodesLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  ) : hasBackupCodes ? (
                    <div className="space-y-4">
                      {remainingBackupCodes <= 3 ? (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                          <AlertCircle className="h-5 w-5 text-amber-600" />
                          <div>
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                              {remainingBackupCodes} backup code{remainingBackupCodes !== 1 ? 's' : ''} remaining
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              You're running low! Consider generating new codes soon.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                              {remainingBackupCodes} backup codes available
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              You have recovery codes saved for account access
                            </p>
                          </div>
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        onClick={handleGenerateBackupCodes}
                        disabled={generatingBackupCodes}
                      >
                        {generatingBackupCodes ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Regenerate Codes
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Warning: Regenerating codes will invalidate all existing backup codes.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            No backup codes
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            Generate backup codes for account recovery
                          </p>
                        </div>
                      </div>
                      <Button onClick={handleGenerateBackupCodes} disabled={generatingBackupCodes}>
                        {generatingBackupCodes ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          "Generate Backup Codes"
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* WhatsApp Notifications with Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  WhatsApp Security Alerts
                </CardTitle>
                <CardDescription>
                  Receive instant WhatsApp notifications when your account is locked or suspicious activity is detected
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* WhatsApp Verification Component */}
                <WhatsAppVerification />
                
                {/* Manual number entry (fallback) */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium mb-3">Or enter number manually</h4>
                  <form onSubmit={handleUpdateWhatsapp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="whatsappNumber">WhatsApp Phone Number</Label>
                      <Input
                        id="whatsappNumber"
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => {
                          setWhatsappNumber(e.target.value);
                          setErrors((prev) => ({ ...prev, whatsapp: "" }));
                        }}
                        placeholder="+234 812 345 6789"
                        className={errors.whatsapp ? 'border-destructive' : ''}
                      />
                      {errors.whatsapp && (
                        <p className="text-sm text-destructive">{errors.whatsapp}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Enter your number with country code (e.g., +234 for Nigeria). Leave empty to disable.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" disabled={savingWhatsapp}>
                        {savingWhatsapp ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          "Save Number"
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleTestWhatsappNotification}
                        disabled={testingWhatsapp || !whatsappNumber}
                      >
                        {testingWhatsapp ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Test
                          </>
                        )}
                      </Button>
                    </div>
                    {whatsappNumber && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            WhatsApp notifications enabled
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            You'll receive alerts when your account is locked due to failed login attempts
                          </p>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
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
          </TabsContent>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="space-y-6">
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
                <form onSubmit={handleInitiatePasswordChange} className="space-y-4">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, currentPassword: "" }));
                        }}
                        placeholder="••••••••"
                        className={errors.currentPassword ? 'border-destructive pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-sm text-destructive">{errors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password with Strength Indicator */}
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
                    </div>
                    {errors.newPassword && (
                      <p className="text-sm text-destructive">{errors.newPassword}</p>
                    )}
                    
                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Password strength</span>
                          <span className={`font-medium ${
                            passwordStrength.label === 'Weak' ? 'text-destructive' :
                            passwordStrength.label === 'Fair' ? 'text-amber-500' :
                            'text-green-600'
                          }`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                          />
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                            {newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                          </li>
                          <li className={/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
                            {/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) ? '✓' : '○'} Upper & lowercase letters
                          </li>
                          <li className={/\d/.test(newPassword) ? 'text-green-600' : ''}>
                            {/\d/.test(newPassword) ? '✓' : '○'} At least one number
                          </li>
                          <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-600' : ''}>
                            {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? '✓' : '○'} Special character
                          </li>
                        </ul>

                        {/* Password Breach Warning */}
                        {checkingBreach && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Checking password security...
                          </div>
                        )}
                        {passwordBreached === true && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-destructive">Password found in data breach!</p>
                              <p className="text-xs text-destructive/80">
                                This password has appeared in a known data breach and should not be used. Please choose a different password.
                              </p>
                            </div>
                          </div>
                        )}
                        {passwordBreached === false && (
                          <div className="flex items-center gap-2 text-xs text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Password not found in known data breaches
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
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
                    {confirmPassword && newPassword && confirmPassword === newPassword && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Passwords match
                      </p>
                    )}
                  </div>

                  {/* Security Notice */}
                  {hasMfaEnabled && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border">
                      <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        For your security, you'll need to verify with your authenticator app before changing your password.
                      </p>
                    </div>
                  )}

                  <Button type="submit" disabled={savingPassword || !newPassword || !confirmPassword || !currentPassword || passwordBreached === true}>
                    {savingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <ReportScheduleSettings />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
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
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No recent activity to display.</p>
                  </div>
                ) : (
                  <div className="h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                    <div className="space-y-3 mr-2">
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Backup Codes</DialogTitle>
            <DialogDescription>
              Save these codes in a secure place. Each code can only be used once to sign in if you lose access to your authenticator app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="p-2 bg-background rounded border text-center">
                  {code}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleCopyBackupCodes}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleDownloadBackupCodes}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>Important:</strong> Store these codes securely. They won't be shown again after you close this dialog.
              </p>
            </div>
            <Button 
              className="w-full" 
              onClick={() => setShowBackupCodes(false)}
            >
              I've saved my codes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Change 2FA Verification Dialog */}
      <Dialog open={showPasswordVerification} onOpenChange={(open) => {
        setShowPasswordVerification(open);
        if (!open) {
          setPasswordVerificationCode("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Verify Your Identity
            </DialogTitle>
            <DialogDescription>
              Enter the 6-digit code from your authenticator app to confirm this password change.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passwordVerificationCode">Verification Code</Label>
              <Input
                id="passwordVerificationCode"
                value={passwordVerificationCode}
                onChange={(e) => setPasswordVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowPasswordVerification(false);
                  setPasswordVerificationCode("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleVerifyAndChangePassword} 
                className="flex-1"
                disabled={passwordVerificationCode.length !== 6 || isVerifyingPassword}
              >
                {isVerifyingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Change"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
