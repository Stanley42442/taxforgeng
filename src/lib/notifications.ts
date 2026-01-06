// Notification utility for adding app-wide notifications

export type NotificationType = 'reminder' | 'warning' | 'info' | 'success';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
}

// Play notification sound using Web Audio API
export const playNotificationSound = () => {
  try {
    const soundEnabled = localStorage.getItem('notification-sound-enabled') !== 'false';
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
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
    playTone(880, now, 0.15);
    playTone(1108.73, now + 0.15, 0.2);
    playTone(1318.51, now + 0.3, 0.25);
    
  } catch (error) {
    console.error("Error playing notification sound:", error);
  }
};

// Show browser notification
export const showBrowserNotification = (title: string, body: string, redirectUrl?: string) => {
  const browserEnabled = localStorage.getItem('notification-browser-enabled') !== 'false';
  
  if (Notification.permission === "granted" && browserEnabled) {
    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: `notification-${Date.now()}`,
      requireInteraction: false,
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    };
  }
};

// Add a notification to localStorage
export const addNotification = (
  title: string, 
  message: string, 
  type: NotificationType,
  options?: {
    playSound?: boolean;
    showBrowserNotification?: boolean;
    browserRedirectUrl?: string;
  }
): AppNotification => {
  const notification: AppNotification = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false
  };

  try {
    const existing = localStorage.getItem('app-notifications');
    const notifications: AppNotification[] = existing ? JSON.parse(existing) : [];
    
    // Keep only last 50 notifications
    const updated = [notification, ...notifications].slice(0, 50);
    localStorage.setItem('app-notifications', JSON.stringify(updated));
    
    // Dispatch custom event for real-time updates within the same tab
    window.dispatchEvent(new CustomEvent('notification-added', { detail: notification }));
  } catch (error) {
    console.error('Error saving notification:', error);
  }

  // Optional sound
  if (options?.playSound) {
    playNotificationSound();
  }

  // Optional browser notification
  if (options?.showBrowserNotification) {
    showBrowserNotification(title, message, options.browserRedirectUrl);
  }

  return notification;
};

// Get all notifications
export const getNotifications = (): AppNotification[] => {
  try {
    const saved = localStorage.getItem('app-notifications');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Mark notification as read
export const markNotificationRead = (id: string): void => {
  try {
    const notifications = getNotifications();
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem('app-notifications', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('notification-added'));
  } catch (error) {
    console.error('Error marking notification read:', error);
  }
};

// Clear all notifications
export const clearAllNotifications = (): void => {
  localStorage.removeItem('app-notifications');
  window.dispatchEvent(new CustomEvent('notification-added'));
};

// Convenience methods for different notification types
export const notifySuccess = (title: string, message: string, playSound = false) => 
  addNotification(title, message, 'success', { playSound });

export const notifyInfo = (title: string, message: string, playSound = false) => 
  addNotification(title, message, 'info', { playSound });

export const notifyWarning = (title: string, message: string, playSound = true) => 
  addNotification(title, message, 'warning', { playSound, showBrowserNotification: true });

export const notifyReminder = (title: string, message: string) => 
  addNotification(title, message, 'reminder', { playSound: true, showBrowserNotification: true, browserRedirectUrl: '/reminders' });

// Achievement notification
export const notifyAchievement = (badgeName: string, points: number) => 
  addNotification(
    `🏆 Achievement Unlocked!`,
    `You earned "${badgeName}" (+${points} points)`,
    'success',
    { playSound: true, showBrowserNotification: true, browserRedirectUrl: '/achievements' }
  );

// Tax calculation notification
export const notifyTaxCalculation = (entityType: string, totalTax: number) => {
  const formattedTax = new Intl.NumberFormat('en-NG', { 
    style: 'currency', 
    currency: 'NGN',
    minimumFractionDigits: 0 
  }).format(totalTax);
  
  return addNotification(
    `Tax Calculation Complete`,
    `Your ${entityType} tax calculation is ready. Estimated tax: ${formattedTax}`,
    'success',
    { playSound: false }
  );
};

// Expense notification
export const notifyExpenseAdded = (description: string, amount: number, isIncome: boolean) => {
  const formattedAmount = new Intl.NumberFormat('en-NG', { 
    style: 'currency', 
    currency: 'NGN',
    minimumFractionDigits: 0 
  }).format(amount);
  
  return addNotification(
    isIncome ? 'Income Added' : 'Expense Added',
    `${description}: ${formattedAmount}`,
    'info',
    { playSound: false }
  );
};

// Tax deadline reminder
export const notifyTaxDeadline = (title: string, dueDate: string) => 
  addNotification(
    `📅 Tax Deadline Reminder`,
    `${title} is due on ${dueDate}`,
    'warning',
    { playSound: true, showBrowserNotification: true, browserRedirectUrl: '/reminders' }
  );

// Security alert notification
export const notifySecurityAlert = (title: string, message: string) => 
  addNotification(
    `🚨 ${title}`,
    message,
    'warning',
    { playSound: true, showBrowserNotification: true, browserRedirectUrl: '/security' }
  );

// IP blocked notification
export const notifyIPBlocked = (ip: string, location?: string) => {
  const locationText = location ? ` from ${location}` : '';
  return addNotification(
    `🚫 Login Blocked`,
    `A login attempt from IP ${ip}${locationText} was blocked (not in whitelist)`,
    'warning',
    { playSound: true, showBrowserNotification: true, browserRedirectUrl: '/security' }
  );
};

// Time restricted login notification
export const notifyTimeRestricted = (hour: number, timezone: string) => 
  addNotification(
    `🕐 Login Blocked`,
    `A login attempt at ${hour}:00 (${timezone}) was blocked (outside allowed hours)`,
    'warning',
    { playSound: true, showBrowserNotification: true, browserRedirectUrl: '/security' }
  );
