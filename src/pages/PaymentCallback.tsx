import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePaystack } from '@/hooks/usePaystack';
import { useUpgradeCelebration } from '@/components/UpgradeCelebrationProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubscriptionTier } from '@/contexts/SubscriptionContext';

type VerificationStatus = 'verifying' | 'success' | 'failed' | 'error';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPayment } = usePaystack();
  const { triggerCelebration } = useUpgradeCelebration();
  
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [message, setMessage] = useState('');
  const [tier, setTier] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    const verify = async () => {
      if (!reference) {
        setStatus('error');
        setMessage('No payment reference found');
        return;
      }

      try {
        const result = await verifyPayment(reference);

        if (result.success) {
          setStatus('success');
          setTier(result.tier || '');
          setReceiptNumber(result.receiptNumber || '');
          
          if (!result.alreadyProcessed) {
            setMessage('Your subscription has been activated!');
            // Trigger celebration after a short delay
            setTimeout(() => {
              triggerCelebration((result.tier || 'business') as SubscriptionTier);
            }, 500);
          } else {
            setMessage('This payment was already processed.');
          }
        } else {
          setStatus('failed');
          setMessage(result.error || 'Payment verification failed');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'An error occurred during verification');
      }
    };

    verify();
  }, [reference, verifyPayment, triggerCelebration]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 py-8"
          >
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment...
              </p>
            </div>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center"
            >
              <CheckCircle2 className="h-12 w-12 text-success" />
            </motion.div>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-success">Payment Successful!</h2>
              <p className="text-muted-foreground mb-4">{message}</p>
              {tier && (
                <p className="text-sm text-muted-foreground">
                  You are now on the <span className="font-medium text-foreground capitalize">{tier}</span> plan
                </p>
              )}
              {receiptNumber && (
                <p className="text-xs text-muted-foreground mt-2">
                  Receipt: {receiptNumber}
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/billing')}>
                View Billing
              </Button>
            </div>
          </motion.div>
        );

      case 'failed':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 py-8"
          >
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-destructive">Payment Failed</h2>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={() => navigate('/pricing')}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 py-8"
          >
            <div className="h-20 w-20 rounded-full bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-warning" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-warning">Verification Error</h2>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={() => window.location.reload()}>
                Retry Verification
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative w-full overflow-x-hidden">
      <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <main className="flex-1 relative z-10 py-8 px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <AnimatePresence mode="wait">
                {renderContent()}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
