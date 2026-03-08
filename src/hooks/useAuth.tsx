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

// Get location from IP
const getLocationFromIP = async (ip: string): Promise<{ city?: string; region?: string; country?: string; country_code?: string } | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-ip-location', {
      body: { ip }
    });
    if (error || data?.error) return null;
    return {
      city: data.city,
      region: data.region,
      country: data.country,
      country_code: data.country_code
    };
  } catch (error) {
    logger.error('Failed to get location:', error);
    return null;
  }
};

// Helper to log auth events
const logAuthEvent = async (userId: string, eventType: string, metadata?: Json, ipAddress?: string | null, location?: Json) => {
  try {
    await supabase.from('auth_events').insert([{
      user_id: userId,
      event_type: eventType,
      user_agent: navigator.userAgent,
      ip_address: ipAddress || null,
      location: location || null,
      metadata: metadata || {}
    }]);
  } catch (error) {
    logger.error('Failed to log auth event:', error);
  }
};

// Check if device is blocked
const isDeviceBlocked = async (userId: string, fingerprint: string): Promise<boolean> => {
  try {
    const { data } = await supabase
      .from('known_devices')
      .select('is_blocked')
      .eq('user_id', userId)
      .eq('device_fingerprint', fingerprint)
      .single();
    
    return data?.is_blocked === true;
  } catch {
    return false;
  }
};

// Check if login time is unusual (outside 6 AM - 11 PM local time)
const isUnusualLoginTime = (): { isUnusual: boolean; hour: number; timezone: string } => {
  const now = new Date();
  const hour = now.getHours();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Consider unusual if between 11 PM (23:00) and 6 AM (06:00)
  const isUnusual = hour >= 23 || hour < 6;
  
  return { isUnusual, hour, timezone };
};

// Check if IP is in user's whitelist
const checkIPWhitelist = async (userId: string, ip: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_ip_whitelist', {
      check_user_id: userId,
      check_ip: ip
    });
    
    if (error) {
      logger.error('Error checking IP whitelist:', error);
      return true; // Fail open if error
    }
    
    return data === true;
  } catch {
    return true; // Fail open if error
  }
};

