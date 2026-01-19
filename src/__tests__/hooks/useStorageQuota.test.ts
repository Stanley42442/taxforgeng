/**
 * Comprehensive tests for useStorageQuota hook
 * Tests: quota monitoring, warnings, persistence, suggestions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const waitFor = async (callback: () => void, options?: { timeout?: number }) => {
  const timeout = options?.timeout || 1000;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      callback();
      return;
    } catch (e) {
      await new Promise(r => setTimeout(r, 50));
    }
  }
  callback();
};
import { useStorageQuota } from '@/hooks/useStorageQuota';

// Mock the storage quota utilities
vi.mock('@/lib/storageQuota', () => ({
  getStorageQuota: vi.fn().mockResolvedValue({
    usage: 100 * 1024 * 1024,
    quota: 1024 * 1024 * 1024,
    usagePercent: 10,
    usageFormatted: '100 MB',
    quotaFormatted: '1 GB',
    availableFormatted: '924 MB',
    isPersistent: false,
    warningLevel: 'none',
  }),
  requestPersistentStorage: vi.fn().mockResolvedValue(true),
  generateCleanupSuggestions: vi.fn().mockReturnValue([]),
  getWarningLevel: vi.fn().mockReturnValue('none'),
}));

vi.mock('@/lib/offlineStorage', () => ({
  getStorageStats: vi.fn().mockResolvedValue({
    totalRecords: 10,
    totalOriginalSize: 200 * 1024 * 1024,
    totalCompressedSize: 100 * 1024 * 1024,
    compressionRatio: 50,
    byTable: {
      businesses: { count: 5, size: 50 * 1024 * 1024 },
      expenses: { count: 3, size: 30 * 1024 * 1024 },
      calculations: { count: 2, size: 20 * 1024 * 1024 },
    },
  }),
  getRetentionConfig: vi.fn().mockResolvedValue({
    calculationRetentionDays: 90,
    expenseArchiveDays: 365,
    autoCleanupEnabled: true,
    lastCleanupTime: Date.now(),
    cleanupIntervalHours: 24,
  }),
}));

describe('useStorageQuota Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useStorageQuota());
      
      expect(result.current.isLoading).toBe(true);
    });

    it('should load quota info on mount', async () => {
      const { result } = renderHook(() => useStorageQuota());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.quotaInfo).toBeDefined();
    });
  });

  describe('Quota Information', () => {
    it('should return quota info after loading', async () => {
      const { result } = renderHook(() => useStorageQuota());
      
      await waitFor(() => {
        expect(result.current.quotaInfo).toBeDefined();
      });
      
      expect(result.current.quotaInfo?.usageFormatted).toBe('100 MB');
    });

    it('should calculate warning level', async () => {
      const { result } = renderHook(() => useStorageQuota());
      
      await waitFor(() => {
        expect(result.current.warningLevel).toBeDefined();
      });
    });
  });

  describe('Persistent Storage', () => {
    it('should request persistent storage', async () => {
      const { result } = renderHook(() => useStorageQuota());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      let granted: boolean | undefined;
      await act(async () => {
        granted = await result.current.requestPersistence();
      });
      
      expect(granted).toBe(true);
    });
  });

  describe('Warning Management', () => {
    it('should allow dismissing warnings', async () => {
      const { result } = renderHook(() => useStorageQuota());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.dismissWarning();
      });
      
      expect(result.current.showWarning).toBe(false);
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh quota on demand', async () => {
      const { result } = renderHook(() => useStorageQuota());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.refreshQuota();
      });
      
      expect(result.current.quotaInfo).toBeDefined();
    });
  });

  describe('Cleanup Suggestions', () => {
    it('should provide cleanup suggestions', async () => {
      const { result } = renderHook(() => useStorageQuota());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(Array.isArray(result.current.suggestions)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle quota API errors gracefully', async () => {
      const mockGetStorageQuota = vi.fn().mockRejectedValue(new Error('API Error'));
      vi.doMock('@/lib/storageQuota', () => ({
        getStorageQuota: mockGetStorageQuota,
      }));
      
      const { result } = renderHook(() => useStorageQuota());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      // Should not crash
      expect(result.current).toBeDefined();
    });
  });
});
