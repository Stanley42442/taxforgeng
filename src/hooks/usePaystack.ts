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

export type ConnectionQuality = 'fast' | 'normal' | 'slow' | 'offline';

// Adaptive timeouts based on connection quality
const TIMEOUT_BY_QUALITY: Record<ConnectionQuality, number> = {
  fast: 10000,    // 10s for fast connections
  normal: 15000,  // 15s for normal
  slow: 25000,    // 25s for slow - give more time
  offline: 5000,  // 5s - will fail quickly anyway
};

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // 1s, 2s, 4s exponential backoff

export function usePaystack() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('normal');
  const cancelledRef = useRef(false);

  const cancelPayment = useCallback(() => {
    cancelledRef.current = true;
    setLoading(false);
    setRetryCount(0);
  }, []);

  // Check connection quality before payment
  const checkConnectionQuality = useCallback(async (): Promise<ConnectionQuality> => {
    if (!navigator.onLine) {
      setConnectionQuality('offline');
      return 'offline';
    }

    const start = Date.now();
    try {
      await supabase.auth.getSession();
      const latency = Date.now() - start;
      console.log(`[Paystack] Connection latency: ${latency}ms`);
      
      let quality: ConnectionQuality;
      if (latency < 500) quality = 'fast';
      else if (latency < 2000) quality = 'normal';
      else quality = 'slow';
      
      setConnectionQuality(quality);
      return quality;
    } catch {
      setConnectionQuality('slow');
      return 'slow';
    }
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

    // Check connection quality and set adaptive timeout
    const quality = await checkConnectionQuality();
    const timeoutMs = TIMEOUT_BY_QUALITY[quality];
    console.log(`[Paystack] Connection quality: ${quality}, timeout: ${timeoutMs}ms`);

    if (quality === 'slow') {
      toast.info('Slow connection detected. This may take a moment...');
    }

    // Refresh session and get token in one call (optimized from 2 calls to 1)
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshData.session?.access_token) {
      setLoading(false);
      return { success: false, error: 'Session expired. Please sign in again.' };
    }

    const accessToken = refreshData.session.access_token;

    const attemptPayment = async (attempt: number): Promise<PaymentInitResult> => {
      if (cancelledRef.current) {
        throw new Error('Payment cancelled');
      }

      // Create timeout promise for reliable timeout handling
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
      });

      // Create payment promise
      const paymentPromise = (async () => {
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
            Authorization: `Bearer ${accessToken}`,
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
        // Handle timeout or network errors with retry
        if ((err.message === 'TIMEOUT' || err.message?.includes('fetch') || err.message?.includes('network')) && !cancelledRef.current) {
          if (attempt < MAX_RETRIES - 1) {
            const nextAttempt = attempt + 1;
            setRetryCount(nextAttempt);
            console.log(`[Payment] Attempt ${attempt + 1} failed, retrying in ${RETRY_DELAYS[attempt]}ms...`);
            toast.info(`Connection issue. Retrying... (${nextAttempt}/${MAX_RETRIES})`);
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
  }, [user, checkConnectionQuality]);

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
    checkConnectionQuality,
    loading,
    error,
    retryCount,
    connectionQuality,
    clearError: () => setError(null),
  };
}
