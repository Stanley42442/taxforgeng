import { useRegisterSW } from 'virtual:pwa-register/react';
import logger from '@/lib/logger';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

export const PWAUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      logger.debug('[PWA] Service worker registered:', registration?.scope);
      
      // Set up periodic update checking (every 60 minutes)
      if (registration) {
        setInterval(() => {
          registration.update();
          logger.debug('[PWA] Checking for updates...');
        }, 60 * 60 * 1000); // Every hour
      }
    },
    onRegisterError(error) {
      logger.error('[PWA] Service worker registration failed:', error);
    },
    onOfflineReady() {
      logger.debug('[PWA] Ready for offline use');
    },
  });

  // Also check for updates when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (needRefresh) {
      toast.info('New version available!', {
        description: 'Click to update and get the latest features.',
        duration: Infinity,
        icon: <RefreshCw className="h-5 w-5 animate-spin" />,
        action: {
          label: 'Update Now',
          onClick: () => updateServiceWorker(true),
        },
        onDismiss: () => {
          // If dismissed, update on next page load
          logger.debug('[PWA] Update dismissed, will apply on next load');
        },
      });
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
};
