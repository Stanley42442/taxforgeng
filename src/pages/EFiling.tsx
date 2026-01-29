import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/taxCalculations";
import {
  FileCheck,
  Upload,
  CheckCircle2,
  Crown,
  AlertCircle,
  Loader2,
  CreditCard,
  Download,
  Building2,
  FileText
} from "lucide-react";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EFiling = () => {
  const { tier, savedBusinesses } = useSubscription();
  const navigate = useNavigate();
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [filingStep, setFilingStep] = useState<'select' | 'review' | 'processing' | 'payment' | 'complete'>('select');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const isBusinessPlus = tier === 'business' || tier === 'corporate';

  // Reset selected business if it no longer exists
  useEffect(() => {
    if (selectedBusiness && !savedBusinesses.find(b => b.id === selectedBusiness)) {
      setSelectedBusiness('');
      setFilingStep('select');
    }
  }, [savedBusinesses, selectedBusiness]);

  if (!isBusinessPlus) {
    return (
      <PageLayout title="E-Filing & Payment" icon={FileCheck} maxWidth="md">
        <div className="max-w-lg mx-auto py-12">
          <UpgradePrompt 
            feature="E-Filing & Tax Payment" 
            requiredTier="business"
            showFeatures={true}
          />
        </div>
      </PageLayout>
    );
  }

  const business = savedBusinesses.find(b => b.id === selectedBusiness);
  const mockTaxDue = business ? Math.round(business.turnover * 0.08) : 0;

  const handleStartFiling = () => {
    if (!selectedBusiness) {
      toast.error("Please select a business");
      return;
    }
    setFilingStep('review');
  };

  const handleSubmitFiling = () => {
    setFilingStep('processing');
    setTimeout(() => {
      setFilingStep('payment');
    }, 3000);
  };

  const handlePayment = () => {
    setShowPaymentDialog(true);
  };

  const processPayment = () => {
    setShowPaymentDialog(false);
    toast.success("Payment processed successfully!");
    setFilingStep('complete');
  };

  const renderStep = () => {
    switch (filingStep) {
      case 'select':
        return (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card animate-slide-up">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Select Business to File
            </h2>
            
            {savedBusinesses.length === 0 ? (
              <div className="text-center py-10">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  No saved businesses. Save a business first to file returns.
                </p>
                <Button variant="outline" onClick={() => navigate('/businesses')}>
                  Go to My Businesses
                </Button>
              </div>
            ) : (
              <>
                <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                  <SelectTrigger className="mb-4">
                    <SelectValue placeholder="Choose a business" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedBusinesses.map((biz) => (
                      <SelectItem key={biz.id} value={biz.id}>
                        {biz.name} ({biz.entityType === 'company' ? 'LTD' : 'BN'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {business && (
                  <div className="p-4 rounded-lg bg-secondary/50 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Business Name</p>
                        <p className="font-medium text-foreground">{business.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Entity Type</p>
                        <p className="font-medium text-foreground">
                          {business.entityType === 'company' ? 'Limited Company' : 'Business Name'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Turnover</p>
                        <p className="font-medium text-foreground">{formatCurrency(business.turnover)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Est. Tax Due</p>
                        <p className="font-medium text-primary">{formatCurrency(mockTaxDue)}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={handleStartFiling}
                  disabled={!selectedBusiness}
                >
                  <FileText className="h-4 w-4" />
                  Start E-Filing
                </Button>
              </>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card animate-slide-up">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Review Pre-Filled Return
            </h2>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning">Mock E-Filing</p>
                  <p className="text-xs text-warning/80">
                    This is a demonstration. Real FIRS integration coming soon!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-lg border border-border">
                <h3 className="font-medium text-foreground mb-3">
                  {business?.entityType === 'company' ? 'Company Income Tax Return' : 'Personal Income Tax Return'}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Taxpayer Name</p>
                    <p className="font-medium">{business?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tax Year</p>
                    <p className="font-medium">2025</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">RC/BN Number</p>
                    <p className="font-medium">RC1234567</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">TIN</p>
                    <p className="font-medium">12345678-0001</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border">
                <h3 className="font-medium text-foreground mb-3">Income & Tax Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Income</span>
                    <span className="font-medium">{formatCurrency(business?.turnover || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Allowable Deductions</span>
                    <span className="font-medium">-{formatCurrency((business?.turnover || 0) * 0.2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxable Income</span>
                    <span className="font-medium">{formatCurrency((business?.turnover || 0) * 0.8)}</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between text-base">
                    <span className="font-medium text-foreground">Tax Payable</span>
                    <span className="font-bold text-primary">{formatCurrency(mockTaxDue)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setFilingStep('select')}>
                Back
              </Button>
              <Button variant="hero" className="flex-1" onClick={handleSubmitFiling}>
                <Upload className="h-4 w-4" />
                Submit to FIRS (Mock)
              </Button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="rounded-2xl border border-border bg-card p-10 shadow-card animate-slide-up text-center">
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Processing Your Return
            </h2>
            <p className="text-muted-foreground">
              Submitting to FIRS... Please wait.
            </p>
          </div>
        );

      case 'payment':
        return (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card animate-slide-up">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Return Submitted Successfully!
              </h2>
              <p className="text-muted-foreground">
                Reference: FIRS-2025-{crypto.randomUUID().slice(0, 8).toUpperCase()}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6 overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">Tax Due</p>
                  <p className="text-lg sm:text-2xl font-bold text-primary break-all">{formatCurrency(mockTaxDue)}</p>
                </div>
                <Button variant="hero" onClick={handlePayment} className="shrink-0">
                  <CreditCard className="h-4 w-4" />
                  Pay Now
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4" />
                Download Receipt
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setFilingStep('select')}>
                File Another
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="rounded-2xl border border-border bg-card p-10 shadow-card animate-slide-up text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Filing Complete!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your tax return has been submitted and payment processed.
            </p>

            <div className="p-4 rounded-lg bg-secondary/50 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Filing Reference</p>
                  <p className="font-medium">FIRS-2025-{crypto.randomUUID().slice(0, 6).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Reference</p>
                  <p className="font-medium">PAY-{crypto.randomUUID().slice(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount Paid</p>
                  <p className="font-medium text-success">{formatCurrency(mockTaxDue)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium text-success">✓ Completed</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Download Receipt
              </Button>
              <Button variant="hero" onClick={() => setFilingStep('select')}>
                File Another Return
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <PageLayout 
      title="E-Filing & Payment" 
      icon={FileCheck}
      description="File tax returns and pay directly (Mock)"
      maxWidth="2xl"
    >
      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2 text-sm">
          {['Select', 'Review', 'Submit', 'Pay', 'Done'].map((step, i) => {
            const stepIndex = ['select', 'review', 'processing', 'payment', 'complete'].indexOf(filingStep);
            const isActive = i <= stepIndex;
            return (
              <div key={step} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  {i + 1}
                </div>
                {i < 4 && <div className={`w-8 h-0.5 ${isActive ? 'bg-primary' : 'bg-secondary'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {renderStep()}

      <p className="text-xs text-muted-foreground text-center mt-6">
        Mock e-filing for demonstration. Real FIRS/State IRS integration coming soon.
      </p>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay Tax Due</DialogTitle>
            <DialogDescription>
              Complete payment via Paystack (Test Mode)
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="p-4 rounded-lg bg-secondary/50 mb-4 overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-lg sm:text-2xl font-bold text-primary break-all">{formatCurrency(mockTaxDue)}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Payment will be forwarded to FIRS (Mock demonstration)
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={processPayment}>
              <CreditCard className="h-4 w-4" />
              Pay {formatCurrency(mockTaxDue)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default EFiling;