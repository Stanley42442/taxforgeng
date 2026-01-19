import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, RefreshCw } from 'lucide-react';
import { useOfflineData } from '@/contexts/OfflineDataContext';
import { useCacheCleanup } from '@/hooks/useCacheCleanup';

export const CleanupSettingsCard: React.FC = () => {
  const { 
    lastCleanupStats,
    isCleanupRunning,
    runCleanup,
  } = useOfflineData();
  
  const { retentionConfig, updateRetentionConfig } = useCacheCleanup();

  if (!retentionConfig) return null;

  const formatLastCleanup = () => {
    if (!lastCleanupStats) return 'Never';
    const date = lastCleanupStats.lastCleanupTime;
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trash2 className="h-5 w-5" />
          Automatic Cleanup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-cleanup toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-cleanup">Auto-cleanup enabled</Label>
          <Switch
            id="auto-cleanup"
            checked={retentionConfig.autoCleanupEnabled}
            onCheckedChange={(checked) => 
              updateRetentionConfig({ autoCleanupEnabled: checked })
            }
          />
        </div>

        {/* Calculation retention */}
        <div className="space-y-2">
          <Label>Calculation history retention</Label>
          <Select
            value={String(retentionConfig.calculationRetentionDays)}
            onValueChange={(value) => 
              updateRetentionConfig({ calculationRetentionDays: Number(value) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expense archive */}
        <div className="space-y-2">
          <Label>Archive expenses after</Label>
          <Select
            value={String(retentionConfig.expenseArchiveDays)}
            onValueChange={(value) => 
              updateRetentionConfig({ expenseArchiveDays: Number(value) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="180">180 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
              <SelectItem value="730">2 years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Last cleanup stats */}
        <div className="p-3 rounded-lg bg-muted text-sm">
          <p className="text-muted-foreground">
            Last cleanup: {formatLastCleanup()}
          </p>
          {lastCleanupStats && (
            <p className="text-muted-foreground">
              Removed {lastCleanupStats.calculationsRemoved} calculations, 
              freed {lastCleanupStats.spaceFreedFormatted}
            </p>
          )}
        </div>

        {/* Manual cleanup button */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => runCleanup()}
          disabled={isCleanupRunning}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isCleanupRunning ? 'animate-spin' : ''}`} />
          {isCleanupRunning ? 'Cleaning...' : 'Run Cleanup Now'}
        </Button>
      </CardContent>
    </Card>
  );
};
