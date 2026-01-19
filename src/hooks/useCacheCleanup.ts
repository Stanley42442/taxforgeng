import { useState, useCallback } from 'react';
import { 
  runAutomaticCleanup, 
  shouldRunCleanup, 
  getRetentionConfig, 
  setRetentionConfig,
  RetentionConfig,
  CleanupStats,
} from '@/lib/offlineStorage';
import { useEffect } from 'react';

export interface UseCacheCleanupReturn {
  isCleanupRunning: boolean;
  lastCleanupStats: CleanupStats | null;
  retentionConfig: RetentionConfig | null;
  runCleanupNow: () => Promise<CleanupStats>;
  updateRetentionConfig: (config: Partial<RetentionConfig>) => Promise<void>;
}

export const useCacheCleanup = (): UseCacheCleanupReturn => {
  const [isCleanupRunning, setIsCleanupRunning] = useState(false);
  const [lastCleanupStats, setLastCleanupStats] = useState<CleanupStats | null>(null);
  const [retentionConfig, setRetentionConfigState] = useState<RetentionConfig | null>(null);

  const runCleanupNow = useCallback(async (): Promise<CleanupStats> => {
    setIsCleanupRunning(true);
    try {
      const stats = await runAutomaticCleanup();
      setLastCleanupStats(stats);
      return stats;
    } finally {
      setIsCleanupRunning(false);
    }
  }, []);

  const updateRetentionConfig = useCallback(async (config: Partial<RetentionConfig>) => {
    await setRetentionConfig(config);
    const updated = await getRetentionConfig();
    setRetentionConfigState(updated);
  }, []);

  useEffect(() => {
    const init = async () => {
      const config = await getRetentionConfig();
      setRetentionConfigState(config);
      
      // Check if cleanup should run
      if (await shouldRunCleanup()) {
        runCleanupNow();
      }
    };
    init();
  }, [runCleanupNow]);

  return {
    isCleanupRunning,
    lastCleanupStats,
    retentionConfig,
    runCleanupNow,
    updateRetentionConfig,
  };
};
