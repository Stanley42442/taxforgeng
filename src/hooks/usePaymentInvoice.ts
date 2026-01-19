import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { downloadPaymentInvoice, PaymentInvoiceData, calculatePeriodEnd } from '@/lib/invoicePdfExport';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function usePaymentInvoice() {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState<string | null>(null);

  const generateInvoice = useCallback(async (transactionReference: string) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setDownloading(transactionReference);

    try {
      // Fetch transaction details (with ownership check via RLS)
      const { data: transaction, error: txError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('reference', transactionReference)
        .eq('user_id', user.id) // RLS backup
        .single();

      if (txError || !transaction) {
        throw new Error('Transaction not found or access denied');
      }

      if (transaction.status !== 'success') {
        throw new Error('Can only generate invoices for successful payments');
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      // Calculate VAT (7.5% Nigerian VAT)
      const amountNaira = transaction.amount / 100;
      const vatRate = 7.5;
      // Amount includes VAT, so calculate backwards
      const subtotal = amountNaira / (1 + vatRate / 100);
      const vatAmount = amountNaira - subtotal;

      // Build invoice data
      const invoiceData: PaymentInvoiceData = {
        reference: transaction.reference,
        receiptNumber: transaction.receipt_number || `RCP-${transaction.reference.substring(0, 8).toUpperCase()}`,
        amount: amountNaira,
        originalAmount: transaction.original_amount ? transaction.original_amount / 100 : undefined,
        discountAmount: transaction.discount_amount ? transaction.discount_amount / 100 : undefined,
        discountCode: transaction.discount_code || undefined,
        tier: transaction.tier,
        billingCycle: (transaction.billing_cycle || 'monthly') as 'monthly' | 'annually',
        periodStart: transaction.created_at,
        periodEnd: calculatePeriodEnd(transaction.created_at, transaction.billing_cycle || 'monthly'),
        customerName: profile?.full_name || 'Valued Customer',
        customerEmail: profile?.email || user.email || '',
        businessName: 'TaxForge Nigeria Limited',
        businessAddress: '123 Tax Avenue, Victoria Island, Lagos, Nigeria',
        businessTIN: '12345678-0001', // Nigerian TIN format
        businessEmail: 'billing@taxforgeng.com',
        invoiceDate: transaction.created_at,
        paymentDate: transaction.updated_at || transaction.created_at,
        vatRate,
        vatAmount,
        subtotal,
      };

      downloadPaymentInvoice(invoiceData);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Invoice generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate invoice');
      throw error;
    } finally {
      setDownloading(null);
    }
  }, [user]);

  return { generateInvoice, downloading };
}
