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
    },
    onRegisterError(error) {
      logger.error('[PWA] Service worker registration failed:', error);
    },
    onOfflineReady() {
      logger.debug('[PWA] Ready for offline use');
    },
  });

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
