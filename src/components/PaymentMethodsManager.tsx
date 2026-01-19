import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Payment2FADialog } from '@/components/Payment2FADialog';
import { 
  CreditCard, 
  Trash2, 
  Star, 
  Plus, 
  Shield,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PaymentMethod {
  id: string;
  card_type: string;
  last_four: string;
  exp_month: number;
  exp_year: number;
  bank: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export function PaymentMethodsManager() {
  const { user } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [show2FA, setShow2FA] = useState(false);
  const [pending2FAAction, setPending2FAAction] = useState<{
    type: 'remove' | 'set_default';
    methodId: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMethods(data || []);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = (methodId: string) => {
    setPending2FAAction({ type: 'set_default', methodId });
    setShow2FA(true);
  };

  const handleRemove = (methodId: string) => {
    setDeleteConfirm(methodId);
  };

  const confirmRemove = () => {
    if (deleteConfirm) {
      setPending2FAAction({ type: 'remove', methodId: deleteConfirm });
      setDeleteConfirm(null);
      setShow2FA(true);
    }
  };

  const onVerified = async () => {
    if (!pending2FAAction) return;

    setActionLoading(pending2FAAction.methodId);

    try {
      if (pending2FAAction.type === 'set_default') {
        // First, unset all defaults
        await supabase
          .from('user_payment_methods')
          .update({ is_default: false })
          .eq('user_id', user?.id);

        // Then set the new default
        const { error } = await supabase
          .from('user_payment_methods')
          .update({ is_default: true })
          .eq('id', pending2FAAction.methodId)
          .eq('user_id', user?.id);

        if (error) throw error;
        toast.success('Default payment method updated');
      } else if (pending2FAAction.type === 'remove') {
        // Soft delete - mark as inactive
        const { error } = await supabase
          .from('user_payment_methods')
          .update({ is_active: false })
          .eq('id', pending2FAAction.methodId)
          .eq('user_id', user?.id);

        if (error) throw error;
        toast.success('Payment method removed');
      }

      await fetchPaymentMethods();
    } catch (err) {
      console.error('Error updating payment method:', err);
      toast.error('Failed to update payment method');
    } finally {
      setActionLoading(null);
      setPending2FAAction(null);
    }
  };

  const getCardIcon = (cardType: string) => {
    const type = cardType.toLowerCase();
    if (type.includes('visa')) return '💳';
    if (type.includes('master')) return '💳';
    if (type.includes('verve')) return '💳';
    return '💳';
  };

  const isExpired = (month: number, year: number) => {
    const now = new Date();
    const expiry = new Date(year, month - 1);
    return expiry < now;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Manage your saved payment methods for subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {methods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-2">No payment methods saved</p>
              <p className="text-sm text-muted-foreground">
                Your payment methods will appear here after your first payment
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {methods.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    method.is_default ? 'border-primary/50 bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getCardIcon(method.card_type)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">
                          {method.card_type}
                        </span>
                        <span className="text-muted-foreground">
                          •••• {method.last_four}
                        </span>
                        {method.is_default && (
                          <Badge variant="outline" className="text-xs">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          Expires {method.exp_month.toString().padStart(2, '0')}/{method.exp_year}
                        </span>
                        {method.bank && <span>• {method.bank}</span>}
                        {isExpired(method.exp_month, method.exp_year) && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!method.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                        disabled={actionLoading === method.id}
                      >
                        {actionLoading === method.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-1" />
                            Set Default
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemove(method.id)}
                      disabled={actionLoading === method.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Secure Payment Methods</p>
                <p className="text-muted-foreground">
                  All payment methods require 2FA verification before changes. 
                  We never store your full card details.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Dialog */}
      <Payment2FADialog
        open={show2FA}
        onOpenChange={(open) => {
          setShow2FA(open);
          if (!open) setPending2FAAction(null);
        }}
        tokenType={pending2FAAction?.type === 'remove' ? 'remove_payment_method' : 'set_default_payment_method'}
        operationData={{ methodId: pending2FAAction?.methodId }}
        onVerified={onVerified}
        title="Verify Payment Change"
        description="For security, please verify your identity to update payment methods."
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? 
              You'll need to verify your identity to complete this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground">
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
