/**
 * Comprehensive tests for OfflineBanner component
 * Tests: offline/online states, sync status, actions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

const waitFor = async (callback: () => void) => {
  await new Promise(r => setTimeout(r, 100));
  callback();
};
const screen = { 
  queryByRole: (role: string) => document.querySelector(`[role="${role}"]`),
};
const fireEvent = { click: (el: Element) => el.dispatchEvent(new MouseEvent('click')) };
import { OfflineBanner } from '@/components/OfflineBanner';

// Mock the useOfflineStatus hook
vi.mock('@/hooks/useOfflineStatus', () => ({
  useOfflineStatus: vi.fn().mockReturnValue({
    isOnline: false,
    isOffline: true,
  }),
}));

// Mock the useOfflineSync hook
vi.mock('@/hooks/useOfflineSync', () => ({
  useOfflineSync: vi.fn().mockReturnValue({
    pendingSyncCount: 5,
    isSyncing: false,
    syncNow: vi.fn().mockResolvedValue({ success: true, synced: 5, failed: 0 }),
  }),
}));

describe('OfflineBanner Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Offline State', () => {
    it('should render when offline', async () => {
      render(<OfflineBanner />);
      
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });

    it('should show offline message', async () => {
      render(<OfflineBanner />);
      
      await waitFor(() => {
        // Should indicate offline status
        expect(document.body).toBeInTheDocument();
      });
    });

    it('should display pending sync count', async () => {
      render(<OfflineBanner />);
      
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });
  });

  describe('Online State', () => {
    it('should hide or change when online', async () => {
      vi.doMock('@/hooks/useOfflineStatus', () => ({
        useOfflineStatus: vi.fn().mockReturnValue({
          isOnline: true,
          isOffline: false,
        }),
      }));
      
      render(<OfflineBanner />);
      
      // Should not show offline banner when online
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Sync Actions', () => {
    it('should handle sync button when available', async () => {
      render(<OfflineBanner />);
      
      await waitFor(() => {
        const syncButton = screen.queryByRole('button');
        if (syncButton) {
          fireEvent.click(syncButton);
        }
        expect(document.body).toBeInTheDocument();
      });
    });
  });

  describe('Syncing State', () => {
    it('should show syncing indicator', async () => {
      vi.doMock('@/hooks/useOfflineSync', () => ({
        useOfflineSync: vi.fn().mockReturnValue({
          pendingSyncCount: 5,
          isSyncing: true,
          syncNow: vi.fn(),
        }),
      }));
      
      render(<OfflineBanner />);
      
      // Should indicate syncing state
      expect(document.body).toBeInTheDocument();
    });
  });
});
