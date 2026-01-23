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

const PAYMENT_TIMEOUT_MS = 15000; // 15 seconds for faster feedback
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // 1s, 2s, 4s exponential backoff

export function usePaystack() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const cancelledRef = useRef(false);

  const cancelPayment = useCallback(() => {
    cancelledRef.current = true;
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
    cancelledRef.current = false;

    // Refresh session before payment to ensure fresh token
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      setLoading(false);
      return { success: false, error: 'Session expired. Please sign in again.' };
    }

    const attemptPayment = async (attempt: number): Promise<PaymentInitResult> => {
      if (cancelledRef.current) {
        throw new Error('Payment cancelled');
      }

      // Create timeout promise for reliable timeout handling
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), PAYMENT_TIMEOUT_MS);
      });

      // Create payment promise
      const paymentPromise = (async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session?.access_token) {
          throw new Error('Session expired. Please sign in again.');
        }

        console.log(`[Payment] Attempt ${attempt + 1}: Starting request...`);
        const startTime = Date.now();

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
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
        });

        console.log(`[Payment] Response received in ${Date.now() - startTime}ms`);

        if (response.error) {
          throw new Error(response.error.message);
        }

        const data = response.data;

        if (!data.success) {
          throw new Error(data.error || 'Failed to initialize payment');
        }

        return {
          success: true as const,
          authorizationUrl: data.authorizationUrl,
          reference: data.reference,
          amount: data.amount,
          originalAmount: data.originalAmount,
          discountAmount: data.discountAmount,
          discountApplied: data.discountApplied,
        };
      })();

      try {
        // Race between payment and timeout
        const result = await Promise.race([paymentPromise, timeoutPromise]);
        return result;
      } catch (err: any) {
        // Handle timeout or other errors with retry
        if (err.message === 'TIMEOUT' || err.message?.includes('fetch')) {
          if (attempt < MAX_RETRIES && !cancelledRef.current) {
            const nextAttempt = attempt + 1;
            setRetryCount(nextAttempt);
            console.log(`[Payment] Timeout on attempt ${attempt + 1}, retrying...`);
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