// Track device on login with location awareness - parallelized for performance
const trackDevice = async (userId: string, userEmail: string) => {
  try {
    // Run independent operations in parallel for faster login
    const [deviceInfo, clientIP] = await Promise.all([
      getDeviceInfo(),
      getClientIP()
    ]);
    
    // Run these in parallel - they don't depend on each other
    const [location, profileResult, blocked] = await Promise.all([
      clientIP ? getLocationFromIP(clientIP) : Promise.resolve(null),
      supabase.from('profiles').select('whatsapp_number').eq('id', userId).maybeSingle(),
      isDeviceBlocked(userId, deviceInfo.fingerprint)
    ]);
    
    const whatsappNumber = profileResult?.data?.whatsapp_number || null;
    
    // Check if device is blocked
    if (blocked) {
      console.warn('Login from blocked device detected');
      return { blocked: true, ipBlocked: false };
    }
    
    // Check IP whitelist and time restrictions in parallel
    const [ipAllowed, timeAllowed] = await Promise.all([
      clientIP ? checkIPWhitelist(userId, clientIP) : Promise.resolve(true),
      supabase.rpc('check_time_restrictions', { check_user_id: userId }).then(({ data }) => data)
    ]);
    
    if (!ipAllowed && clientIP) {
      console.warn('Login from non-whitelisted IP detected');
      // Send alert for blocked IP (fire-and-forget)
      supabase.functions.invoke('send-security-alert', {
        body: {
          userEmail,
          userId,
          alertType: 'ip_blocked',
          timestamp: new Date().toLocaleString(),
          deviceInfo: { 
            browser: `${deviceInfo.browser} ${deviceInfo.browserVersion}`, 
            os: `${deviceInfo.os} ${deviceInfo.osVersion}`, 
            deviceName: deviceInfo.deviceName 
          },
          locationInfo: {
            city: location?.city,
            region: location?.region,
            country: location?.country
          },
          ipAddress: clientIP,
          whatsappNumber
        }
      }).catch(err => logger.error('Failed to send IP blocked alert:', err));
      
      // Also trigger in-app notification
      const locationText = location ? [location.city, location.country].filter(Boolean).join(', ') : undefined;
      notifyIPBlocked(clientIP, locationText);
      
      return { blocked: false, ipBlocked: true, timeBlocked: false };
    }
    
    if (timeAllowed === false) {
      console.warn('Login outside allowed time window');
      // Send alert for time-restricted login (fire-and-forget)
      supabase.functions.invoke('send-security-alert', {
        body: {
          userEmail,
          userId,
          alertType: 'time_restricted',
          timestamp: new Date().toLocaleString(),
          deviceInfo: { 
            browser: `${deviceInfo.browser} ${deviceInfo.browserVersion}`, 
            os: `${deviceInfo.os} ${deviceInfo.osVersion}`, 
            deviceName: deviceInfo.deviceName 
          },
          timeInfo: {
            hour: new Date().getHours(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          whatsappNumber
        }
      }).catch(err => logger.error('Failed to send time restricted alert:', err));
      
      // Also trigger in-app notification
      const hour = new Date().getHours();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      notifyTimeRestricted(hour, timezone);
      
      return { blocked: false, ipBlocked: false, timeBlocked: true };
    }

    // Check if device exists and get previous locations in parallel
    const [existingDeviceResult, previousDevicesResult] = await Promise.all([
      supabase
        .from('known_devices')
        .select('id, is_trusted, last_country')
        .eq('user_id', userId)
        .eq('device_fingerprint', deviceInfo.fingerprint)
        .single(),
      supabase
        .from('known_devices')
        .select('last_country')
        .eq('user_id', userId)
        .not('last_country', 'is', null)
    ]);
    
    const existingDevice = existingDeviceResult.data;
    const previousDevices = previousDevicesResult.data;
    
    const knownCountries = new Set(previousDevices?.map(d => d.last_country).filter(Boolean) || []);
    const currentCountry = location?.country || null;
    const isNewCountry = currentCountry && knownCountries.size > 0 && !knownCountries.has(currentCountry);
    
    // Log auth event with location
    await logAuthEvent(userId, 'login_success', { device: deviceInfo.deviceName }, clientIP, location as Json);
    
    if (existingDevice) {
      // Update last seen and device info
      await supabase
        .from('known_devices')
        .update({ 
          last_seen_at: new Date().toISOString(),
          browser: deviceInfo.browser,
          browser_version: deviceInfo.browserVersion,
          os: deviceInfo.os,
          os_version: deviceInfo.osVersion,
          device_type: deviceInfo.deviceType,
          device_model: deviceInfo.deviceModel,
          screen_resolution: deviceInfo.screenResolution,
          timezone: deviceInfo.timezone,
          language: deviceInfo.language,
          last_country: currentCountry,
          last_city: location?.city || null
        })
        .eq('id', existingDevice.id);
      
      // Check for new country login (different from last known country for this device)
      if (isNewCountry && existingDevice.last_country && existingDevice.last_country !== currentCountry) {
        // Send new location alert
        supabase.functions.invoke('send-security-alert', {
          body: {
            userEmail,
            alertType: 'new_location',
            timestamp: new Date().toLocaleString(),
            locationInfo: {
              city: location?.city,
              region: location?.region,
              country: currentCountry,
              previousCountry: existingDevice.last_country
            },
            deviceInfo: { 
              browser: `${deviceInfo.browser} ${deviceInfo.browserVersion}`, 
              os: `${deviceInfo.os} ${deviceInfo.osVersion}`, 
              deviceName: deviceInfo.deviceName 
            }
          }
        }).catch(err => logger.error('Failed to send new location alert:', err));
      }
    } else {
      // Insert new device
      await supabase
        .from('known_devices')
        .insert({
          user_id: userId,
          device_fingerprint: deviceInfo.fingerprint,
          device_name: deviceInfo.deviceName,
          browser: deviceInfo.browser,
          browser_version: deviceInfo.browserVersion,
          os: deviceInfo.os,
          os_version: deviceInfo.osVersion,
          device_type: deviceInfo.deviceType,
          device_model: deviceInfo.deviceModel,
          screen_resolution: deviceInfo.screenResolution,
          timezone: deviceInfo.timezone,
          language: deviceInfo.language,
          last_country: currentCountry,
          last_city: location?.city || null,
          is_trusted: false,
          is_blocked: false
        });
      
      // Send new device alert (non-blocking)
      supabase.functions.invoke('send-security-alert', {
        body: {
          userEmail,
          alertType: 'new_device',
          timestamp: new Date().toLocaleString(),
          deviceInfo: { 
            browser: `${deviceInfo.browser} ${deviceInfo.browserVersion}`, 
            os: `${deviceInfo.os} ${deviceInfo.osVersion}`, 
            deviceName: deviceInfo.deviceName 
          }
        }
      }).catch(err => logger.error('Failed to send new device alert:', err));
      
      // If this is a login from a completely new country (and we have previous data)
      if (isNewCountry) {
        const previousCountry = Array.from(knownCountries)[0] as string;
        supabase.functions.invoke('send-security-alert', {
          body: {
            userEmail,
            alertType: 'new_location',
            timestamp: new Date().toLocaleString(),
            locationInfo: {
              city: location?.city,
              region: location?.region,
              country: currentCountry,
              previousCountry
            },
            deviceInfo: { 
              browser: `${deviceInfo.browser} ${deviceInfo.browserVersion}`, 
              os: `${deviceInfo.os} ${deviceInfo.osVersion}`, 
              deviceName: deviceInfo.deviceName 
            }
          }
        }).catch(err => logger.error('Failed to send new location alert:', err));
      }
    }
    
    // Check for unusual login time
    const { isUnusual, hour, timezone } = isUnusualLoginTime();
    if (isUnusual) {
      supabase.functions.invoke('send-security-alert', {
        body: {
          userEmail,
          alertType: 'unusual_time',
          timestamp: new Date().toLocaleString(),
          timeInfo: { hour, timezone },
          deviceInfo: { 
            browser: `${deviceInfo.browser} ${deviceInfo.browserVersion}`, 
            os: `${deviceInfo.os} ${deviceInfo.osVersion}`, 
            deviceName: deviceInfo.deviceName 
          }
        }
      }).catch(err => logger.error('Failed to send unusual time alert:', err));
    }
    
    return { blocked: false, ipBlocked: false, timeBlocked: false };
  } catch (error) {
    logger.error('Failed to track device:', error);
    return { blocked: false, ipBlocked: false, timeBlocked: false };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // CRITICAL FIX: Start with loading=false so app renders immediately
  // Individual pages check auth state as needed
  const [loading, setLoading] = useState(false);

  // Use refs to avoid stale closures in onAuthStateChange callback
  const isInitialLoadRef = useRef(true);
  const lastSessionIdRef = useRef<string | null>(null);
  const isTrackingRef = useRef(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Only log login events for actual new logins, not session restorations
        if (session?.user) {
          const currentSessionId = session.access_token;
          
          setTimeout(() => {
            switch (event) {
              case 'SIGNED_IN':
                // Skip if tracking is already in progress (prevents concurrent calls)
                if (isTrackingRef.current) return;

                // Only track as a login if this is a genuinely new session
                if (!isInitialLoadRef.current || lastSessionIdRef.current !== currentSessionId) {
                  // Check if this is from a fresh signIn call by looking at iat (issued at)
                  const tokenPayload = session.access_token.split('.')[1];
                  try {
                    const decoded = JSON.parse(atob(tokenPayload));
                    const issuedAt = decoded.iat * 1000;
                    const now = Date.now();
                    // If token was issued within the last 30 seconds, this is a fresh login
                    if (now - issuedAt < 30000) {
                      isTrackingRef.current = true;
                      trackDevice(session.user.id, session.user.email || '')
                        .catch(err => logger.error('trackDevice failed:', err))
                        .finally(() => { isTrackingRef.current = false; });
                    }
                  } catch {
                    // If we can't parse the token, don't log to avoid duplicates
                  }
                  lastSessionIdRef.current = currentSessionId;
                }
                break;
              case 'SIGNED_OUT':
                // Already logged in signOut function
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

    // THEN check for existing session (fire-and-forget, doesn't block)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    }).catch((error) => {
      logger.error('[Auth] Failed to get session:', error);
    });

    // Handle session-only mode (clear on browser close)
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
    
    // Log signup event and send welcome email for new users
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
    
    // Log failed login attempt
    if (error) {
      // We can't log to user's auth_events if login failed, but we could log to a separate table
      logger.error('Login failed:', error.message);
    }
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Log logout event (fire-and-forget for faster logout)
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
