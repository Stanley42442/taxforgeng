import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { HardDrive, Shield, Trash2 } from 'lucide-react';
import { useOfflineData } from '@/contexts/OfflineDataContext';
import { formatBytes } from '@/lib/compression';
import { getProgressColor, getWarningColor } from '@/lib/storageQuota';

export const StorageQuotaCard: React.FC = () => {
  const { 
    quotaInfo, 
    storageStats,
    quotaWarningLevel,
    isPersistentStorage,
    requestPersistentStorage,
    cleanupSuggestions,
  } = useOfflineData();

  if (!quotaInfo) return null;

  const progressColor = getProgressColor(quotaWarningLevel);
  const textColor = getWarningColor(quotaWarningLevel);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <HardDrive className="h-5 w-5" />
          Storage Quota
          {isPersistentStorage && (
            <Badge variant="secondary" className="ml-auto">
              <Shield className="h-3 w-3 mr-1" />
              Persistent
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={textColor}>
              Used: {quotaInfo.usageFormatted}
            </span>
            <span className="text-muted-foreground">
              of {quotaInfo.quotaFormatted}
            </span>
          </div>
          <Progress 
            value={quotaInfo.usagePercent} 
            className="h-3"
          />
          <p className="text-xs text-muted-foreground">
            {quotaInfo.availableFormatted} available
          </p>
        </div>

        {/* Breakdown by table */}
        {storageStats && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Breakdown:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(storageStats.byTable).map(([table, data]) => (
                <div key={table} className="flex justify-between">
                  <span className="capitalize">{table}</span>
                  <span className="text-muted-foreground">
                    {formatBytes(data.size)} ({data.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compression savings */}
        {storageStats && storageStats.compressionRatio > 0 && (
          <div className="p-3 rounded-lg bg-success/10 text-success text-sm">
            💾 Saving {formatBytes(storageStats.totalOriginalSize - storageStats.totalCompressedSize)} 
            ({storageStats.compressionRatio.toFixed(0)}% compression)
          </div>
        )}

        {/* Cleanup suggestions */}
        {cleanupSuggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Suggested cleanup:</p>
            {cleanupSuggestions.slice(0, 2).map((suggestion) => (
              <div 
                key={suggestion.id}
                className="flex items-center justify-between p-2 rounded border text-sm"
              >
                <div>
                  <p className="font-medium">{suggestion.action}</p>
                  <p className="text-xs text-muted-foreground">
                    Save ~{suggestion.estimatedSavingsFormatted}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Request persistent storage */}
        {!isPersistentStorage && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={requestPersistentStorage}
          >
            <Shield className="h-4 w-4 mr-2" />
            Request Persistent Storage
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
