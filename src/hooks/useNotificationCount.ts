import { useState, useEffect } from "react";
import { getNotifications } from "@/lib/notifications";

export const useNotificationCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const loadCount = () => {
    const notifications = getNotifications();
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  useEffect(() => {
    loadCount();

    // Listen for storage changes (cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app-notifications') {
        loadCount();
      }
    };

    // Listen for custom event (same-tab updates)
    const handleNotificationAdded = () => {
      loadCount();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('notification-added', handleNotificationAdded);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('notification-added', handleNotificationAdded);
    };
  }, []);

  return { unreadCount, refresh: loadCount };
};