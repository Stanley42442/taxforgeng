import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { 
  playNotificationSound, 
  showBrowserNotification, 
  addNotification 
} from "@/lib/notifications";
import logger from "@/lib/logger";
import { safeLocalStorage } from "@/lib/safeStorage";

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    logger.debug("This browser does not support notifications");
    return false;
  }
  
  if (Notification.permission === "granted") {
    return true;
  }
  
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  
  return false;
};

// Check if sound is enabled
const isSoundEnabled = () => {
  return safeLocalStorage.getItem('notification-sound-enabled') !== 'false';
};

interface DueReminder {
  id: string;
  title: string;
  due_date: string;
}

export const useReminderNotifications = () => {
  const { user } = useAuth();
  const notifiedReminders = useRef<Set<string>>(new Set());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkDueReminders = useCallback(async () => {
    if (!user) return;

    const now = new Date();
    const twentyMinutesFromNow = new Date(now.getTime() + 20 * 60 * 1000);

    const { data: reminders, error } = await supabase
      .from("reminders")
      .select("id, title, due_date")
      .eq("user_id", user.id)
      .eq("is_completed", false)
      .eq("notify_email", true)
      .lte("due_date", twentyMinutesFromNow.toISOString())
      .gte("due_date", now.toISOString());

    if (error) {
      logger.error("Error checking due reminders:", error);
      return;
    }

    for (const reminder of (reminders as DueReminder[] || [])) {
      if (!notifiedReminders.current.has(reminder.id)) {
        notifiedReminders.current.add(reminder.id);
        
        // Play sound if enabled
        if (isSoundEnabled()) {
          playNotificationSound();
        }
        
        // Show toast
        toast.warning(`Reminder: ${reminder.title}`, {
          description: "This reminder is due now!",
          duration: 10000,
          action: {
            label: "View",
            onClick: () => window.location.href = "/reminders",
          },
        });
        
        // Show browser notification
        showBrowserNotification(
          "TaxForge NG Reminder",
          `${reminder.title} is due now!`
        );
        
        // Save to notification list
        addNotification(
          `Reminder: ${reminder.title}`,
          "This reminder is due now!",
          'reminder'
        );
      }
    }
    
    // Also check for overdue reminders that just became overdue
    const { data: overdueReminders, error: overdueError } = await supabase
      .from("reminders")
      .select("id, title, due_date")
      .eq("user_id", user.id)
      .eq("is_completed", false)
      .eq("notify_email", true)
      .lt("due_date", now.toISOString())
      .gte("due_date", new Date(now.getTime() - 20 * 60 * 1000).toISOString());

    if (overdueError) {
      logger.error("Error checking overdue reminders:", overdueError);
      return;
    }

    for (const reminder of (overdueReminders as DueReminder[] || [])) {
      const overdueKey = `overdue-${reminder.id}`;
      if (!notifiedReminders.current.has(overdueKey)) {
        notifiedReminders.current.add(overdueKey);
        
        // Play sound if enabled
        if (isSoundEnabled()) {
          playNotificationSound();
        }
        
        toast.error(`Overdue: ${reminder.title}`, {
          description: "This reminder is now overdue!",
          duration: 10000,
          action: {
            label: "View",
            onClick: () => window.location.href = "/reminders",
          },
        });
        
        showBrowserNotification(
          "TaxForge NG - Overdue Reminder",
          `${reminder.title} is now overdue!`
        );
        
        // Save to notification list
        addNotification(
          `Overdue: ${reminder.title}`,
          "This reminder is now overdue!",
          'warning'
        );
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Request notification permission on mount
    requestNotificationPermission();

    // Check immediately
    checkDueReminders();

    // Check every minute
    checkIntervalRef.current = setInterval(checkDueReminders, 5 * 60 * 1000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [user, checkDueReminders]);

  return { checkDueReminders, requestNotificationPermission };
};
