import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { usePayment2FA, TokenType, DeliveryMethod } from '@/hooks/usePayment2FA';
import { Loader2, Mail, Phone, RefreshCw, Shield, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Payment2FADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenType: TokenType;
  operationData?: Record<string, unknown>;
  onVerified: (operationData?: unknown) => void;
  title?: string;
  description?: string;
}

export function Payment2FADialog({
  open,
  onOpenChange,
  tokenType,
  operationData,
  onVerified,
  title = 'Verify Your Identity',
  description = 'For your security, please enter the verification code we sent to you.',
}: Payment2FADialogProps) {
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'method' | 'verify' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<DeliveryMethod>('email');
  
  const {
    maskedTarget,
    isVerifying,
    isVerified,
    expiresAt,
    sending,
    verifying,
    requestVerification,
    verifyCode,
    resendCode,
    reset,
  } = usePayment2FA();

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setCode('');
      setStep('method');
      reset();
    }
  }, [open, reset]);

  // Handle verification success
  useEffect(() => {
    if (isVerified) {
      setStep('success');
      setTimeout(() => {
        onVerified();
        onOpenChange(false);
      }, 1500);
    }
  }, [isVerified, onVerified, onOpenChange]);

  const handleSendCode = async (method: DeliveryMethod) => {
    setSelectedMethod(method);
    const result = await requestVerification(tokenType, method, operationData);
    if (result.success) {
      setStep('verify');
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    await verifyCode(code);
  };

  const handleResend = async () => {
    setCode('');
    await resendCode(tokenType, selectedMethod, operationData);
  };

  const getTimeRemaining = () => {
    if (!expiresAt) return null;
    const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'method' && (
            <motion.div
              key="method"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-4"
            >
              <p className="text-sm text-muted-foreground">
                Choose how you'd like to receive your verification code:
              </p>
              
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  className="h-16 justify-start gap-4"
                  onClick={() => handleSendCode('email')}
                  disabled={sending}
                >
                  {sending && selectedMethod === 'email' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Mail className="h-5 w-5 text-primary" />
                  )}
                  <div className="text-left">
                    <p className="font-medium">Email</p>
                    <p className="text-xs text-muted-foreground">
                      Send code to your registered email
                    </p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-16 justify-start gap-4"
                  onClick={() => handleSendCode('sms')}
                  disabled={sending}
                >
                  {sending && selectedMethod === 'sms' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Phone className="h-5 w-5 text-primary" />
                  )}
                  <div className="text-left">
                    <p className="font-medium">SMS</p>
                    <p className="text-xs text-muted-foreground">
                      Send code to your phone number
                    </p>
                  </div>
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 py-4"
            >
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  We sent a 6-digit code to
                </p>
                <p className="font-medium text-foreground">{maskedTarget}</p>
                {expiresAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Code expires in {getTimeRemaining()}
                  </p>
                )}
              </div>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                  disabled={verifying}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleVerify}
                  disabled={code.length !== 6 || verifying}
                  className="w-full"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResend}
                  disabled={sending}
                  className="text-muted-foreground"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Resend code
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="h-8 w-8 text-success" />
              </motion.div>
              <p className="font-medium text-success">Verification Successful</p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
