import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  addNotification, 
  playNotificationSound,
  showBrowserNotification
} from "@/lib/notifications";
import { logger } from "@/lib/logger";
import { safeLocalStorage } from "@/lib/safeStorage";

interface RealtimeConfig {
  enableToasts?: boolean;
  enableSound?: boolean;
  enableBrowserNotifications?: boolean;
}

export const useRealtimeNotifications = (config: RealtimeConfig = {}) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [newNotificationCount, setNewNotificationCount] = useState(0);

  const { 
    enableToasts = true, 
    enableSound = true, 
    enableBrowserNotifications = true 
  } = config;

  // Get preferences from localStorage (with safe access)
  const getSoundEnabled = useCallback(() => {
    const saved = safeLocalStorage.getItem('notification-sound-enabled');
    return saved !== null ? saved === 'true' : true;
  }, []);

  const getBrowserEnabled = useCallback(() => {
    const saved = safeLocalStorage.getItem('notification-browser-enabled');
    return saved !== null ? saved === 'true' : true;
  }, []);

  // Use ref to generate stable unique channel IDs
  const channelIdRef = useRef(`user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    if (!user) return;

    const channelId = channelIdRef.current;

    // Subscribe to notification_deliveries for security alerts
    const deliveriesChannel = supabase
      .channel(`deliveries-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_deliveries',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          logger.debug('New notification delivery for user:', payload);
          
          interface NotificationDelivery {
            alert_type: string;
            message_preview?: string;
            delivery_method: string;
          }
          const delivery = payload.new as NotificationDelivery;
          
          setNewNotificationCount(prev => prev + 1);

          // Add to local notifications
          const alertLabels: Record<string, string> = {
            'account_locked': 'Account Locked',
            'failed_backup_codes': 'Failed Backup Codes',
            'new_device': 'New Device Login',
            'password_changed': 'Password Changed',
            'ip_blocked': 'IP Blocked',
            'time_restricted': 'Time Restricted Access',
          };

          const title = `Security Alert: ${alertLabels[delivery.alert_type] || delivery.alert_type}`;
          const message = delivery.message_preview || `Delivered via ${delivery.delivery_method}`;

          await addNotification(title, message, 'warning');

          if (enableSound && getSoundEnabled()) {
            playNotificationSound();
          }

          if (enableBrowserNotifications && getBrowserEnabled() && Notification.permission === 'granted') {
            showBrowserNotification(title, message);
          }

          if (enableToasts) {
            toast.warning(title, { description: message });
          }

          // Dispatch event for other components
          window.dispatchEvent(new CustomEvent('notification-added'));
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Subscribe to reminders changes
    const remindersChannel = supabase
      .channel(`reminders-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          logger.debug('New reminder created:', payload);
          
          interface Reminder {
            title: string;
            is_completed?: boolean;
          }
          const reminder = payload.new as Reminder;
          
          if (enableToasts) {
            toast.success('New reminder created', {
              description: reminder.title
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          logger.debug('Reminder updated:', payload);
          
          interface Reminder {
            title: string;
            is_completed?: boolean;
          }
          const reminder = payload.new as Reminder;
          const oldReminder = payload.old as Reminder | null;
          
          // Check if reminder was just completed
          if (reminder.is_completed && !oldReminder?.is_completed) {
            if (enableToasts) {
              toast.success('Reminder completed', {
                description: reminder.title
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to auth_events for security monitoring
    const authEventsChannel = supabase
      .channel(`auth-events-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'auth_events',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          logger.debug('New auth event:', payload);
          
          interface AuthEvent {
            event_type: string;
          }
          const event = payload.new as AuthEvent;
          
          // Only notify for important events
          const importantEvents = ['new_device_login', 'password_changed', 'mfa_enabled', 'mfa_disabled'];
          if (importantEvents.includes(event.event_type)) {
            const eventLabels: Record<string, string> = {
              'new_device_login': 'New Device Login Detected',
              'password_changed': 'Password Was Changed',
              'mfa_enabled': '2FA Enabled',
              'mfa_disabled': '2FA Disabled',
            };

            const title = eventLabels[event.event_type] || event.event_type;
            await addNotification('Security Event', title, 'warning');
            
            if (enableToasts) {
              toast.warning('Security Event', { description: title });
            }

            window.dispatchEvent(new CustomEvent('notification-added'));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(deliveriesChannel);
      supabase.removeChannel(remindersChannel);
      supabase.removeChannel(authEventsChannel);
    };
  }, [user, enableToasts, enableSound, enableBrowserNotifications, getSoundEnabled, getBrowserEnabled]);

  const clearNewCount = useCallback(() => {
    setNewNotificationCount(0);
  }, []);

  return { 
    isConnected, 
    newNotificationCount,
    clearNewCount
  };
};
