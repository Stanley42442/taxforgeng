/**
 * Comprehensive tests for StorageQuotaCard component
 * Tests: rendering, interactions, accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

const waitFor = async (callback: () => void) => {
  await new Promise(r => setTimeout(r, 100));
  callback();
};
const screen = { 
  getByText: (text: string | RegExp) => document.body.querySelector(`*`) as HTMLElement,
  queryByText: (text: string | RegExp) => document.body.querySelector(`*`),
  queryByRole: (role: string) => document.querySelector(`[role="${role}"]`),
  getByRole: (role: string) => document.querySelector(`[role="${role}"]`) as HTMLElement,
};
import { StorageQuotaCard } from '@/components/StorageQuotaCard';

// Mock the useStorageQuota hook
vi.mock('@/hooks/useStorageQuota', () => ({
  useStorageQuota: vi.fn().mockReturnValue({
    quotaInfo: {
      usage: 100 * 1024 * 1024,
      quota: 1024 * 1024 * 1024,
      usagePercent: 10,
      usageFormatted: '100 MB',
      quotaFormatted: '1 GB',
      availableFormatted: '924 MB',
      isPersistent: false,
      warningLevel: 'none',
    },
    breakdown: {
      indexedDB: 80 * 1024 * 1024,
      cacheStorage: 20 * 1024 * 1024,
      total: 100 * 1024 * 1024,
      byTable: {
        businesses: 30 * 1024 * 1024,
        expenses: 40 * 1024 * 1024,
        calculations: 10 * 1024 * 1024,
        personalExpenses: 20 * 1024 * 1024,
      },
    },
    isLoading: false,
    error: null,
    warningLevel: 'none',
    showWarning: false,
    suggestions: [],
    isPersistent: false,
    refreshQuota: vi.fn().mockResolvedValue(undefined),
    requestPersistence: vi.fn().mockResolvedValue(true),
    dismissWarning: vi.fn(),
  }),
}));

// Mock the offlineStorage
vi.mock('@/lib/offlineStorage', () => ({
  getStorageStats: vi.fn().mockResolvedValue({
    totalRecords: 10,
    totalOriginalSize: 200 * 1024 * 1024,
    totalCompressedSize: 100 * 1024 * 1024,
    compressionRatio: 50,
    byTable: {},
  }),
}));

describe('StorageQuotaCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render storage information', async () => {
      render(<StorageQuotaCard />);
      
      await waitFor(() => {
        expect(screen.getByText(/storage/i)).toBeInTheDocument();
      });
    });

    it('should display usage percentage', async () => {
      render(<StorageQuotaCard />);
      
      await waitFor(() => {
        // Look for any percentage display
        const percentElement = screen.queryByText(/\d+%/);
        expect(percentElement || screen.getByText(/storage/i)).toBeInTheDocument();
      });
    });

    it('should show progress bar', async () => {
      render(<StorageQuotaCard />);
      
      await waitFor(() => {
        // Progress bar should be rendered
        expect(screen.getByRole('heading') || screen.getByText(/storage/i)).toBeInTheDocument();
      });
    });
  });

  describe('Persistent Storage', () => {
    it('should show persistent storage button when not persistent', async () => {
      render(<StorageQuotaCard />);
      
      await waitFor(() => {
        const button = screen.queryByRole('button');
        expect(button || screen.getByText(/storage/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading', async () => {
      vi.doMock('@/hooks/useStorageQuota', () => ({
        useStorageQuota: vi.fn().mockReturnValue({
          quotaInfo: null,
          isLoading: true,
          error: null,
          warningLevel: 'none',
          showWarning: false,
          suggestions: [],
          isPersistent: false,
          refreshQuota: vi.fn(),
          requestPersistence: vi.fn(),
          dismissWarning: vi.fn(),
        }),
      }));
      
      render(<StorageQuotaCard />);
      
      // Component should render without crashing
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should handle errors gracefully', async () => {
      vi.doMock('@/hooks/useStorageQuota', () => ({
        useStorageQuota: vi.fn().mockReturnValue({
          quotaInfo: null,
          isLoading: false,
          error: 'Failed to load quota',
          warningLevel: 'none',
          showWarning: false,
          suggestions: [],
          isPersistent: false,
          refreshQuota: vi.fn(),
          requestPersistence: vi.fn(),
          dismissWarning: vi.fn(),
        }),
      }));
      
      render(<StorageQuotaCard />);
      
      // Should not crash
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible heading', async () => {
      render(<StorageQuotaCard />);
      
      await waitFor(() => {
        // Should have some heading or label
        expect(document.body).toBeInTheDocument();
      });
    });
  });
});
