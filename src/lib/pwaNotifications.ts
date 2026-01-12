// PWA-specific notification handling for mobile devices

let swRegistration: ServiceWorkerRegistration | null = null;

// Register service worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    console.log('[PWA] Service Worker registered:', registration.scope);
    swRegistration = registration;
    
    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] New service worker available');
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
    return null;
  }
};

// Check if running as PWA (standalone mode)
export const isPWA = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://') ||
    window.location.search.includes('pwa=true')
  );
};

// Check if mobile device
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Request notification permission with mobile-specific handling
export const requestPWANotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('[PWA] Notifications not supported');
    return false;
  }

  // Already granted
  if (Notification.permission === 'granted') {
    return true;
  }

  // Already denied
  if (Notification.permission === 'denied') {
    console.log('[PWA] Notifications denied by user');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[PWA] Notification permission:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('[PWA] Error requesting permission:', error);
    return false;
  }
};

// Show notification via Service Worker (works better on mobile)
export const showPWANotification = async (
  title: string,
  body: string,
  options?: {
    tag?: string;
    url?: string;
    vibrate?: boolean;
  }
): Promise<boolean> => {
  console.log('[PWA] Showing notification:', title);

  // Get service worker registration
  let registration = swRegistration;
  if (!registration && 'serviceWorker' in navigator) {
    registration = await navigator.serviceWorker.ready;
  }

  if (registration) {
    try {
      // Use service worker to show notification (more reliable on mobile)
      const notificationOptions: NotificationOptions = {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: options?.tag || 'taxforge-' + Date.now(),
        requireInteraction: false,
        data: { url: options?.url || '/notifications' }
      };

      await registration.showNotification(title, notificationOptions);
      
      // Vibrate separately if requested
      if (options?.vibrate !== false) {
        vibrateDevice([200, 100, 200]);
      }
      
      console.log('[PWA] Notification shown via SW');
      return true;
    } catch (error) {
      console.error('[PWA] SW notification failed:', error);
    }
  }

  // Fallback to regular Notification API
  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: options?.tag || 'taxforge-' + Date.now(),
        requireInteraction: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options?.url) {
          window.location.href = options.url;
        }
      };

      console.log('[PWA] Notification shown via Notification API');
      return true;
    } catch (error) {
      console.error('[PWA] Notification API failed:', error);
    }
  }

  return false;
};

// Vibrate device (mobile only)
export const vibrateDevice = (pattern: number[] = [200, 100, 200]): boolean => {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
      return true;
    } catch (error) {
      console.log('[PWA] Vibration not available');
    }
  }
  return false;
};

// Play notification sound that works on mobile
export const playMobileNotificationSound = async (): Promise<void> => {
  const soundEnabled = localStorage.getItem('notification-sound-enabled') !== 'false';
  if (!soundEnabled) return;

  try {
    // Create audio context with user gesture requirement handling
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.log('[PWA] AudioContext not supported');
      return;
    }

    const audioContext = new AudioContextClass();
    
    // Resume context if suspended (required on mobile)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
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

    // Close context after sound plays
    setTimeout(() => audioContext.close(), 1000);
  } catch (error) {
    console.error('[PWA] Error playing sound:', error);
  }
};

// Initialize PWA features
export const initializePWA = async (): Promise<void> => {
  console.log('[PWA] Initializing...');
  console.log('[PWA] Is PWA:', isPWA());
  console.log('[PWA] Is Mobile:', isMobileDevice());

  await registerServiceWorker();
};
