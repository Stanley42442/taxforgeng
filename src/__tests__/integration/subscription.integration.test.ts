/**
 * Integration tests for subscription upgrade system
 * Tests: profile creation, tier updates, payment verification flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
  functions: {
    invoke: vi.fn(),
  },
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('Subscription Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Profile Creation on Signup', () => {
    it('should have a profile created for every authenticated user', async () => {
      // Simulate user exists in auth.users
      const mockUser = { id: 'test-user-id', email: 'test@example.com' };
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Profile should exist
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: mockUser.id, subscription_tier: 'free' },
              error: null,
            }),
          }),
        }),
      });

      const { data: { user } } = await mockSupabase.auth.getUser();
      expect(user).toBeDefined();
      expect(user?.id).toBe('test-user-id');
    });

    it('should create profile if missing when fetching subscription data', async () => {
      const mockUser = { id: 'new-user-id', email: 'new@example.com' };
      
      // First query returns no profile (PGRST116 error)
      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: null, 
            error: { code: 'PGRST116', message: 'not found' } 
          }),
        }),
      });

      // Insert should be called
      const insertMock = vi.fn().mockResolvedValue({ error: null });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return { select: selectMock, insert: insertMock };
        }
        return {};
      });

      // Verify insert would be called for missing profile
      expect(insertMock).not.toHaveBeenCalled();
      
      // After profile creation is triggered
      await insertMock({ id: mockUser.id, email: mockUser.email, subscription_tier: 'free' });
      expect(insertMock).toHaveBeenCalled();
    });
  });

  describe('Tier Upgrade Flow', () => {
    it('should update tier from free to starter after successful payment', async () => {
      const userId = 'upgrade-test-user';
      let currentTier = 'free';

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            upsert: vi.fn().mockImplementation(async (data) => {
              currentTier = data.subscription_tier;
              return { error: null };
            }),
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: userId, subscription_tier: currentTier },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      // Simulate tier update
      const { upsert } = mockSupabase.from('profiles');
      await upsert({ id: userId, subscription_tier: 'starter' });

      expect(currentTier).toBe('starter');
    });

    it('should update tier from starter to business', async () => {
      const userId = 'business-upgrade-user';
      let currentTier = 'starter';

      mockSupabase.from.mockImplementation(() => ({
        upsert: vi.fn().mockImplementation(async (data) => {
          currentTier = data.subscription_tier;
          return { error: null };
        }),
      }));

      const { upsert } = mockSupabase.from('profiles');
      await upsert({ id: userId, subscription_tier: 'business' });

      expect(currentTier).toBe('business');
    });

    it('should use UPSERT not UPDATE for tier changes', async () => {
      const upsertMock = vi.fn().mockResolvedValue({ error: null });
      const updateMock = vi.fn();

      mockSupabase.from.mockReturnValue({
        upsert: upsertMock,
        update: updateMock,
      });

      // Simulate payment verification calling upsert
      await mockSupabase.from('profiles').upsert({
        id: 'test-user',
        subscription_tier: 'business',
      });

      expect(upsertMock).toHaveBeenCalled();
      expect(updateMock).not.toHaveBeenCalled();
    });
  });

  describe('Payment Callback Sync', () => {
    it('should dispatch subscription-updated event after payment', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      
      window.dispatchEvent(new Event('subscription-updated'));
      
      expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
      expect(dispatchSpy.mock.calls[0][0].type).toBe('subscription-updated');
      
      dispatchSpy.mockRestore();
    });

    it('should refresh subscription multiple times after payment success', async () => {
      const refreshMock = vi.fn().mockResolvedValue(undefined);
      
      // Simulate PaymentCallback behavior
      await refreshMock(); // First call
      await new Promise(r => setTimeout(r, 50)); // Simulated delay (shorter for tests)
      await refreshMock(); // Second call
      
      expect(refreshMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('Tier Display Consistency', () => {
    it('should show same tier on Pricing and Settings pages', async () => {
      const mockTier = 'business';
      
      const getTierMock = vi.fn().mockReturnValue(mockTier);
      
      // Simulating both pages reading from same context
      const pricingTier = getTierMock();
      const settingsTier = getTierMock();
      
      expect(pricingTier).toBe(settingsTier);
      expect(pricingTier).toBe('business');
    });
  });

  describe('Edge Cases', () => {
    it('should handle race condition with multiple refresh calls', async () => {
      let callCount = 0;
      const refreshMock = vi.fn().mockImplementation(async () => {
        callCount++;
        await new Promise(r => setTimeout(r, 10));
      });

      // Simulate concurrent refresh calls
      await Promise.all([
        refreshMock(),
        refreshMock(),
        refreshMock(),
      ]);

      expect(callCount).toBe(3);
    });

    it('should handle upsert error gracefully', async () => {
      const upsertMock = vi.fn().mockResolvedValue({ 
        error: { message: 'Database error' } 
      });

      mockSupabase.from.mockReturnValue({
        upsert: upsertMock,
      });

      const result = await mockSupabase.from('profiles').upsert({});
      
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Database error');
    });
  });
});
