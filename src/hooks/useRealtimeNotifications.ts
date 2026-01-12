import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  addNotification, 
  playNotificationSound,
  showBrowserNotification
} from "@/lib/notifications";

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

  // Get preferences from localStorage
  const getSoundEnabled = useCallback(() => {
    const saved = localStorage.getItem('notification-sound-enabled');
    return saved !== null ? saved === 'true' : true;
  }, []);

  const getBrowserEnabled = useCallback(() => {
    const saved = localStorage.getItem('notification-browser-enabled');
    return saved !== null ? saved === 'true' : true;
  }, []);

  useEffect(() => {
    if (!user) return;

    // Subscribe to notification_deliveries for security alerts
    const deliveriesChannel = supabase
      .channel('user-notification-deliveries')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_deliveries',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New notification delivery for user:', payload);
          const delivery = payload.new as any;
          
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
      .channel('user-reminders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New reminder created:', payload);
          const reminder = payload.new as any;
          
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
          console.log('Reminder updated:', payload);
          const reminder = payload.new as any;
          const oldReminder = payload.old as any;
          
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
      .channel('user-auth-events-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'auth_events',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New auth event:', payload);
          const event = payload.new as any;
          
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
