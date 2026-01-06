import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { getDeviceInfo } from '@/lib/deviceFingerprint';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
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
    console.error('Failed to get client IP:', error);
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
    console.error('Failed to get location:', error);
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
    console.error('Failed to log auth event:', error);
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

// Track device on login with location awareness
const trackDevice = async (userId: string, userEmail: string) => {
  try {
    const deviceInfo = await getDeviceInfo();
    const clientIP = await getClientIP();
    const location = clientIP ? await getLocationFromIP(clientIP) : null;
    
    // Check if device is blocked
    const blocked = await isDeviceBlocked(userId, deviceInfo.fingerprint);
    if (blocked) {
      console.warn('Login from blocked device detected');
      return { blocked: true };
    }
    
    // Check if device exists
    const { data: existingDevice } = await supabase
      .from('known_devices')
      .select('id, is_trusted, last_country')
      .eq('user_id', userId)
      .eq('device_fingerprint', deviceInfo.fingerprint)
      .single();
    
    // Get user's previous known locations for new country detection
    const { data: previousDevices } = await supabase
      .from('known_devices')
      .select('last_country')
      .eq('user_id', userId)
      .not('last_country', 'is', null);
    
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
        }).catch(err => console.error('Failed to send new location alert:', err));
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
      }).catch(err => console.error('Failed to send new device alert:', err));
      
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
        }).catch(err => console.error('Failed to send new location alert:', err));
      }
    }
    
    return { blocked: false };
  } catch (error) {
    console.error('Failed to track device:', error);
    return { blocked: false };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Track if this is a fresh login vs session restoration
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Only log login events for actual new logins, not session restorations
        if (session?.user) {
          const currentSessionId = session.access_token;
          
          setTimeout(() => {
            switch (event) {
              case 'SIGNED_IN':
                // Only track as a login if this is a genuinely new session
                // (not just restoring from localStorage on page refresh)
                if (!isInitialLoad || lastSessionId !== currentSessionId) {
                  // Check if this is from a fresh signIn call by looking at iat (issued at)
                  const tokenPayload = session.access_token.split('.')[1];
                  try {
                    const decoded = JSON.parse(atob(tokenPayload));
                    const issuedAt = decoded.iat * 1000; // Convert to ms
                    const now = Date.now();
                    // If token was issued within the last 30 seconds, this is a fresh login
                    if (now - issuedAt < 30000) {
                      trackDevice(session.user.id, session.user.email || '');
                    }
                  } catch {
                    // If we can't parse the token, don't log to avoid duplicates
                  }
                  setLastSessionId(currentSessionId);
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
        
        setIsInitialLoad(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Handle session-only mode (clear on browser close)
    const handleBeforeUnload = () => {
      const isSessionOnly = sessionStorage.getItem('taxforge-session-only');
      if (isSessionOnly === 'true') {
        // Clear auth tokens from localStorage when browser closes
        // This effectively logs out users who didn't check "Remember me"
        localStorage.removeItem('sb-uhuxqrrtsiintcwpxxwy-auth-token');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || ''
        }
      }
    });
    
    // Log signup event and send welcome email for new users
    if (!error && data.user) {
      logAuthEvent(data.user.id, 'signup');
      
      supabase.functions.invoke('send-welcome-email', {
        body: { email, name: fullName }
      }).catch(err => {
        console.error('Failed to send welcome email:', err);
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
      console.error('Login failed:', error.message);
    }
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Log logout event before signing out
    if (user) {
      await logAuthEvent(user.id, 'logout');
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
