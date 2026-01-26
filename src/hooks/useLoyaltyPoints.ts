import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import logger from '@/lib/logger';

interface PointsTransaction {
  id: string;
  points: number;
  action_type: string;
  description: string;
  created_at: string;
}

interface Redemption {
  id: string;
  discount_code: string;
  discount_percentage: number;
  points_spent: number;
  expires_at: string;
  is_used: boolean;
}

interface RedemptionTier {
  points: number;
  discount: number;
}

export interface LoyaltyPointsState {
  balance: number;
  transactions: PointsTransaction[];
  availableRedemptions: Redemption[];
  redemptionTiers: RedemptionTier[];
  loading: boolean;
  error: string | null;
}

export function useLoyaltyPoints() {
  const { user } = useAuth();
  const [state, setState] = useState<LoyaltyPointsState>({
    balance: 0,
    transactions: [],
    availableRedemptions: [],
    redemptionTiers: [],
    loading: true,
    error: null,
  });

  const fetchBalance = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('loyalty-points', {
        body: { action: 'get_balance' },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` }
      });

      if (response.error) throw new Error(response.error.message);
      if (!response.data.success) throw new Error(response.data.error);

      setState({
        balance: response.data.balance,
        transactions: response.data.transactions,
        availableRedemptions: response.data.availableRedemptions,
        redemptionTiers: response.data.redemptionTiers,
        loading: false,
        error: null,
      });
    } catch (err) {
      logger.error('Error fetching loyalty points:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load points',
      }));
    }
  }, [user]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const earnPoints = useCallback(async (
    actionType: string,
    actionReference?: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('loyalty-points', {
        body: { action: 'earn_points', actionType, actionReference, metadata },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` }
      });

      if (response.error) throw new Error(response.error.message);
      if (!response.data.success) throw new Error(response.data.error);

      setState(prev => ({
        ...prev,
        balance: response.data.newBalance,
      }));

      // Refresh full data
      await fetchBalance();

      return { success: true, pointsEarned: response.data.pointsEarned };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to earn points' 
      };
    }
  }, [user, fetchBalance]);

  const redeemPoints = useCallback(async (tierIndex: number) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('loyalty-points', {
        body: { action: 'redeem_points', tierIndex },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` }
      });

      if (response.error) throw new Error(response.error.message);
      if (!response.data.success) throw new Error(response.data.error);

      setState(prev => ({
        ...prev,
        balance: response.data.newBalance,
      }));

      // Refresh full data
      await fetchBalance();

      return { 
        success: true, 
        discountCode: response.data.discountCode,
        discountPercentage: response.data.discountPercentage,
        expiresAt: response.data.expiresAt,
      };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to redeem points' 
      };
    }
  }, [user, fetchBalance]);

  return {
    ...state,
    earnPoints,
    redeemPoints,
    refresh: fetchBalance,
  };
}
