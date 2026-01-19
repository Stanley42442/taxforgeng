import React from 'react';
import { WifiOff, Clock } from 'lucide-react';
import { useOfflineData } from '@/contexts/OfflineDataContext';

export const OfflineBanner: React.FC = () => {
  const { isOnline, pendingSyncCount } = useOfflineData();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">
            You're offline - Viewing cached data (read-only)
          </span>
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
