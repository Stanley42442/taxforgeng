import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calculator, Mail, Lock, User, ArrowLeft, Eye, EyeOff, KeyRound, Shield, Gift, HelpCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import logger from "@/lib/logger";
import { z } from "zod";
import { getDeviceInfo } from "@/lib/deviceFingerprint";
import { TermsAcceptanceGate } from "@/components/TermsAcceptanceGate";
import { REFERRAL_SOURCES } from "@/lib/nigerianStates";
import { safeLocalStorage, safeSessionStorage } from "@/lib/safeStorage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const REMEMBER_ME_KEY = 'taxforge-remember-me';
const TERMS_ACCEPTED_KEY = 'taxforge-terms-accepted';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'mfa-challenge' | 'email-verified' | 'email-expired';

const Auth = () => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return safeLocalStorage.getItem(REMEMBER_ME_KEY) !== 'false';
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [mfaUserId, setMfaUserId] = useState<string | null>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [showEmailNotVerifiedMessage, setShowEmailNotVerifiedMessage] = useState(false);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [lockoutUnlockTime, setLockoutUnlockTime] = useState<Date | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  
  // New fields for enhanced signup
  const [referralCode, setReferralCode] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [referralCodeValid, setReferralCodeValid] = useState<boolean | null>(null);
  const [referralCodeChecking, setReferralCodeChecking] = useState(false);
  const [showTermsGate, setShowTermsGate] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(() => {
    return safeLocalStorage.getItem(TERMS_ACCEPTED_KEY) === 'true';
  });
  
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  // Check for password reset or email verification token in URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const errorCode = hashParams.get('error_code');
    const errorDescription = hashParams.get('error_description');
    
    if (type === 'recovery') {
      setView('reset-password');
    } else if (type === 'signup' || type === 'email') {
      // Handle email verification callback
      if (errorCode || errorDescription?.includes('expired') || errorDescription?.includes('invalid')) {
        setView('email-expired');
        toast.error("Verification link has expired or is invalid");
      } else {
        setView('email-verified');
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);
        toast.success("Email verified successfully!");
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          setView('login');
        }, 3000);
      }
    }
  }, []);

  // Redirect if already logged in (but not on reset-password view)
  useEffect(() => {
    if (user && !loading && view !== 'reset-password') {
      navigate("/");
    }
  }, [user, loading, navigate, view]);

  const validateForm = (checkPassword = true) => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    if (checkPassword) {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check account lockout status
  const checkAccountLockout = async (checkEmail: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_account_locked', { check_email: checkEmail });
      
      if (error) {
        logger.error('Error checking lockout:', error);
        return false;
      }
      
      if (data && data.length > 0 && data[0].is_locked) {
        setIsAccountLocked(true);
        setLockoutUnlockTime(new Date(data[0].unlock_at));
        setFailedAttempts(data[0].failed_count);
        return true;
      }
      
      setIsAccountLocked(false);
      setLockoutUnlockTime(null);
      setFailedAttempts(data?.[0]?.failed_count || 0);
      return false;
    } catch (err) {
      logger.error('Lockout check error:', err);
      return false;
    }
  };

  // Record login attempt via security definer function
  const recordLoginAttempt = async (attemptEmail: string, success: boolean) => {
    try {
      await supabase.rpc('record_login_attempt', {
        attempt_email: attemptEmail,
        attempt_success: success,
        attempt_ip: null
      });
    } catch (err) {
      logger.error('Failed to record login attempt:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Save remember me preference
    safeLocalStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());
    
    try {
      if (view === 'login') {
        // Check if account is locked
        const isLocked = await checkAccountLockout(email);
        if (isLocked) {
          const timeLeft = lockoutUnlockTime ? Math.ceil((lockoutUnlockTime.getTime() - Date.now()) / 60000) : 15;
          toast.error(`Account temporarily locked. Try again in ${timeLeft} minutes.`);
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          // Record failed attempt
          await recordLoginAttempt(email, false);
          
          // Re-check lockout status after failed attempt
          await checkAccountLockout(email);
          
          if (error.message.includes("Email not confirmed")) {
            setShowEmailNotVerifiedMessage(true);
            toast.error("Please verify your email before signing in.");
          } else if (error.message.includes("Invalid login credentials")) {
            setShowEmailNotVerifiedMessage(false);
            const attemptsLeft = 5 - (failedAttempts + 1);
            if (attemptsLeft > 0) {
              toast.error(`Invalid email or password. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`);
            } else {
              toast.error("Account locked for 15 minutes due to too many failed attempts.");
            }
          } else {
            setShowEmailNotVerifiedMessage(false);
            toast.error(error.message);
          }
          return;
        }
        
        // Record successful attempt
        await recordLoginAttempt(email, true);
        setShowEmailNotVerifiedMessage(false);
        
        // Check if MFA is required
        const { data: factorsData } = await supabase.auth.mfa.listFactors();
        const verifiedFactors = factorsData?.totp?.filter(f => f.status === 'verified') || [];
        
        if (verifiedFactors.length > 0) {
          // MFA is enabled, need to verify
          setMfaFactorId(verifiedFactors[0].id);
          setMfaUserId(data.user?.id || null);
          setView('mfa-challenge');
          return;
        }
        
        // Device tracking is handled by useAuth's onAuthStateChange event
        // No need to call checkAndRegisterDevice here - it would cause duplicate tracking
        
        if (!rememberMe) {
          safeSessionStorage.setItem('taxforge-session-only', 'true');
          safeLocalStorage.setItem('taxforge-session-only-flag', 'true');
        } else {
          safeSessionStorage.removeItem('taxforge-session-only');
          safeLocalStorage.removeItem('taxforge-session-only-flag');
        }
        toast.success("Welcome back!");
        navigate("/");
      } else if (view === 'signup') {
        // Check if terms were accepted (should be, but double-check)
        if (!termsAccepted) {
          setShowTermsGate(true);
          return;
        }

        const { error } = await signUp(email, password, fullName, {
          referral_code: referralCode || undefined,
          referral_source: referralSource || undefined,
          terms_accepted: true,
          privacy_accepted: true,
          refund_policy_accepted: true,
        });
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
          } else {
            toast.error(error.message);
          }
        } else {
          if (!rememberMe) {
            safeSessionStorage.setItem('taxforge-session-only', 'true');
            safeLocalStorage.setItem('taxforge-session-only-flag', 'true');
          } else {
            safeSessionStorage.removeItem('taxforge-session-only');
            safeLocalStorage.removeItem('taxforge-session-only-flag');
          }
          // Show verification message instead of immediate redirect
          toast.success("Account created! Please check your email to verify your account.", {
            duration: 6000
          });
          setView('login');
          setEmail("");
          setPassword("");
          setFullName("");
          setReferralCode("");
          setReferralSource("");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate referral code
  const validateReferralCode = async (code: string) => {
    if (!code || code.length < 4) {
      setReferralCodeValid(null);
      return;
    }

    setReferralCodeChecking(true);
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('id, referrer_id, status')
        .eq('referral_code', code.toUpperCase())
        .eq('status', 'pending')
        .maybeSingle();

      if (data && !error) {
        setReferralCodeValid(true);
        toast.success('Referral code applied! You\'ll both earn bonus points.');
      } else {
        setReferralCodeValid(false);
      }
    } catch {
      setReferralCodeValid(false);
    } finally {
      setReferralCodeChecking(false);
    }
  };

  // Handle terms acceptance
  const handleTermsAccepted = () => {
    setTermsAccepted(true);
    safeLocalStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
    setShowTermsGate(false);
  };

  // Show terms gate when switching to signup if not accepted
  useEffect(() => {
    if (view === 'signup' && !termsAccepted) {
      setShowTermsGate(true);
    }
  }, [view, termsAccepted]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(false)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password reset email sent! Check your inbox.");
        setView('login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordResult = passwordSchema.safeParse(newPassword);
    if (!passwordResult.success) {
      setErrors({ password: passwordResult.error.errors[0].message });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password updated successfully!");
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);
        navigate("/");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      return;
    }

    setIsResendingVerification(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        }
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification email sent! Please check your inbox.", {
          duration: 5000
        });
      }
    } catch {
      toast.error("Failed to send verification email. Please try again.");
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        toast.error(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Device tracking is now handled by useAuth hook's onAuthStateChange event
  // This prevents duplicate device registration and double security alerts

  // Hash function for backup code verification
  const hashCode = async (code: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(code.toUpperCase().replace(/-/g, ''));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleMfaChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (useBackupCode) {
        // Verify backup code
        if (!mfaUserId) {
          toast.error("Session expired. Please login again.");
          setView('login');
          return;
        }

        // Check rate limiting - max 5 attempts in 15 minutes
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const { count: attemptCount } = await supabase
          .from('backup_code_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', mfaUserId)
          .gte('attempted_at', fifteenMinutesAgo);

        if ((attemptCount || 0) >= 5) {
          // Fetch user's WhatsApp number for notification
          const { data: profile } = await supabase
            .from('profiles')
            .select('whatsapp_number')
            .eq('id', mfaUserId)
            .maybeSingle(); // Use maybeSingle to handle missing profile gracefully

          // Send account locked alert with WhatsApp notification
          try {
            await supabase.functions.invoke('send-security-alert', {
              body: {
                userEmail: email,
                userId: mfaUserId,
                alertType: 'account_locked',
                attemptCount: attemptCount || 0,
                timestamp: new Date().toLocaleString(),
                whatsappNumber: profile?.whatsapp_number || null
              }
            });
          } catch (alertError) {
            logger.error('Failed to send security alert:', alertError);
          }
          toast.error("Too many failed attempts. Please try again in 15 minutes.");
          return;
        }

        const codeHash = await hashCode(backupCode);
        
        // Check if backup code exists and is unused
        const { data: codes, error: fetchError } = await supabase
          .from('backup_codes')
          .select('id, used_at')
          .eq('user_id', mfaUserId)
          .eq('code_hash', codeHash)
          .maybeSingle(); // Use maybeSingle - code not found is expected for invalid codes

        if (fetchError || !codes) {
          // Log failed attempt
          await supabase.from('backup_code_attempts').insert({
            user_id: mfaUserId
          } as any);
          
          const newAttemptCount = (attemptCount || 0) + 1;
          const remainingAttempts = 5 - newAttemptCount;
          
          // Send security alert at 3 failed attempts
          if (newAttemptCount === 3) {
            // Fetch user's WhatsApp number for notification
            const { data: profile } = await supabase
              .from('profiles')
              .select('whatsapp_number')
              .eq('id', mfaUserId)
              .maybeSingle(); // Use maybeSingle to handle missing profile gracefully

            try {
              await supabase.functions.invoke('send-security-alert', {
                body: {
                  userEmail: email,
                  userId: mfaUserId,
                  alertType: 'failed_backup_codes',
                  attemptCount: newAttemptCount,
                  timestamp: new Date().toLocaleString(),
                  whatsappNumber: profile?.whatsapp_number || null
                }
              });
            } catch (alertError) {
              logger.error('Failed to send security alert:', alertError);
            }
          }
          
          toast.error(`Invalid backup code. ${remainingAttempts > 0 ? `${remainingAttempts} attempts remaining.` : 'Account temporarily locked.'}`);
          return;
        }

        if (codes.used_at) {
          // Log failed attempt for used code
          await supabase.from('backup_code_attempts').insert({
            user_id: mfaUserId
          } as any);
          
          const newAttemptCount = (attemptCount || 0) + 1;
          
          // Send security alert at 3 failed attempts
          if (newAttemptCount === 3) {
            // Fetch user's WhatsApp number for notification
            const { data: profile } = await supabase
              .from('profiles')
              .select('whatsapp_number')
              .eq('id', mfaUserId)
              .maybeSingle(); // Use maybeSingle to handle missing profile gracefully

            try {
              await supabase.functions.invoke('send-security-alert', {
                body: {
                  userEmail: email,
                  userId: mfaUserId,
                  alertType: 'failed_backup_codes',
                  attemptCount: newAttemptCount,
                  timestamp: new Date().toLocaleString(),
                  whatsappNumber: profile?.whatsapp_number || null
                }
              });
            } catch (alertError) {
              logger.error('Failed to send security alert:', alertError);
            }
          }
          
          toast.error("This backup code has already been used.");
          return;
        }

        // Successful verification - clear failed attempts
        await supabase
          .from('backup_code_attempts')
          .delete()
          .eq('user_id', mfaUserId);

        // Mark backup code as used
        await supabase
          .from('backup_codes')
          .update({ used_at: new Date().toISOString() })
          .eq('id', codes.id);

        // Check remaining backup codes and send alert if low
        const { count: remainingCount } = await supabase
          .from('backup_codes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', mfaUserId)
          .is('used_at', null);

        const remaining = remainingCount || 0;
        
        if (remaining <= 3 && remaining > 0) {
          // Send low backup codes alert email
          try {
            await supabase.functions.invoke('send-backup-code-alert', {
              body: {
                userEmail: email,
                remainingCodes: remaining
              }
            });
            logger.debug('Backup code alert email sent');
          } catch (emailError) {
            logger.error('Failed to send backup code alert:', emailError);
          }
        }

        // Complete the login
        if (!rememberMe) {
          safeSessionStorage.setItem('taxforge-session-only', 'true');
          safeLocalStorage.setItem('taxforge-session-only-flag', 'true');
        } else {
          safeSessionStorage.removeItem('taxforge-session-only');
          safeLocalStorage.removeItem('taxforge-session-only-flag');
        }
        
        toast.success("Welcome back! Remember to generate new backup codes.");
        navigate("/");
      } else {
        // Verify TOTP code
        if (!mfaFactorId) {
          toast.error("MFA session expired. Please login again.");
          setView('login');
          return;
        }

        const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId: mfaFactorId
        });

        if (challengeError) {
          toast.error(challengeError.message);
          return;
        }

        const { error: verifyError } = await supabase.auth.mfa.verify({
          factorId: mfaFactorId,
          challengeId: challengeData.id,
          code: totpCode
        });

        if (verifyError) {
          toast.error("Invalid verification code. Please try again.");
          return;
        }

        if (!rememberMe) {
          safeSessionStorage.setItem('taxforge-session-only', 'true');
        } else {
          safeSessionStorage.removeItem('taxforge-session-only');
        }
        
        toast.success("Welcome back!");
        navigate("/");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="glass-frosted rounded-2xl p-8">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin glow-primary" />
        </div>
      </div>
    );
  }

  const getTitle = () => {
    switch (view) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'forgot-password': return 'Reset Password';
      case 'reset-password': return 'Set New Password';
      case 'mfa-challenge': return 'Two-Factor Authentication';
      case 'email-verified': return 'Email Verified!';
      case 'email-expired': return 'Link Expired';
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case 'login': return 'Sign in to your account';
      case 'signup': return 'Start your free trial today';
      case 'forgot-password': return 'Enter your email to receive a reset link';
      case 'reset-password': return 'Choose a new password for your account';
      case 'mfa-challenge': return useBackupCode 
        ? 'Enter one of your backup codes'
        : 'Enter the 6-digit code from your authenticator app';
      case 'email-verified': return 'Your email has been successfully verified';
      case 'email-expired': return 'This verification link has expired or is invalid';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-lg glow-primary">
                <Calculator className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">TaxForge NG</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">{getTitle()}</h1>
            <p className="text-muted-foreground mt-2">{getSubtitle()}</p>
          </div>

          {/* Form Card */}
          <div className="glass-frosted rounded-2xl p-8 shadow-futuristic">
            {/* MFA Challenge View */}
            {view === 'mfa-challenge' && (
              <form onSubmit={handleMfaChallenge} className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 glow-sm">
                    {useBackupCode ? (
                      <KeyRound className="h-8 w-8 text-primary" />
                    ) : (
                      <Shield className="h-8 w-8 text-primary" />
                    )}
                  </div>
                </div>

                {useBackupCode ? (
                  <div className="space-y-2">
                    <Label htmlFor="backupCode">Backup Code</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="backupCode"
                        type="text"
                        placeholder="XXXX-XXXX"
                        value={backupCode}
                        onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                        className="pl-10 font-mono tracking-wider input-premium"
                        autoComplete="off"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter one of your 10 backup codes
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="totpCode">Verification Code</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="totpCode"
                        type="text"
                        placeholder="000000"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="pl-10 font-mono tracking-wider text-center text-lg input-premium"
                        maxLength={6}
                        autoComplete="one-time-code"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter the 6-digit code from your authenticator app
                    </p>
                  </div>
                )}

                <Button type="submit" variant="glow" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Verifying...' : 'Verify'}
                </Button>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUseBackupCode(!useBackupCode);
                      setTotpCode("");
                      setBackupCode("");
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    {useBackupCode ? 'Use authenticator app instead' : 'Lost access to authenticator?'}
                  </button>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setView('login');
                        setMfaFactorId(null);
                        setMfaUserId(null);
                        setTotpCode("");
                        setBackupCode("");
                        setUseBackupCode(false);
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Email Verified Success View */}
            {view === 'email-verified' && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-success/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Email Verified!</h2>
                  <p className="text-muted-foreground mt-2">
                    Your email has been successfully verified. Redirecting to login...
                  </p>
                </div>
                <Button onClick={() => setView('login')} variant="glow" className="w-full">
                  Continue to Login
                </Button>
              </div>
            )}

            {/* Email Expired View */}
            {view === 'email-expired' && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Link Expired</h2>
                  <p className="text-muted-foreground mt-2">
                    This verification link has expired or is invalid. Please request a new one.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiredEmail">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="expiredEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 input-premium"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleResendVerification} 
                    disabled={isResendingVerification}
                    variant="glow"
                    className="w-full"
                  >
                    {isResendingVerification ? "Sending..." : "Resend Verification Email"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setView('login')}
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            )}

            {/* Reset Password View */}
            {view === 'reset-password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setErrors({});
                      }}
                      className={`pl-10 pr-10 input-premium ${errors.password ? 'border-destructive' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive animate-shake">{errors.password}</p>
                  )}
                </div>
                <Button type="submit" variant="glow" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            )}

            {/* Forgot Password View */}
            {view === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        className={`pl-10 input-premium ${errors.email ? 'border-destructive' : ''}`}
                      />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive animate-shake">{errors.email}</p>
                  )}
                </div>
                <Button type="submit" variant="glow" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="text-sm text-primary hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* Login / Signup View */}
            {(view === 'login' || view === 'signup') && (
              <>
                {/* Google OAuth Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-4 gap-2 glass hover-lift"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative my-6">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    or continue with email
                  </span>
                </div>

                {/* Account Lockout Warning */}
                {view === 'login' && isAccountLocked && lockoutUnlockTime && (
                  <div className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-destructive">
                          Account Temporarily Locked
                        </p>
                        <p className="text-sm text-destructive/80 mt-1">
                          Too many failed login attempts. Please try again after {lockoutUnlockTime.toLocaleTimeString()}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Failed Attempts Warning */}
                {view === 'login' && !isAccountLocked && failedAttempts > 0 && failedAttempts < 5 && (
                  <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-amber-600" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {5 - failedAttempts} login attempt{5 - failedAttempts !== 1 ? 's' : ''} remaining before account lockout.
                      </p>
                    </div>
                  </div>
                )}

                {/* Email Not Verified Message */}
                {view === 'login' && showEmailNotVerifiedMessage && (
                  <div className="mb-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-amber-800 dark:text-amber-200">
                          Email not verified
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          Please check your inbox and click the verification link. If you didn't receive the email, use the button below to resend it.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name (Sign Up Only) */}
                  {view === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10 input-premium"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors((prev) => ({ ...prev, email: undefined }));
                          // Reset lockout state when email changes
                          setIsAccountLocked(false);
                          setLockoutUnlockTime(null);
                          setFailedAttempts(0);
                        }}
                        onBlur={() => {
                          // Check lockout status when user tabs away from email field
                          if (email && view === 'login') {
                            checkAccountLockout(email);
                          }
                        }}
                        className={`pl-10 input-premium ${errors.email ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive animate-shake">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {view === 'login' && (
                        <button
                          type="button"
                          onClick={() => setView('forgot-password')}
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        className={`pl-10 pr-10 input-premium ${errors.password ? 'border-destructive' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive animate-shake">{errors.password}</p>
                    )}
                  </div>

                  {/* Referral Code (Sign Up Only) */}
                  {view === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="referralCode" className="flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        Referral Code (Optional)
                      </Label>
                      <div className="relative">
                        <Input
                          id="referralCode"
                          type="text"
                          placeholder="Enter referral code"
                          value={referralCode}
                          onChange={(e) => {
                            const code = e.target.value.toUpperCase();
                            setReferralCode(code);
                            setReferralCodeValid(null);
                          }}
                          onBlur={() => validateReferralCode(referralCode)}
                          className={`input-premium ${
                            referralCodeValid === true ? 'border-green-500' :
                            referralCodeValid === false ? 'border-destructive' : ''
                          }`}
                        />
                        {referralCodeChecking && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      {referralCodeValid === true && (
                        <p className="text-xs text-green-600">✓ Referral code applied</p>
                      )}
                      {referralCodeValid === false && (
                        <p className="text-xs text-destructive">Invalid or expired code</p>
                      )}
                    </div>
                  )}

                  {/* How did you hear about us (Sign Up Only) */}
                  {view === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="referralSource" className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        How did you hear about us? (Optional)
                      </Label>
                      <Select value={referralSource} onValueChange={setReferralSource}>
                        <SelectTrigger className="input-premium">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {REFERRAL_SOURCES.map((source) => (
                            <SelectItem key={source.value} value={source.value}>
                              {source.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Remember Me */}
                  {view === 'login' && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="rememberMe"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                      />
                      <Label 
                        htmlFor="rememberMe" 
                        className="text-sm text-muted-foreground cursor-pointer select-none"
                      >
                        Remember me
                      </Label>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="glow"
                    className="w-full"
                    disabled={isSubmitting || (view === 'login' && isAccountLocked)}
                  >
                    {isSubmitting 
                      ? 'Please wait...'
                      : isAccountLocked && view === 'login'
                        ? 'Account Locked'
                        : view === 'login' 
                          ? 'Sign In'
                          : 'Create Account'}
                  </Button>

                  {/* Resend Verification Email */}
                  {view === 'login' && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full mt-2 text-sm"
                      onClick={handleResendVerification}
                      disabled={isResendingVerification || !email}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {isResendingVerification ? 'Sending...' : 'Resend verification email'}
                    </Button>
                  )}
                </form>

                {/* Toggle Login/Signup */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {view === 'login' ? "Don't have an account?" : 'Already have an account?'}
                    <button
                      type="button"
                      onClick={() => {
                        setView(view === 'login' ? 'signup' : 'login');
                        setErrors({});
                      }}
                      className="ml-1 text-primary hover:underline font-medium"
                    >
                      {view === 'login' ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>,{' '}
            <Link to="/terms#privacy" className="text-primary hover:underline">Privacy Policy</Link>, and{' '}
            <Link to="/terms#refund" className="text-primary hover:underline">Refund Policy</Link>.
          </p>
        </div>
      </main>

      {/* Terms Acceptance Gate */}
      <TermsAcceptanceGate 
        open={showTermsGate} 
        onAccept={handleTermsAccepted} 
      />
    </div>
  );
};

export default Auth;
