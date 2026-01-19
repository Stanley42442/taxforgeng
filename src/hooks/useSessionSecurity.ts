import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ActiveSession {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  location: { city?: string; country?: string };
  ipAddress: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export function useSessionSecurity() {
  const { user, session } = useAuth();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-sessions', {
        body: { operation: 'list' }
      });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const revokeSession = useCallback(async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      const { data, error } = await supabase.functions.invoke('manage-sessions', {
        body: { operation: 'revoke_one', sessionId }
      });

      if (error) throw error;
      toast.success('Session revoked successfully');
      await fetchSessions();
    } catch (error) {
      toast.error('Failed to revoke session');
      console.error(error);
    } finally {
      setRevoking(null);
    }
  }, [fetchSessions]);

  const revokeAllOtherSessions = useCallback(async (reason?: string) => {
    setRevoking('all');
    try {
      const { data, error } = await supabase.functions.invoke('manage-sessions', {
        body: { 
          operation: 'revoke_all', 
          excludeCurrent: true,
          reason: reason || 'user_initiated'
        }
      });

      if (error) throw error;
      toast.success(`Logged out of ${data?.sessionsRevoked || 0} other device(s)`);
      await fetchSessions();
      return data?.sessionsRevoked || 0;
    } catch (error) {
      toast.error('Failed to revoke sessions');
      console.error(error);
      return 0;
    } finally {
      setRevoking(null);
    }
  }, [fetchSessions]);

  const checkSessionValidity = useCallback(async (): Promise<boolean> => {
    if (!session) return true;
    
    try {
      const { data, error } = await supabase.functions.invoke('manage-sessions', {
        body: { operation: 'check_validity' }
      });

      if (error) return true; // Fail open on error
      
      if (data && !data.valid) {
        // Session has been invalidated
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Session validity check failed:', error);
      return true; // Fail open on error
    }
  }, [session]);

  const registerSession = useCallback(async (deviceInfo?: Record<string, unknown>, location?: Record<string, unknown>) => {
    if (!user) return;
    
    try {
      await supabase.functions.invoke('manage-sessions', {
        body: { 
          operation: 'register',
          deviceInfo,
          location
        }
      });
    } catch (error) {
      console.error('Failed to register session:', error);
    }
  }, [user]);

  // Fetch sessions on mount
  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  // Periodically check session validity
  useEffect(() => {
    if (!session) return;

    const checkValidity = async () => {
      const isValid = await checkSessionValidity();
      if (!isValid) {
        toast.error('Your session was terminated for security reasons. Please log in again.', {
          duration: 6000
        });
        await supabase.auth.signOut();
      }
    };

    // Check on mount
    checkValidity();

    // Check every 5 minutes
    const interval = setInterval(checkValidity, 5 * 60 * 1000);

    // Check on visibility change (tab focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkValidity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session, checkSessionValidity]);

  return {
    sessions,
    loading,
    revoking,
    fetchSessions,
    revokeSession,
    revokeAllOtherSessions,
    checkSessionValidity,
    registerSession,
  };
}
