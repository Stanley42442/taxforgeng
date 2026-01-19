import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOfflineData } from '@/contexts/OfflineDataContext';
import { getWarningMessage } from '@/lib/storageQuota';

export const StorageWarningBanner: React.FC = () => {
  const { 
    quotaInfo, 
    quotaWarningLevel, 
    showQuotaWarning,
    dismissQuotaWarning,
    cleanupSuggestions,
    runCleanup,
    isCleanupRunning,
  } = useOfflineData();

  if (!showQuotaWarning || !quotaInfo || quotaWarningLevel === 'none') {
    return null;
  }

  const message = getWarningMessage(quotaWarningLevel, quotaInfo.usagePercent);
  
  const bgColor = {
    low: 'bg-muted',
    medium: 'bg-yellow-500/10 border-yellow-500/20',
    high: 'bg-orange-500/10 border-orange-500/20',
    critical: 'bg-destructive/10 border-destructive/20',
    none: '',
  }[quotaWarningLevel];

  const iconColor = {
    low: 'text-muted-foreground',
    medium: 'text-yellow-500',
    high: 'text-orange-500',
    critical: 'text-destructive',
    none: '',
  }[quotaWarningLevel];

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 p-4 border-b ${bgColor}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-3">
          <AlertTriangle className={`h-5 w-5 mt-0.5 ${iconColor}`} />
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
            
            {cleanupSuggestions.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">Suggested actions:</p>
                <div className="flex flex-wrap gap-2">
                  {cleanupSuggestions.slice(0, 3).map((suggestion) => (
                    <Button
                      key={suggestion.id}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      disabled={isCleanupRunning}
                    >
                      {suggestion.action} (save ~{suggestion.estimatedSavingsFormatted})
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => runCleanup()}
              disabled={isCleanupRunning}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clean Up
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={dismissQuotaWarning}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
