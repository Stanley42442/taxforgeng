import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to log auth events
const logAuthEvent = async (userId: string, eventType: string, metadata?: Json) => {
  try {
    await supabase.from('auth_events').insert([{
      user_id: userId,
      event_type: eventType,
      user_agent: navigator.userAgent,
      metadata: metadata || {}
    }]);
  } catch (error) {
    console.error('Failed to log auth event:', error);
  }
};

// Helper to get or create device info
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';
  
  // Detect browser
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Opera')) browser = 'Opera';
  
  // Detect OS
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  const deviceName = `${browser} on ${os}`;
  
  // Simple fingerprint based on user agent and screen
  const fingerprint = btoa(`${ua}-${screen.width}x${screen.height}-${new Date().getTimezoneOffset()}`).slice(0, 32);
  
  return { browser, os, deviceName, fingerprint };
};

// Track device on login
const trackDevice = async (userId: string, userEmail: string) => {
  try {
    const { browser, os, deviceName, fingerprint } = getDeviceInfo();
    
    // Check if device exists
    const { data: existingDevice } = await supabase
      .from('known_devices')
      .select('id, is_trusted')
      .eq('user_id', userId)
      .eq('device_fingerprint', fingerprint)
      .single();
    
    if (existingDevice) {
      // Update last seen
      await supabase
        .from('known_devices')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', existingDevice.id);
    } else {
      // Insert new device
      await supabase
        .from('known_devices')
        .insert({
          user_id: userId,
          device_fingerprint: fingerprint,
          device_name: deviceName,
          browser,
          os,
          is_trusted: false
        });
      
      // Send new device alert (non-blocking)
      supabase.functions.invoke('send-security-alert', {
        body: {
          userEmail,
          alertType: 'new_device',
          timestamp: new Date().toLocaleString(),
          deviceInfo: { browser, os, deviceName }
        }
      }).catch(err => console.error('Failed to send new device alert:', err));
    }
  } catch (error) {
    console.error('Failed to track device:', error);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Log auth events based on event type
        if (session?.user) {
          setTimeout(() => {
            switch (event) {
              case 'SIGNED_IN':
                logAuthEvent(session.user.id, 'login_success');
                trackDevice(session.user.id, session.user.email || '');
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
