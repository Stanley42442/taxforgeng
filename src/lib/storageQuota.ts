/**
 * Storage Quota Monitoring utilities
 * Uses the Storage API to track and warn about storage limits
 */

import { formatBytes } from './compression';
import logger from './logger';

export type WarningLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface StorageQuotaInfo {
  usage: number;
  quota: number;
  usagePercent: number;
  usageFormatted: string;
  quotaFormatted: string;
  availableFormatted: string;
  isPersistent: boolean;
  warningLevel: WarningLevel;
}

export interface StorageBreakdown {
  indexedDB: number;
  cacheStorage: number;
  total: number;
  byTable: Record<string, number>;
}

export interface CleanupSuggestion {
  id: string;
  action: string;
  description: string;
  estimatedSavings: number;
  estimatedSavingsFormatted: string;
  priority: 'low' | 'medium' | 'high';
  table?: string;
}

export interface UsageSnapshot {
  timestamp: number;
  usage: number;
  quota: number;
  usagePercent: number;
}

// Warning thresholds
const WARNING_THRESHOLDS = {
  low: 70,
  medium: 80,
  high: 90,
  critical: 95,
};

/**
 * Get current storage quota and usage using the Storage API
 */
export const getStorageQuota = async (): Promise<StorageQuotaInfo> => {
  if (!navigator.storage || !navigator.storage.estimate) {
    // Fallback for browsers without Storage API
    return {
      usage: 0,
      quota: 0,
      usagePercent: 0,
      usageFormatted: 'Unknown',
      quotaFormatted: 'Unknown',
      availableFormatted: 'Unknown',
      isPersistent: false,
      warningLevel: 'none',
    };
  }

  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage || 0;
  const quota = estimate.quota || 0;
  const usagePercent = quota > 0 ? (usage / quota) * 100 : 0;
  const available = quota - usage;
  const isPersistent = await isStoragePersistent();

  return {
    usage,
    quota,
    usagePercent,
    usageFormatted: formatBytes(usage),
    quotaFormatted: formatBytes(quota),
    availableFormatted: formatBytes(available),
    isPersistent,
    warningLevel: getWarningLevel(usagePercent),
  };
};

/**
 * Get warning level based on usage percentage
 */
export const getWarningLevel = (usagePercent: number): WarningLevel => {
  if (usagePercent >= WARNING_THRESHOLDS.critical) return 'critical';
  if (usagePercent >= WARNING_THRESHOLDS.high) return 'high';
  if (usagePercent >= WARNING_THRESHOLDS.medium) return 'medium';
  if (usagePercent >= WARNING_THRESHOLDS.low) return 'low';
  return 'none';
};

/**
 * Check if storage is persistent (won't be evicted by browser)
 */
export const isStoragePersistent = async (): Promise<boolean> => {
  if (!navigator.storage || !navigator.storage.persisted) {
    return false;
  }
  return navigator.storage.persisted();
};

/**
 * Request persistent storage from the browser
 */
export const requestPersistentStorage = async (): Promise<boolean> => {
  if (!navigator.storage || !navigator.storage.persist) {
    return false;
  }
  
  try {
    const granted = await navigator.storage.persist();
    return granted;
  } catch (error) {
    logger.error('[StorageQuota] Failed to request persistent storage:', error);
    return false;
  }
};

/**
 * Generate cleanup suggestions based on storage breakdown
 */
export const generateCleanupSuggestions = (
  breakdown: StorageBreakdown,
  retentionDays: { calculations: number; expenses: number }
): CleanupSuggestion[] => {
  const suggestions: CleanupSuggestion[] = [];
  
  // Suggest cleaning calculations if they're taking significant space
  if (breakdown.byTable.calculations > 1024 * 1024) { // > 1MB
    suggestions.push({
      id: 'clean-calculations',
      action: 'Clear old calculations',
      description: `Remove calculation history older than ${retentionDays.calculations} days`,
      estimatedSavings: Math.floor(breakdown.byTable.calculations * 0.6),
      estimatedSavingsFormatted: formatBytes(Math.floor(breakdown.byTable.calculations * 0.6)),
      priority: breakdown.byTable.calculations > 10 * 1024 * 1024 ? 'high' : 'medium',
      table: 'calculations',
    });
  }

  // Suggest archiving old expenses
  if (breakdown.byTable.expenses > 5 * 1024 * 1024) { // > 5MB
    suggestions.push({
      id: 'archive-expenses',
      action: 'Archive old expenses',
      description: `Compress expenses older than ${retentionDays.expenses} days`,
      estimatedSavings: Math.floor(breakdown.byTable.expenses * 0.4),
      estimatedSavingsFormatted: formatBytes(Math.floor(breakdown.byTable.expenses * 0.4)),
      priority: 'medium',
      table: 'expenses',
    });
  }

  // Suggest clearing cache storage
  if (breakdown.cacheStorage > 10 * 1024 * 1024) { // > 10MB
    suggestions.push({
      id: 'clear-cache',
      action: 'Clear API cache',
      description: 'Remove cached API responses to free space',
      estimatedSavings: Math.floor(breakdown.cacheStorage * 0.8),
      estimatedSavingsFormatted: formatBytes(Math.floor(breakdown.cacheStorage * 0.8)),
      priority: 'low',
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return suggestions;
};

/**
 * Get warning message based on level
 */
export const getWarningMessage = (level: WarningLevel, usagePercent: number): string => {
  switch (level) {
    case 'critical':
      return `Critical: Storage is ${usagePercent.toFixed(1)}% full. Clear data immediately to continue using offline features.`;
    case 'high':
      return `Warning: Storage is ${usagePercent.toFixed(1)}% full. Consider clearing old data to prevent issues.`;
    case 'medium':
      return `Storage usage is ${usagePercent.toFixed(1)}%. You may want to clean up old data soon.`;
    case 'low':
      return `Storage is ${usagePercent.toFixed(1)}% used.`;
    default:
      return '';
  }
};

/**
 * Get warning color based on level
 */
export const getWarningColor = (level: WarningLevel): string => {
  switch (level) {
    case 'critical':
      return 'text-destructive';
    case 'high':
      return 'text-orange-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-muted-foreground';
    default:
      return 'text-success';
  }
};

/**
 * Get progress bar color based on warning level
 */
export const getProgressColor = (level: WarningLevel): string => {
  switch (level) {
    case 'critical':
      return 'bg-destructive';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    default:
      return 'bg-primary';
  }
};

/**
 * Check if new data can be stored without exceeding quota
 */
export const canStoreData = async (estimatedSize: number): Promise<{
  canStore: boolean;
  wouldExceedThreshold: WarningLevel | null;
  newUsagePercent: number;
}> => {
  const quota = await getStorageQuota();
  const newUsage = quota.usage + estimatedSize;
  const newUsagePercent = quota.quota > 0 ? (newUsage / quota.quota) * 100 : 0;
  const newWarningLevel = getWarningLevel(newUsagePercent);
  
  return {
    canStore: newUsagePercent < WARNING_THRESHOLDS.critical,
    wouldExceedThreshold: newWarningLevel !== quota.warningLevel ? newWarningLevel : null,
    newUsagePercent,
  };
};
