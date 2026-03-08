import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import type { Json } from '@/integrations/supabase/types';
import { getDeviceInfo } from '@/lib/deviceFingerprint';
import { notifyIPBlocked, notifyTimeRestricted } from '@/lib/notifications';
import logger from '@/lib/logger';
import { safeLocalStorage, safeSessionStorage } from '@/lib/safeStorage';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string, 
    password: string, 
    fullName?: string,
    metadata?: {
      referral_code?: string;
      referral_source?: string;
      terms_accepted?: boolean;
      privacy_accepted?: boolean;
      refund_policy_accepted?: boolean;
    }
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; blocked?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get client IP address
const getClientIP = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || null;
  } catch (error) {
    logger.error('Failed to get client IP:', error);
    return null;
  }
};

// Helper to log auth events (lightweight, single call)
const logAuthEvent = async (userId: string, eventType: string, metadata?: Json) => {
  try {
    await supabase.from('auth_events').insert([{
      user_id: userId,
      event_type: eventType,
      user_agent: navigator.userAgent,
      metadata: metadata || {}
    }]);
  } catch (error) {
    logger.error('Failed to log auth event:', error);
  }
};

/**
 * Consolidated device tracking via single edge function call.
 * All DB operations happen server-side with service role key,
 * preventing token refresh cascades.
 */
const trackDevice = async (session: Session) => {
  try {
    const [deviceInfo, clientIP] = await Promise.all([
      getDeviceInfo(),
      getClientIP(),
    ]);

    const { data, error } = await supabase.functions.invoke('track-device', {
      body: {
        deviceInfo: {
          fingerprint: deviceInfo.fingerprint,
          deviceName: deviceInfo.deviceName,
          browser: deviceInfo.browser,
          browserVersion: deviceInfo.browserVersion,
          os: deviceInfo.os,
          osVersion: deviceInfo.osVersion,
          deviceType: deviceInfo.deviceType,
          deviceModel: deviceInfo.deviceModel,
          screenResolution: deviceInfo.screenResolution,
          timezone: deviceInfo.timezone,
          language: deviceInfo.language,
          userAgent: navigator.userAgent,
        },
        clientIP,
      },
    });

    if (error) {
      logger.error('track-device invoke error:', error);
      return { blocked: false, ipBlocked: false, timeBlocked: false };
    }

    // Trigger in-app notifications based on server response
    if (data?.ipBlocked && clientIP) {
      notifyIPBlocked(clientIP);
    }
    if (data?.timeBlocked) {
      const hour = new Date().getHours();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      notifyTimeRestricted(hour, timezone);
    }

    return data || { blocked: false, ipBlocked: false, timeBlocked: false };
  } catch (error) {
    logger.error('Failed to track device:', error);
    return { blocked: false, ipBlocked: false, timeBlocked: false };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  const isInitialLoadRef = useRef(true);
  const lastSessionIdRef = useRef<string | null>(null);
  const isTrackingRef = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const currentSessionId = session.access_token;
          
          setTimeout(() => {
            switch (event) {
              case 'SIGNED_IN':
                if (isTrackingRef.current) return;

                if (!isInitialLoadRef.current || lastSessionIdRef.current !== currentSessionId) {
                  const tokenPayload = session.access_token.split('.')[1];
                  try {
                    const decoded = JSON.parse(atob(tokenPayload));
                    const issuedAt = decoded.iat * 1000;
                    const now = Date.now();
                    if (now - issuedAt < 30000) {
                      isTrackingRef.current = true;
                      trackDevice(session)
                        .catch(err => logger.error('trackDevice failed:', err))
                        .finally(() => { isTrackingRef.current = false; });
                    }
                  } catch {
                    // Can't parse token, skip tracking
                  }
                  lastSessionIdRef.current = currentSessionId;
                }
                break;
              case 'PASSWORD_RECOVERY':
                logAuthEvent(session.user.id, 'password_recovery_initiated');
                break;
              case 'USER_UPDATED':
                logAuthEvent(session.user.id, 'profile_updated');
                break;
            }
          }, 0);
        }
        
        isInitialLoadRef.current = false;
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    }).catch((error) => {
      logger.error('[Auth] Failed to get session:', error);
    });

    const handleBeforeUnload = () => {
      const isSessionOnly = safeSessionStorage.getItem('taxforge-session-only');
      if (isSessionOnly === 'true') {
        safeLocalStorage.removeItem('sb-uhuxqrrtsiintcwpxxwy-auth-token');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    fullName?: string,
    metadata?: {
      referral_code?: string;
      referral_source?: string;
      terms_accepted?: boolean;
      privacy_accepted?: boolean;
      refund_policy_accepted?: boolean;
    }
  ) => {
    const redirectUrl = `${window.location.origin}/auth`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || '',
          referred_by_code: metadata?.referral_code || null,
          referral_source: metadata?.referral_source || null,
          terms_accepted: metadata?.terms_accepted || false,
          privacy_accepted: metadata?.privacy_accepted || false,
          refund_policy_accepted: metadata?.refund_policy_accepted || false,
        }
      }
    });
    
    if (!error && data.user) {
      logAuthEvent(data.user.id, 'signup');
      
      supabase.functions.invoke('send-welcome-email', {
        body: { email, name: fullName }
      }).catch(err => {
        logger.error('Failed to send welcome email:', err);
      });
    }
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      logger.error('Login failed:', error.message);
    }
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (user) {
      logAuthEvent(user.id, 'logout').catch(err => logger.error('Failed to log logout:', err));
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
