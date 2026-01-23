import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface PaymentInitResult {
  success: boolean;
  authorizationUrl?: string;
  reference?: string;
  amount?: number;
  originalAmount?: number;
  discountAmount?: number;
  discountApplied?: boolean;
  error?: string;
}

export interface PaymentVerifyResult {
  success: boolean;
  tier?: string;
  billingCycle?: string;
  previousTier?: string;
  changeType?: string;
  receiptNumber?: string;
  alreadyProcessed?: boolean;
  error?: string;
}

export interface DiscountValidationResult {
  valid: boolean;
  discountType?: 'promo' | 'referral' | 'loyalty';
  discountPercentage?: number;
  discountFixed?: number;
  discountAmount?: number;
  originalAmount?: number;
  finalAmount?: number;
  description?: string;
  message?: string;
  expiresAt?: string;
  error?: string;
}

const PAYMENT_TIMEOUT_MS = 30000; // 30 seconds
const MAX_RETRIES = 2;
const RETRY_DELAYS = [2000, 4000]; // 2s, 4s

export function usePaystack() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelPayment = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setRetryCount(0);
  }, []);

  const initializePayment = useCallback(async (
    tier: string,
    billingCycle: 'monthly' | 'annually',
    discountCode?: string,
    discountType?: 'promo' | 'referral' | 'loyalty'
  ): Promise<PaymentInitResult> => {
    if (!user?.email) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check network status first
    if (!navigator.onLine) {
      return { success: false, error: 'No internet connection. Please check your network and try again.' };
    }

    setLoading(true);
    setError(null);
    setRetryCount(0);

    const attemptPayment = async (attempt: number): Promise<PaymentInitResult> => {
      // Create new abort controller for this attempt
      abortControllerRef.current = new AbortController();
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, PAYMENT_TIMEOUT_MS);

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session?.access_token) {
          throw new Error('Session expired. Please sign in again.');
        }

        const response = await supabase.functions.invoke('paystack-initialize', {
          body: {
            tier,
            billingCycle,
            email: user.email,
            callbackUrl: `${window.location.origin}/payment-callback`,
            discountCode,
            discountType,
          },
          headers: {
            Authorization: `Bearer ${sessionData.session?.access_token}`,
          },
        });

        clearTimeout(timeoutId);

        if (response.error) {
          throw new Error(response.error.message);
        }

        const data = response.data;

        if (!data.success) {
          throw new Error(data.error || 'Failed to initialize payment');
        }

        return {
          success: true,
          authorizationUrl: data.authorizationUrl,
          reference: data.reference,
          amount: data.amount,
          originalAmount: data.originalAmount,
          discountAmount: data.discountAmount,
          discountApplied: data.discountApplied,
        };

      } catch (err: any) {
        clearTimeout(timeoutId);
        
        // Check if aborted (timeout or manual cancel)
        if (err.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
          // Retry logic
          if (attempt < MAX_RETRIES) {
            const nextAttempt = attempt + 1;
            setRetryCount(nextAttempt);
            toast.info(`Connection slow. Retrying... (${nextAttempt}/${MAX_RETRIES})`);
            await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt]));
            return attemptPayment(nextAttempt);
          }
          throw new Error('Payment request timed out. Please check your connection and try again.');
        }
        
        throw err;
      }
    };

    try {
      return await attemptPayment(0);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to initialize payment';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
      setRetryCount(0);
      abortControllerRef.current = null;
    }
  }, [user]);

  const verifyPayment = useCallback(async (reference: string): Promise<PaymentVerifyResult> => {
    setLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('paystack-verify', {
        body: { reference },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;

      if (!data.success) {
        throw new Error(data.error || 'Payment verification failed');
      }

      return {
        success: true,
        tier: data.tier,
        billingCycle: data.billingCycle,
        previousTier: data.previousTier,
        changeType: data.changeType,
        receiptNumber: data.receiptNumber,
        alreadyProcessed: data.alreadyProcessed,
      };

    } catch (err: any) {
      const errorMsg = err.message || 'Failed to verify payment';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const validateDiscountCode = useCallback(async (
    code: string,
    tier: string,
    billingCycle: 'monthly' | 'annually'
  ): Promise<DiscountValidationResult> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('validate-discount-code', {
        body: { code, tier, billingCycle },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;

    } catch (err: any) {
      return { valid: false, error: err.message || 'Failed to validate code' };
    }
  }, []);

  return {
    initializePayment,
    verifyPayment,
    validateDiscountCode,
    cancelPayment,
    loading,
    error,
    retryCount,
    clearError: () => setError(null),
  };
}
