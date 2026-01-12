import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useNotificationCount = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadCount = useCallback(async () => {
    if (!user) {
      // Fallback to localStorage for non-authenticated users
      try {
        const saved = localStorage.getItem('app-notifications');
        const notifications = saved ? JSON.parse(saved) : [];
        setUnreadCount(notifications.filter((n: any) => !n.read).length);
      } catch {
        setUnreadCount(0);
      }
      return;
    }

    try {
      const { count, error } = await supabase
        .from('user_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error fetching notification count:', error);
        return;
      }

      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  }, [user]);

  useEffect(() => {
    loadCount();
  }, [loadCount]);

  // Set up realtime subscription for count updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notification-count-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadCount]);

  useEffect(() => {
    // Listen for custom event (same-tab updates)
    const handleNotificationAdded = () => {
      loadCount();
    };

    window.addEventListener('notification-added', handleNotificationAdded);
    
    return () => {
      window.removeEventListener('notification-added', handleNotificationAdded);
    };
  }, [loadCount]);

  return { unreadCount, refresh: loadCount };
};
