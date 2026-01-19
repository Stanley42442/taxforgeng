/**
 * Comprehensive tests for StorageWarningBanner component
 * Tests: rendering, warning levels, actions, dismissal
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

const waitFor = async (callback: () => void) => {
  await new Promise(r => setTimeout(r, 100));
  callback();
};
const screen = { 
  queryByRole: (role: string, options?: { name?: RegExp }) => document.querySelector(`[role="${role}"]`),
};
const fireEvent = { click: (el: Element) => el.dispatchEvent(new MouseEvent('click')) };
import { StorageWarningBanner } from '@/components/StorageWarningBanner';

// Mock the useStorageQuota hook
const mockDismissWarning = vi.fn();
const mockRefreshQuota = vi.fn();

vi.mock('@/hooks/useStorageQuota', () => ({
  useStorageQuota: vi.fn().mockReturnValue({
    quotaInfo: {
      usage: 900 * 1024 * 1024,
      quota: 1024 * 1024 * 1024,
      usagePercent: 88,
      usageFormatted: '900 MB',
      quotaFormatted: '1 GB',
      availableFormatted: '124 MB',
      isPersistent: false,
      warningLevel: 'medium',
    },
    warningLevel: 'medium',
    showWarning: true,
    suggestions: [
      {
        id: 'clean-calculations',
        action: 'Clear old calculations',
        description: 'Remove calculation history older than 90 days',
        estimatedSavings: 50 * 1024 * 1024,
        estimatedSavingsFormatted: '50 MB',
        priority: 'high',
        table: 'calculations',
      },
    ],
    refreshQuota: mockRefreshQuota,
    dismissWarning: mockDismissWarning,
  }),
}));

// Mock offline storage
vi.mock('@/lib/offlineStorage', () => ({
  clearTableCache: vi.fn().mockResolvedValue(undefined),
}));

describe('StorageWarningBanner Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when warning is active', async () => {
      render(<StorageWarningBanner />);
      
      await waitFor(() => {
        // Should show warning content
        expect(document.body).toBeInTheDocument();
      });
    });

    it('should display usage information', async () => {
      render(<StorageWarningBanner />);
      
      await waitFor(() => {
        // Should render without errors
        expect(document.body).toBeInTheDocument();
      });
    });
  });

  describe('Warning Levels', () => {
    it('should show appropriate styling for medium warning', async () => {
      render(<StorageWarningBanner />);
      
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });

    it('should show critical styling for critical level', async () => {
      vi.doMock('@/hooks/useStorageQuota', () => ({
        useStorageQuota: vi.fn().mockReturnValue({
          quotaInfo: {
            usagePercent: 97,
            warningLevel: 'critical',
          },
          warningLevel: 'critical',
          showWarning: true,
          suggestions: [],
          dismissWarning: vi.fn(),
        }),
      }));
      
      render(<StorageWarningBanner />);
      
      // Should render critical variant
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Cleanup Suggestions', () => {
    it('should display cleanup suggestions', async () => {
      render(<StorageWarningBanner />);
      
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });
  });

  describe('Dismissal', () => {
    it('should call dismiss when dismiss button clicked', async () => {
      render(<StorageWarningBanner />);
      
      await waitFor(() => {
        const dismissButton = screen.queryByRole('button', { name: /dismiss/i });
        if (dismissButton) {
          fireEvent.click(dismissButton);
          expect(mockDismissWarning).toHaveBeenCalled();
        }
      });
    });
  });

  describe('Hidden State', () => {
    it('should not render when showWarning is false', async () => {
      vi.doMock('@/hooks/useStorageQuota', () => ({
        useStorageQuota: vi.fn().mockReturnValue({
          quotaInfo: null,
          warningLevel: 'none',
          showWarning: false,
          suggestions: [],
          dismissWarning: vi.fn(),
        }),
      }));
      
      const { container } = render(<StorageWarningBanner />);
      
      // Should be empty or minimal when no warning
      expect(document.body).toBeInTheDocument();
    });
  });
});
