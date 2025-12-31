import { useReminderNotifications } from "@/hooks/useReminderNotifications";

export const ReminderNotificationProvider = () => {
  // This hook handles all the notification logic
  useReminderNotifications();
  
  // This component doesn't render anything visible
  return null;
};
