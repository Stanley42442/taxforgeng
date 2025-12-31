import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a pleasant notification sound (two-tone chime)
    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const now = audioContext.currentTime;
    playTone(880, now, 0.15); // A5
    playTone(1108.73, now + 0.15, 0.2); // C#6
    playTone(1318.51, now + 0.3, 0.25); // E6
    
  } catch (error) {
    console.error("Error playing notification sound:", error);
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
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

// Show browser notification
const showBrowserNotification = (title: string, body: string) => {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "reminder-notification",
      requireInteraction: true,
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
      window.location.href = "/reminders";
    };
  }
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
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    const { data: reminders, error } = await supabase
      .from("reminders")
      .select("id, title, due_date")
      .eq("user_id", user.id)
      .eq("is_completed", false)
      .eq("notify_email", true)
      .lte("due_date", fiveMinutesFromNow.toISOString())
      .gte("due_date", now.toISOString());

    if (error) {
      console.error("Error checking due reminders:", error);
      return;
    }

    for (const reminder of (reminders as DueReminder[] || [])) {
      if (!notifiedReminders.current.has(reminder.id)) {
        notifiedReminders.current.add(reminder.id);
        
        // Play sound
        playNotificationSound();
        
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
      .gte("due_date", new Date(now.getTime() - 5 * 60 * 1000).toISOString());

    if (overdueError) {
      console.error("Error checking overdue reminders:", overdueError);
      return;
    }

    for (const reminder of (overdueReminders as DueReminder[] || [])) {
      const overdueKey = `overdue-${reminder.id}`;
      if (!notifiedReminders.current.has(overdueKey)) {
        notifiedReminders.current.add(overdueKey);
        
        playNotificationSound();
        
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
    checkIntervalRef.current = setInterval(checkDueReminders, 60 * 1000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [user, checkDueReminders]);

  return { checkDueReminders, requestNotificationPermission };
};
