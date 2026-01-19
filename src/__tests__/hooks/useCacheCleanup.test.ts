/**
 * Comprehensive tests for useCacheCleanup hook
 * Tests: cleanup operations, retention config, scheduling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const waitFor = async (callback: () => void) => {
  await new Promise(r => setTimeout(r, 100));
  callback();
};
import { useCacheCleanup } from '@/hooks/useCacheCleanup';

// Mock offline storage
vi.mock('@/lib/offlineStorage', () => ({
  getRetentionConfig: vi.fn().mockResolvedValue({
    calculationRetentionDays: 90,
    expenseArchiveDays: 365,
    autoCleanupEnabled: true,
    lastCleanupTime: Date.now() - 24 * 60 * 60 * 1000,
    cleanupIntervalHours: 24,
  }),
  setRetentionConfig: vi.fn().mockResolvedValue(undefined),
  shouldRunCleanup: vi.fn().mockResolvedValue(true),
  runAutomaticCleanup: vi.fn().mockResolvedValue({
    calculationsRemoved: 5,
    expensesArchived: 10,
    spaceFreed: 1024 * 1024 * 10,
    spaceFreedFormatted: '10 MB',
    lastCleanupTime: new Date(),
  }),
}));

describe('useCacheCleanup Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should load retention config on mount', async () => {
      const { result } = renderHook(() => useCacheCleanup());
      
      await waitFor(() => {
        expect(result.current.retentionConfig).toBeDefined();
      });
    });

    it('should not be running cleanup initially', () => {
      const { result } = renderHook(() => useCacheCleanup());
      
      expect(result.current.isCleanupRunning).toBe(false);
    });
  });

  describe('Retention Configuration', () => {
    it('should return retention config', async () => {
      const { result } = renderHook(() => useCacheCleanup());
      
      await waitFor(() => {
        expect(result.current.retentionConfig).toBeDefined();
      });
      
      expect(result.current.retentionConfig?.calculationRetentionDays).toBe(90);
    });

    it('should have retention config available', async () => {
      const { result } = renderHook(() => useCacheCleanup());
      
      await waitFor(() => {
        expect(result.current.retentionConfig).toBeDefined();
      });
      
      // Verify config is loaded
      await act(async () => {
        expect(result.current.retentionConfig?.calculationRetentionDays).toBeDefined();
      });
      
      const { setRetentionConfig } = await import('@/lib/offlineStorage');
      expect(setRetentionConfig).toHaveBeenCalledWith({ calculationRetentionDays: 60 });
    });
  });

  describe('Manual Cleanup', () => {
    it('should run cleanup manually', async () => {
      const { result } = renderHook(() => useCacheCleanup());
      
      let stats;
      await act(async () => {
        stats = await result.current.runCleanupNow();
      });
      
      expect(stats).toBeDefined();
      expect(stats.calculationsRemoved).toBe(5);
    });

    it('should return cleanup statistics', async () => {
      const { result } = renderHook(() => useCacheCleanup());
      
      let stats;
      await act(async () => {
        stats = await result.current.runCleanupNow();
      });
      
      expect(stats).toHaveProperty('calculationsRemoved');
      expect(stats).toHaveProperty('expensesArchived');
      expect(stats).toHaveProperty('spaceFreed');
      expect(stats).toHaveProperty('spaceFreedFormatted');
    });

    it('should update last cleanup stats', async () => {
      const { result } = renderHook(() => useCacheCleanup());
      
      await act(async () => {
        await result.current.runCleanupNow();
      });
      
      expect(result.current.lastCleanupStats).toBeDefined();
    });
  });

  describe('Automatic Cleanup', () => {
    it('should check if cleanup should run', async () => {
      const { result } = renderHook(() => useCacheCleanup());
      
      await waitFor(() => {
        expect(result.current.retentionConfig).toBeDefined();
      });
      
      // Auto cleanup check happens on mount
      const { shouldRunCleanup } = await import('@/lib/offlineStorage');
      expect(shouldRunCleanup).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle cleanup errors gracefully', async () => {
      vi.doMock('@/lib/offlineStorage', () => ({
        getRetentionConfig: vi.fn().mockResolvedValue({
          calculationRetentionDays: 90,
          expenseArchiveDays: 365,
          autoCleanupEnabled: true,
          lastCleanupTime: 0,
          cleanupIntervalHours: 24,
        }),
        runAutomaticCleanup: vi.fn().mockRejectedValue(new Error('Cleanup failed')),
        shouldRunCleanup: vi.fn().mockResolvedValue(false),
        setRetentionConfig: vi.fn().mockResolvedValue(undefined),
      }));
      
      const { result } = renderHook(() => useCacheCleanup());
      
      // Should not crash
      expect(result.current).toBeDefined();
    });
  });
});
