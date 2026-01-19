import { useState, useEffect, useCallback } from 'react';
import { 
  getStorageQuota, 
  StorageQuotaInfo, 
  StorageBreakdown,
  CleanupSuggestion,
  requestPersistentStorage,
  generateCleanupSuggestions,
  WarningLevel,
} from '@/lib/storageQuota';
import { getStorageStats, getRetentionConfig } from '@/lib/offlineStorage';

export interface UseStorageQuotaReturn {
  quotaInfo: StorageQuotaInfo | null;
  breakdown: StorageBreakdown | null;
  isLoading: boolean;
  error: string | null;
  warningLevel: WarningLevel;
  showWarning: boolean;
  suggestions: CleanupSuggestion[];
  isPersistent: boolean;
  refreshQuota: () => Promise<void>;
  requestPersistence: () => Promise<boolean>;
  dismissWarning: () => void;
}

export const useStorageQuota = (): UseStorageQuotaReturn => {
  const [quotaInfo, setQuotaInfo] = useState<StorageQuotaInfo | null>(null);
  const [breakdown, setBreakdown] = useState<StorageBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(true);
  const [suggestions, setSuggestions] = useState<CleanupSuggestion[]>([]);

  const refreshQuota = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [quota, stats, retentionConfig] = await Promise.all([
        getStorageQuota(),
        getStorageStats(),
        getRetentionConfig(),
      ]);

      setQuotaInfo(quota);

      const storageBreakdown: StorageBreakdown = {
        indexedDB: stats.totalCompressedSize,
        cacheStorage: 0,
        total: stats.totalCompressedSize,
        byTable: Object.fromEntries(
          Object.entries(stats.byTable).map(([key, value]) => [key, value.size])
        ),
      };
      setBreakdown(storageBreakdown);

      const cleanupSuggestions = generateCleanupSuggestions(storageBreakdown, {
        calculations: retentionConfig.calculationRetentionDays,
        expenses: retentionConfig.expenseArchiveDays,
      });
      setSuggestions(cleanupSuggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get storage quota');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPersistence = useCallback(async (): Promise<boolean> => {
    const granted = await requestPersistentStorage();
    if (granted) {
      await refreshQuota();
    }
    return granted;
  }, [refreshQuota]);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
  }, []);

  useEffect(() => {
    refreshQuota();
    const interval = setInterval(refreshQuota, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [refreshQuota]);

  return {
    quotaInfo,
    breakdown,
    isLoading,
    error,
    warningLevel: quotaInfo?.warningLevel || 'none',
    showWarning: showWarning && (quotaInfo?.warningLevel !== 'none'),
    suggestions,
    isPersistent: quotaInfo?.isPersistent || false,
    refreshQuota,
    requestPersistence,
    dismissWarning,
  };
};
