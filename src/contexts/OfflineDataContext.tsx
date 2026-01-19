import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { useStorageQuota } from '@/hooks/useStorageQuota';
import { useDataIntegrity, IntegrityStatus } from '@/hooks/useDataIntegrity';
import { useCacheCleanup } from '@/hooks/useCacheCleanup';
import { useOfflineSync, SyncResult } from '@/hooks/useOfflineSync';
import { 
  getBusinesses, 
  getExpenses, 
  getPersonalExpenses, 
  getCalculations,
  saveBusinesses,
  saveExpenses,
  savePersonalExpenses,
  saveCalculation,
  getStorageStats,
  StorageStats,
  RetentionConfig,
  CleanupStats,
  SyncConflict,
  clearAllCache,
} from '@/lib/offlineStorage';
import { StorageQuotaInfo, WarningLevel, CleanupSuggestion } from '@/lib/storageQuota';
import { IntegrityReport } from '@/lib/dataIntegrity';

interface OfflineDataContextType {
  // Connection state
  isOnline: boolean;
  isOfflineMode: boolean;
  
  // Sync state
  pendingSyncCount: number;
  conflictCount: number;
  conflicts: SyncConflict[];
  isSyncing: boolean;
  
  // Storage stats
  storageStats: StorageStats | null;
  quotaInfo: StorageQuotaInfo | null;
  quotaWarningLevel: WarningLevel;
  showQuotaWarning: boolean;
  cleanupSuggestions: CleanupSuggestion[];
  isPersistentStorage: boolean;
  
  // Cleanup state
  retentionConfig: RetentionConfig | null;
  lastCleanupStats: CleanupStats | null;
  isCleanupRunning: boolean;
  
  // Integrity state
  integrityStatus: IntegrityStatus;
  lastIntegrityCheck: Date | null;
  quarantinedCount: number;
  isVerifyingIntegrity: boolean;
  
  // Actions
  syncNow: () => Promise<SyncResult>;
  runCleanup: () => Promise<CleanupStats>;
  runIntegrityCheck: () => Promise<IntegrityReport>;
  requestPersistentStorage: () => Promise<boolean>;
  dismissQuotaWarning: () => void;
  clearCache: () => Promise<void>;
  refreshStorageStats: () => Promise<void>;
  cacheBusinesses: (businesses: unknown[]) => Promise<void>;
  cacheExpenses: (expenses: unknown[]) => Promise<void>;
  cachePersonalExpenses: (expenses: unknown[]) => Promise<void>;
  cacheCalculation: (calculation: unknown) => Promise<void>;
}

const OfflineDataContext = createContext<OfflineDataContextType | null>(null);

export const useOfflineData = () => {
  const context = useContext(OfflineDataContext);
  if (!context) {
    throw new Error('useOfflineData must be used within OfflineDataProvider');
  }
  return context;
};

interface OfflineDataProviderProps {
  children: ReactNode;
}

export const OfflineDataProvider: React.FC<OfflineDataProviderProps> = ({ children }) => {
  const { isOnline } = useOfflineStatus();
  const [isOfflineMode, setIsOfflineMode] = useState(!isOnline);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  
  const {
    quotaInfo,
    warningLevel: quotaWarningLevel,
    showWarning: showQuotaWarning,
    suggestions: cleanupSuggestions,
    isPersistent: isPersistentStorage,
    requestPersistence,
    dismissWarning: dismissQuotaWarning,
    refreshQuota,
  } = useStorageQuota();
  
  const {
    isVerifying: isVerifyingIntegrity,
    lastVerification: lastIntegrityCheck,
    integrityStatus,
    quarantinedCount,
    runIntegrityCheck,
  } = useDataIntegrity();
  
  const {
    isCleanupRunning,
    lastCleanupStats,
    retentionConfig,
    runCleanupNow,
  } = useCacheCleanup();
  
  const {
    isSyncing,
    pendingSyncCount,
    conflictCount,
    conflicts,
    syncNow,
  } = useOfflineSync();

  const refreshStorageStats = useCallback(async () => {
    const stats = await getStorageStats();
    setStorageStats(stats);
    await refreshQuota();
  }, [refreshQuota]);

  const clearCache = useCallback(async () => {
    await clearAllCache();
    await refreshStorageStats();
  }, [refreshStorageStats]);

  const cacheBusinesses = useCallback(async (businesses: unknown[]) => {
    await saveBusinesses(businesses);
    await refreshStorageStats();
  }, [refreshStorageStats]);

  const cacheExpenses = useCallback(async (expenses: unknown[]) => {
    await saveExpenses(expenses);
    await refreshStorageStats();
  }, [refreshStorageStats]);

  const cachePersonalExpenses = useCallback(async (expenses: unknown[]) => {
    await savePersonalExpenses(expenses);
    await refreshStorageStats();
  }, [refreshStorageStats]);

  const cacheCalculation = useCallback(async (calculation: unknown) => {
    await saveCalculation(calculation);
    await refreshStorageStats();
  }, [refreshStorageStats]);

  useEffect(() => {
    setIsOfflineMode(!isOnline);
  }, [isOnline]);

  useEffect(() => {
    refreshStorageStats();
  }, [refreshStorageStats]);

  const value: OfflineDataContextType = {
    isOnline,
    isOfflineMode,
    pendingSyncCount,
    conflictCount,
    conflicts,
    isSyncing,
    storageStats,
    quotaInfo,
    quotaWarningLevel,
    showQuotaWarning,
    cleanupSuggestions,
    isPersistentStorage,
    retentionConfig,
    lastCleanupStats,
    isCleanupRunning,
    integrityStatus,
    lastIntegrityCheck,
    quarantinedCount,
    isVerifyingIntegrity,
    syncNow,
    runCleanup: runCleanupNow,
    runIntegrityCheck,
    requestPersistentStorage: requestPersistence,
    dismissQuotaWarning,
    clearCache,
    refreshStorageStats,
    cacheBusinesses,
    cacheExpenses,
    cachePersonalExpenses,
    cacheCalculation,
  };

  return (
    <OfflineDataContext.Provider value={value}>
      {children}
    </OfflineDataContext.Provider>
  );
};
