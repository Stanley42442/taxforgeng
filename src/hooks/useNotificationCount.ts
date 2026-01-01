import { useState, useEffect } from "react";

export const useNotificationCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const loadCount = () => {
    const savedNotifications = localStorage.getItem('app-notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        const unread = parsed.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      } catch (e) {
        console.error('Error parsing notifications:', e);
        setUnreadCount(0);
      }
    } else {
      setUnreadCount(0);
    }
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

  return { unreadCount };
};
