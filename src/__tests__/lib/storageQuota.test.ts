/**
 * Comprehensive tests for storage quota monitoring
 * Tests: quota estimation, warnings, persistent storage, cleanup suggestions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStorageQuota,
  getWarningLevel,
  isStoragePersistent,
  requestPersistentStorage,
  generateCleanupSuggestions,
  getWarningMessage,
  getWarningColor,
  getProgressColor,
  canStoreData,
} from '@/lib/storageQuota';
import type { StorageBreakdown, WarningLevel } from '@/lib/storageQuota';

describe('Storage Quota Utilities', () => {
  describe('getStorageQuota', () => {
    it('should return storage quota information', async () => {
      const quota = await getStorageQuota();
      
      expect(quota.usage).toBeDefined();
      expect(quota.quota).toBeDefined();
      expect(quota.usagePercent).toBeDefined();
      expect(quota.usageFormatted).toBeDefined();
      expect(quota.quotaFormatted).toBeDefined();
      expect(quota.warningLevel).toBeDefined();
    });

    it('should calculate usage percentage correctly', async () => {
      vi.mocked(navigator.storage.estimate).mockResolvedValueOnce({
        usage: 500 * 1024 * 1024, // 500MB
        quota: 1024 * 1024 * 1024, // 1GB
      });
      
      const quota = await getStorageQuota();
      expect(quota.usagePercent).toBeCloseTo(50, 0);
    });

    it('should handle zero quota gracefully', async () => {
      vi.mocked(navigator.storage.estimate).mockResolvedValueOnce({
        usage: 0,
        quota: 0,
      });
      
      const quota = await getStorageQuota();
      expect(quota.usagePercent).toBe(0);
    });

    it('should format sizes correctly', async () => {
      vi.mocked(navigator.storage.estimate).mockResolvedValueOnce({
        usage: 100 * 1024 * 1024, // 100MB
        quota: 2 * 1024 * 1024 * 1024, // 2GB
      });
      
      const quota = await getStorageQuota();
      expect(quota.usageFormatted).toContain('MB');
      expect(quota.quotaFormatted).toContain('GB');
    });

    it('should handle missing Storage API', async () => {
      const originalStorage = navigator.storage;
      // @ts-expect-error - Testing missing API
      delete navigator.storage;
      
      // Re-mock
      Object.defineProperty(navigator, 'storage', {
        value: undefined,
        configurable: true,
      });
      
      const quota = await getStorageQuota();
      expect(quota.usageFormatted).toBe('Unknown');
      
      // Restore
      Object.defineProperty(navigator, 'storage', {
        value: originalStorage,
        configurable: true,
      });
    });
  });

  describe('getWarningLevel', () => {
    it('should return "none" for usage below 70%', () => {
      expect(getWarningLevel(0)).toBe('none');
      expect(getWarningLevel(50)).toBe('none');
      expect(getWarningLevel(69)).toBe('none');
    });

    it('should return "low" for usage 70-80%', () => {
      expect(getWarningLevel(70)).toBe('low');
      expect(getWarningLevel(75)).toBe('low');
      expect(getWarningLevel(79)).toBe('low');
    });

    it('should return "medium" for usage 80-90%', () => {
      expect(getWarningLevel(80)).toBe('medium');
      expect(getWarningLevel(85)).toBe('medium');
      expect(getWarningLevel(89)).toBe('medium');
    });

    it('should return "high" for usage 90-95%', () => {
      expect(getWarningLevel(90)).toBe('high');
      expect(getWarningLevel(92)).toBe('high');
      expect(getWarningLevel(94)).toBe('high');
    });

    it('should return "critical" for usage 95%+', () => {
      expect(getWarningLevel(95)).toBe('critical');
      expect(getWarningLevel(99)).toBe('critical');
      expect(getWarningLevel(100)).toBe('critical');
    });

    it('should handle edge cases', () => {
      expect(getWarningLevel(-1)).toBe('none');
      expect(getWarningLevel(150)).toBe('critical');
    });
  });

  describe('isStoragePersistent', () => {
    it('should return persistence status', async () => {
      vi.mocked(navigator.storage.persisted).mockResolvedValueOnce(true);
      
      const isPersistent = await isStoragePersistent();
      expect(isPersistent).toBe(true);
    });

    it('should return false when not persistent', async () => {
      vi.mocked(navigator.storage.persisted).mockResolvedValueOnce(false);
      
      const isPersistent = await isStoragePersistent();
      expect(isPersistent).toBe(false);
    });
  });

  describe('requestPersistentStorage', () => {
    it('should request and return granted status', async () => {
      vi.mocked(navigator.storage.persist).mockResolvedValueOnce(true);
      
      const granted = await requestPersistentStorage();
      expect(granted).toBe(true);
    });

    it('should handle denied request', async () => {
      vi.mocked(navigator.storage.persist).mockResolvedValueOnce(false);
      
      const granted = await requestPersistentStorage();
      expect(granted).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(navigator.storage.persist).mockRejectedValueOnce(new Error('Permission denied'));
      
      const granted = await requestPersistentStorage();
      expect(granted).toBe(false);
    });
  });

  describe('generateCleanupSuggestions', () => {
    it('should suggest cleaning calculations when large', () => {
      const breakdown: StorageBreakdown = {
        indexedDB: 50 * 1024 * 1024,
        cacheStorage: 5 * 1024 * 1024,
        total: 55 * 1024 * 1024,
        byTable: {
          calculations: 20 * 1024 * 1024, // 20MB
          expenses: 2 * 1024 * 1024,
          businesses: 1 * 1024 * 1024,
          personalExpenses: 1 * 1024 * 1024,
        },
      };
      
      const suggestions = generateCleanupSuggestions(breakdown, {
        calculations: 90,
        expenses: 365,
      });
      
      expect(suggestions.some(s => s.id === 'clean-calculations')).toBe(true);
    });

    it('should suggest archiving expenses when large', () => {
      const breakdown: StorageBreakdown = {
        indexedDB: 100 * 1024 * 1024,
        cacheStorage: 5 * 1024 * 1024,
        total: 105 * 1024 * 1024,
        byTable: {
          calculations: 1 * 1024 * 1024,
          expenses: 50 * 1024 * 1024, // 50MB
          businesses: 1 * 1024 * 1024,
          personalExpenses: 1 * 1024 * 1024,
        },
      };
      
      const suggestions = generateCleanupSuggestions(breakdown, {
        calculations: 90,
        expenses: 365,
      });
      
      expect(suggestions.some(s => s.id === 'archive-expenses')).toBe(true);
    });

    it('should suggest clearing cache when large', () => {
      const breakdown: StorageBreakdown = {
        indexedDB: 10 * 1024 * 1024,
        cacheStorage: 50 * 1024 * 1024, // 50MB cache
        total: 60 * 1024 * 1024,
        byTable: {
          calculations: 1 * 1024 * 1024,
          expenses: 1 * 1024 * 1024,
          businesses: 1 * 1024 * 1024,
          personalExpenses: 1 * 1024 * 1024,
        },
      };
      
      const suggestions = generateCleanupSuggestions(breakdown, {
        calculations: 90,
        expenses: 365,
      });
      
      expect(suggestions.some(s => s.id === 'clear-cache')).toBe(true);
    });

    it('should return empty array when storage is small', () => {
      const breakdown: StorageBreakdown = {
        indexedDB: 1 * 1024 * 1024,
        cacheStorage: 1 * 1024 * 1024,
        total: 2 * 1024 * 1024,
        byTable: {
          calculations: 100 * 1024, // 100KB
          expenses: 100 * 1024,
          businesses: 100 * 1024,
          personalExpenses: 100 * 1024,
        },
      };
      
      const suggestions = generateCleanupSuggestions(breakdown, {
        calculations: 90,
        expenses: 365,
      });
      
      expect(suggestions).toHaveLength(0);
    });

    it('should sort suggestions by priority', () => {
      const breakdown: StorageBreakdown = {
        indexedDB: 200 * 1024 * 1024,
        cacheStorage: 50 * 1024 * 1024,
        total: 250 * 1024 * 1024,
        byTable: {
          calculations: 100 * 1024 * 1024, // 100MB - high priority
          expenses: 50 * 1024 * 1024, // 50MB
          businesses: 1 * 1024 * 1024,
          personalExpenses: 1 * 1024 * 1024,
        },
      };
      
      const suggestions = generateCleanupSuggestions(breakdown, {
        calculations: 90,
        expenses: 365,
      });
      
      // Should be sorted: high, medium, low
      if (suggestions.length >= 2) {
        const priorities = suggestions.map(s => s.priority);
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        for (let i = 1; i < priorities.length; i++) {
          expect(priorityOrder[priorities[i]]).toBeGreaterThanOrEqual(
            priorityOrder[priorities[i - 1]]
          );
        }
      }
    });
  });

  describe('getWarningMessage', () => {
    it('should return critical message', () => {
      const message = getWarningMessage('critical', 98);
      expect(message).toContain('Critical');
      expect(message).toContain('98.0%');
    });

    it('should return high warning message', () => {
      const message = getWarningMessage('high', 92);
      expect(message).toContain('Warning');
      expect(message).toContain('92.0%');
    });

    it('should return medium message', () => {
      const message = getWarningMessage('medium', 85);
      expect(message).toContain('85.0%');
    });

    it('should return low message', () => {
      const message = getWarningMessage('low', 75);
      expect(message).toContain('75.0%');
    });

    it('should return empty for none level', () => {
      const message = getWarningMessage('none', 50);
      expect(message).toBe('');
    });
  });

  describe('getWarningColor', () => {
    const levels: WarningLevel[] = ['none', 'low', 'medium', 'high', 'critical'];
    
    levels.forEach(level => {
      it(`should return appropriate color for ${level}`, () => {
        const color = getWarningColor(level);
        expect(color).toBeDefined();
        expect(color).toMatch(/^text-/);
      });
    });

    it('should return destructive color for critical', () => {
      expect(getWarningColor('critical')).toContain('destructive');
    });

    it('should return success color for none', () => {
      expect(getWarningColor('none')).toContain('success');
    });
  });

  describe('getProgressColor', () => {
    it('should return primary for normal levels', () => {
      expect(getProgressColor('none')).toBe('bg-primary');
      expect(getProgressColor('low')).toBe('bg-primary');
    });

    it('should return warning colors for higher levels', () => {
      expect(getProgressColor('medium')).toContain('yellow');
      expect(getProgressColor('high')).toContain('orange');
      expect(getProgressColor('critical')).toContain('destructive');
    });
  });

  describe('canStoreData', () => {
    it('should allow storage when quota is available', async () => {
      vi.mocked(navigator.storage.estimate).mockResolvedValueOnce({
        usage: 100 * 1024 * 1024, // 100MB used
        quota: 1024 * 1024 * 1024, // 1GB quota
      });
      
      const result = await canStoreData(10 * 1024 * 1024); // 10MB
      
      expect(result.canStore).toBe(true);
    });

    it('should prevent storage when it would exceed critical threshold', async () => {
      vi.mocked(navigator.storage.estimate).mockResolvedValueOnce({
        usage: 950 * 1024 * 1024, // 950MB used
        quota: 1024 * 1024 * 1024, // 1GB quota
      });
      
      const result = await canStoreData(100 * 1024 * 1024); // 100MB - would exceed
      
      expect(result.canStore).toBe(false);
    });

    it('should indicate when crossing warning thresholds', async () => {
      vi.mocked(navigator.storage.estimate).mockResolvedValueOnce({
        usage: 700 * 1024 * 1024, // 700MB - at 70%
        quota: 1024 * 1024 * 1024, // 1GB quota
      });
      
      const result = await canStoreData(100 * 1024 * 1024); // Would push to 80%
      
      expect(result.wouldExceedThreshold).not.toBeNull();
    });

    it('should calculate new usage percentage correctly', async () => {
      vi.mocked(navigator.storage.estimate).mockResolvedValueOnce({
        usage: 500 * 1024 * 1024, // 500MB
        quota: 1024 * 1024 * 1024, // 1GB
      });
      
      const result = await canStoreData(200 * 1024 * 1024); // 200MB more
      
      expect(result.newUsagePercent).toBeCloseTo(70, 0);
    });
  });

  describe('Security Tests', () => {
    it('should handle extremely large size estimates safely', async () => {
      vi.mocked(navigator.storage.estimate).mockResolvedValueOnce({
        usage: Number.MAX_SAFE_INTEGER,
        quota: Number.MAX_SAFE_INTEGER,
      });
      
      // Should not throw
      const quota = await getStorageQuota();
      expect(quota).toBeDefined();
    });

    it('should handle negative values gracefully', async () => {
      vi.mocked(navigator.storage.estimate).mockResolvedValueOnce({
        usage: -100,
        quota: -100,
      });
      
      const quota = await getStorageQuota();
      // Should handle gracefully without crashing
      expect(quota).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle exactly 100% usage', async () => {
      vi.mocked(navigator.storage.estimate).mockResolvedValueOnce({
        usage: 1024 * 1024 * 1024,
        quota: 1024 * 1024 * 1024,
      });
      
      const quota = await getStorageQuota();
      expect(quota.usagePercent).toBe(100);
      expect(quota.warningLevel).toBe('critical');
    });

    it('should handle usage exceeding quota', async () => {
      vi.mocked(navigator.storage.estimate).mockResolvedValueOnce({
        usage: 2 * 1024 * 1024 * 1024, // 2GB used
        quota: 1024 * 1024 * 1024, // 1GB quota
      });
      
      const quota = await getStorageQuota();
      expect(quota.usagePercent).toBe(200);
      expect(quota.warningLevel).toBe('critical');
    });
  });
});
