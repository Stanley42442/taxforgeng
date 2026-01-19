import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type TokenType = 'subscription_change' | 'add_payment_method' | 'remove_payment_method' | 'set_default_payment_method';
export type DeliveryMethod = 'email' | 'sms';

interface VerificationState {
  tokenId: string | null;
  maskedTarget: string | null;
  deliveryMethod: DeliveryMethod | null;
  isVerifying: boolean;
  isVerified: boolean;
  expiresAt: Date | null;
}

export function usePayment2FA() {
  const [state, setState] = useState<VerificationState>({
    tokenId: null,
    maskedTarget: null,
    deliveryMethod: null,
    isVerifying: false,
    isVerified: false,
    expiresAt: null,
  });
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const requestVerification = useCallback(async (
    tokenType: TokenType,
    deliveryMethod: DeliveryMethod = 'email',
    operationData?: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string }> => {
    setSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('payment-2fa', {
        body: {
          operation: 'send_code',
          tokenType,
          deliveryMethod,
          operationData,
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to send verification code');

      setState({
        tokenId: data.tokenId,
        maskedTarget: data.maskedTarget,
        deliveryMethod: data.deliveryMethod,
        isVerifying: true,
        isVerified: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });

      toast.success(`Verification code sent to ${data.maskedTarget}`);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send verification code';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setSending(false);
    }
  }, []);

  const verifyCode = useCallback(async (code: string): Promise<{ success: boolean; operationData?: unknown; error?: string }> => {
    if (!state.tokenId) {
      return { success: false, error: 'No verification in progress' };
    }

    setVerifying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('payment-2fa', {
        body: {
          operation: 'verify_code',
          tokenId: state.tokenId,
          code,
        }
      });

      if (error) throw error;
      if (!data?.verified) throw new Error(data?.error || 'Verification failed');

      setState(prev => ({
        ...prev,
        isVerified: true,
        isVerifying: false,
      }));

      toast.success('Verification successful');
      return { success: true, operationData: data.operationData };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setVerifying(false);
    }
  }, [state.tokenId]);

  const reset = useCallback(() => {
    setState({
      tokenId: null,
      maskedTarget: null,
      deliveryMethod: null,
      isVerifying: false,
      isVerified: false,
      expiresAt: null,
    });
  }, []);

  const resendCode = useCallback(async (
    tokenType: TokenType,
    deliveryMethod: DeliveryMethod = 'email',
    operationData?: Record<string, unknown>
  ) => {
    reset();
    return requestVerification(tokenType, deliveryMethod, operationData);
  }, [reset, requestVerification]);

  return {
    ...state,
    sending,
    verifying,
    requestVerification,
    verifyCode,
    resendCode,
    reset,
  };
}
