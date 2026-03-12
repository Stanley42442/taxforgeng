import React, { useState, useEffect } from 'react';
import { WifiOff, Clock, Signal } from 'lucide-react';
import { useOfflineData } from '@/contexts/OfflineDataContext';

// Network Information API types
interface NetworkInformation {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  downlink?: number;
  rtt?: number;
  addEventListener?: (event: string, handler: () => void) => void;
  removeEventListener?: (event: string, handler: () => void) => void;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

export const OfflineBanner: React.FC = () => {
  const { isOnline, pendingSyncCount } = useOfflineData();
  const [connectionQuality, setConnectionQuality] = useState<string | null>(null);

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    const updateConnectionQuality = () => {
      if (connection?.effectiveType) {
        const type = connection.effectiveType;
        if (type === 'slow-2g' || type === '2g') {
          setConnectionQuality('slow');
        } else if (type === '3g') {
          setConnectionQuality('moderate');
        } else {
          setConnectionQuality(null);
        }
      }
    };

    updateConnectionQuality();
    
    if (connection?.addEventListener) {
      connection.addEventListener('change', updateConnectionQuality);
      return () => connection.removeEventListener?.('change', updateConnectionQuality);
    }
  }, []);

  // Show slow connection warning even when online
  if (isOnline && connectionQuality === 'slow') {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-warning text-warning-foreground px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Signal className="h-4 w-4" />
          <span className="text-sm font-medium">
            Slow connection detected - Some features may load slowly
          </span>
        </div>
      </div>
    );
  }

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-warning text-warning-foreground px-4 py-2">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="h-4 w-4" />
          <div className="text-sm">
            <span className="font-medium">You're offline</span>
            <span className="hidden sm:inline"> — Tax calculators & cached data available</span>
          </div>
        </div>
        {pendingSyncCount > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4" />
            <span>{pendingSyncCount} pending sync{pendingSyncCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};
