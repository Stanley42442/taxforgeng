import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import logger from '@/lib/logger';

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
      logger.debug(`[Paystack] Connection latency: ${latency}ms`);
      
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
    logger.debug('[usePaystack] initializePayment called', { tier, billingCycle, discountCode, discountType, userEmail: user?.email });

    if (!user?.email) {
      logger.error('[usePaystack] No user email - not authenticated');
      return { success: false, error: 'User not authenticated' };
    }

    // Check network status first
    if (!navigator.onLine) {
      logger.error('[usePaystack] Navigator offline');
      return { success: false, error: 'No internet connection. Please check your network and try again.' };
    }

    setLoading(true);
    setError(null);
    setRetryCount(0);
    cancelledRef.current = false;

    // Check connection quality and set adaptive timeout
    logger.debug('[usePaystack] Checking connection quality...');
    const quality = await checkConnectionQuality();
    const timeoutMs = TIMEOUT_BY_QUALITY[quality];
    logger.debug(`[usePaystack] Connection quality: ${quality}, timeout: ${timeoutMs}ms`);

    if (quality === 'slow') {
      toast.info('Slow connection detected. This may take a moment...');
    }

    // Refresh session and get token in one call (optimized from 2 calls to 1)
    logger.debug('[usePaystack] Refreshing session...');
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    logger.debug('[usePaystack] Session refresh result:', { 
      hasSession: !!refreshData?.session, 
      hasToken: !!refreshData?.session?.access_token,
      error: refreshError?.message 
    });
    
    if (refreshError || !refreshData.session?.access_token) {
      logger.error('[usePaystack] Session refresh failed:', refreshError?.message);
      setLoading(false);
      return { success: false, error: 'Session expired. Please sign in again.' };
    }

    const accessToken = refreshData.session.access_token;
    logger.debug('[usePaystack] Got access token, proceeding with payment...');

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
        logger.debug(`[usePaystack] Attempt ${attempt + 1}: Starting edge function request...`);
        const startTime = Date.now();

        const requestBody = {
          tier,
          billingCycle,
          email: user.email,
          callbackUrl: `${window.location.origin}/payment-callback`,
          discountCode,
          discountType,
        };
        logger.debug('[usePaystack] Request body:', requestBody);

        const response = await supabase.functions.invoke('paystack-initialize', {
          body: requestBody,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        logger.debug(`[usePaystack] Response received in ${Date.now() - startTime}ms:`, response);

        if (response.error) {
          logger.error('[usePaystack] Edge function error:', response.error);
          throw new Error(response.error.message);
        }

        const data = response.data;
        logger.debug('[usePaystack] Edge function data:', data);

        if (!data.success) {
          logger.error('[usePaystack] Edge function returned success=false:', data.error);
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
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        // Handle timeout or network errors with retry
        if ((errorMessage === 'TIMEOUT' || errorMessage.includes('fetch') || errorMessage.includes('network')) && !cancelledRef.current) {
          if (attempt < MAX_RETRIES - 1) {
            const nextAttempt = attempt + 1;
            setRetryCount(nextAttempt);
            logger.debug(`[Payment] Attempt ${attempt + 1} failed, retrying in ${RETRY_DELAYS[attempt]}ms...`);
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
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize payment';
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

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to verify payment';
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

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to validate code';
      return { valid: false, error: errorMsg };
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
