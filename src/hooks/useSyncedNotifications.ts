import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { 
  getNotifications, 
  type AppNotification,
  playNotificationSound,
  showBrowserNotification
} from "@/lib/notifications";
import { safeLocalStorage } from "@/lib/safeStorage";
import logger from "@/lib/logger";

interface UserNotificationPayload {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export const useSyncedNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
  // Unique channel ID to prevent conflicts across tabs
  const channelIdRef = useRef(`notifications-sync-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      logger.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Set up realtime subscription for cross-device sync
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(channelIdRef.current)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          logger.debug('[Notifications] New notification received:', payload);
          const newNotification = payload.new as UserNotificationPayload;
          
          setNotifications(prev => {
            // Check if notification already exists
            if (prev.some(n => n.id === newNotification.id)) {
              return prev;
            }
            
            const notification: AppNotification = {
              id: newNotification.id,
              title: newNotification.title,
              message: newNotification.message,
              type: newNotification.type as AppNotification['type'],
              timestamp: newNotification.created_at,
              read: newNotification.read,
              user_id: newNotification.user_id
            };
            
            // Play sound and show browser notification for new notifications
            const soundEnabled = safeLocalStorage.getItem('notification-sound-enabled') !== 'false';
            if (soundEnabled) {
              playNotificationSound();
            }
            
            const browserEnabled = safeLocalStorage.getItem('notification-browser-enabled') !== 'false';
            if (browserEnabled && Notification.permission === 'granted') {
              showBrowserNotification(notification.title, notification.message);
            }
            
            return [notification, ...prev].slice(0, 50);
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          logger.debug('[Notifications] Notification updated:', payload);
          const updatedNotification = payload.new as UserNotificationPayload;
          
          setNotifications(prev => 
            prev.map(n => 
              n.id === updatedNotification.id 
                ? {
                    ...n,
                    read: updatedNotification.read,
                    title: updatedNotification.title,
                    message: updatedNotification.message
                  }
                : n
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          logger.debug('[Notifications] Notification deleted:', payload);
          const deletedId = (payload.old as { id: string }).id;
          setNotifications(prev => prev.filter(n => n.id !== deletedId));
        }
      )
      .subscribe((status) => {
        logger.debug('[Notifications] Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Listen for local notification events - debounced to prevent duplicate fetches
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null;
    
    const debouncedLoad = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadNotifications();
      }, 500);
    };

    // Only reload from local events if realtime isn't connected (fallback)
    const handleNotificationAdded = () => {
      if (!isConnected) {
        debouncedLoad();
      }
    };

    window.addEventListener('notification-added', handleNotificationAdded);
    
    // Refresh when app comes back to foreground (debounced)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        debouncedLoad();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('notification-added', handleNotificationAdded);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadNotifications, isConnected]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    isConnected,
    unreadCount,
    refresh: loadNotifications
  };
};
