import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import logger from '@/lib/logger';

/**
 * NativeAppGate handles incoming deep links (e.g. taxforgeng://)
 * when the app is running on a native platform (Android/iOS).
 */
export const NativeAppGate = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Handle deep links when the app is already open or launched via link
    const setupAppUrlListener = async () => {
      await App.addListener('appUrlOpen', (event) => {
        logger.info('App opened with URL:', event.url);
        
        // Example URL: taxforgeng://auth#access_token=...&type=recovery
        // We want to extract the path and the hash/params
        const slug = event.url.split('taxforgeng://').pop();
        
        if (slug) {
          // If it's taxforgeng://auth, we navigate to /auth with the rest of the string
          // Capacitor URLs sometimes include the full domain if configured differently, 
          // but here we expect the scheme.
          
          let targetPath = slug;
          if (!targetPath.startsWith('/')) {
            targetPath = '/' + targetPath;
          }

          logger.info('Navigating to deep link path:', targetPath);
          navigate(targetPath);
        }
      });
    };

    setupAppUrlListener();

    return () => {
      App.removeAllListeners();
    };
  }, [navigate]);

  return <>{children}</>;
};

export default NativeAppGate;
