import { Button } from '@/components/ui/button';
import { usePaymentInvoice } from '@/hooks/usePaymentInvoice';
import { Download, Loader2, FileText } from 'lucide-react';

interface DownloadInvoiceButtonProps {
  transactionReference: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'secondary' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  className?: string;
}

export function DownloadInvoiceButton({
  transactionReference,
  variant = 'outline',
  size = 'sm',
  showIcon = true,
  className,
}: DownloadInvoiceButtonProps) {
  const { generateInvoice, downloading } = usePaymentInvoice();
  const isLoading = downloading === transactionReference;

  const handleDownload = () => {
    generateInvoice(transactionReference);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isLoading}
      className={`${className} min-w-[100px]`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-1" />
          <span>Invoice</span>
        </>
      )}
    </Button>
  );
}

interface InvoicePreviewCardProps {
  transactionReference: string;
  receiptNumber: string;
  amount: number;
  tier: string;
  billingCycle: string;
  paymentDate: Date;
}

export function InvoicePreviewCard({ 
  transactionReference,
  receiptNumber,
  amount,
  tier,
  billingCycle,
  paymentDate,
}: InvoicePreviewCardProps) {
  const { generateInvoice, downloading } = usePaymentInvoice();
  const isLoading = downloading === transactionReference;

  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amt);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Invoice #{receiptNumber}</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(paymentDate)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-lg">
            {formatAmount(amount)}
          </p>
          <p className="text-sm text-muted-foreground capitalize">
            {tier} • {billingCycle}
          </p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateInvoice(transactionReference)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download PDF
        </Button>
      </div>
    </div>
  );
}
