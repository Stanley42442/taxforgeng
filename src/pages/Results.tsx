import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calculator, 
  Download, 
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Info,
  FileText,
  Building2,
  Briefcase,
  BarChart3,
  FileDown,
  Crown,
  Lock,
  Save,
  Plus,
  ListOrdered,
  Sparkles,
  Percent,
  Receipt,
  Fuel,
  Leaf,
  Mail,
  Printer
} from "lucide-react";
import { ExportActionsMenu } from "@/components/ExportActionsMenu";
import { formatCurrency, calculateTax, type TaxResult, type TaxInputs } from "@/lib/taxCalculations";
import { downloadPDF } from "@/lib/pdfExport";
import { useState, useEffect, useRef } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { notifyTaxCalculation } from "@/lib/notifications";
import { PageLayout } from "@/components/PageLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useFormFeedback } from "@/hooks/useFormFeedback";
import { SuccessCelebration } from "@/components/ui/form-feedback";
import { SharedElement } from "@/components/PageTransition";
import { VerificationBadge } from "@/components/VerificationBadge";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const result = location.state?.result as TaxResult | undefined;
  const inputs = location.state?.inputs as TaxInputs | undefined;
  const [showComparison, setShowComparison] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const { canExport, showWatermark, tier, canSaveBusiness, addBusiness } = useSubscription();
  const savedRef = useRef(false);

  // Save calculation to database when results are displayed
  useEffect(() => {
    const saveCalculation = async () => {
      if (!user || !result || !inputs || savedRef.current) return;
      
      savedRef.current = true;
      
      try {
        const { error } = await supabase.from('tax_calculations').insert([{
          user_id: user.id,
          inputs: JSON.parse(JSON.stringify(inputs)),
          result: JSON.parse(JSON.stringify(result)),
        }]);
        
        if (error) {
          console.error('Error saving calculation:', error);
        } else {
          console.log('Calculation saved successfully');
          notifyTaxCalculation(result.entityType, result.totalTaxPayable);
        }
      } catch (error) {
        console.error('Error saving calculation:', error);
      }
    };

    saveCalculation();
  }, [user, result, inputs]);

  if (!result || !inputs) {
    return (
      <PageLayout title="No Results Available" icon={FileText}>
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-6">Please use the calculator first to generate results.</p>
          <Link to="/calculator">
            <Button variant="hero">Go to Calculator</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  // Calculate comparison data
  const companyInputs: TaxInputs = { ...inputs, entityType: 'company' };
  const businessInputs: TaxInputs = { ...inputs, entityType: 'business_name' };
  const companyResult = calculateTax(companyInputs);
  const businessResult = calculateTax(businessInputs);

  // Form feedback for saving business
  const saveFormFeedback = useFormFeedback({
    successDuration: 3000,
    onSuccess: () => {
      setShowSaveDialog(false);
      setBusinessName("");
    }
  });

  const handleSaveBusiness = () => {
    if (!businessName.trim()) {
      toast.error("Please enter a business name");
      return;
    }

    if (tier === 'free') {
      toast.error("Upgrade to save businesses", {
        action: { label: "Upgrade", onClick: () => navigate('/pricing') }
      });
      return;
    }

    if (!canSaveBusiness()) {
      toast.error("Business limit reached for your plan", {
        action: { label: "Upgrade", onClick: () => navigate('/pricing') }
      });
      return;
    }

    saveFormFeedback.setLoading();

    const success = addBusiness({
      name: businessName.trim(),
      entityType: inputs.entityType,
      turnover: inputs.turnover,
    });

    if (success) {
      saveFormFeedback.setSuccess(
        `${businessName} Saved! 🎉`,
        `Business added to your portfolio`
      );
    } else {
      saveFormFeedback.setError("Failed to save business");
    }
  };

  const exportToCSV = () => {
    if (!canExport()) {
      toast.error("Upgrade to export reports", {
        action: { label: "Upgrade", onClick: () => navigate('/pricing') }
      });
      return;
    }
    
    // Import and use the shared export function
    import("@/lib/resultsExport").then(({ exportResultsToCSV }) => {
      exportResultsToCSV(result, inputs);
      toast.success("CSV exported successfully");
    });
  };

  const exportToPDF = () => {
    if (!canExport()) {
      toast.error("Upgrade to export reports", {
        action: { label: "Upgrade", onClick: () => navigate('/pricing') }
      });
      return;
    }
    downloadPDF(result, inputs, showWatermark());
  };

  const alertIcons = {
    info: <Info className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    success: <CheckCircle2 className="h-4 w-4" />,
  };

  const alertColors = {
    info: 'bg-info/10 text-info border-info/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    success: 'bg-success/10 text-success border-success/20',
  };

  const savings = businessResult.totalTaxPayable - companyResult.totalTaxPayable;
  const betterOption = savings > 0 ? 'company' : 'business_name';

  return (
    <PageLayout 
      title="Tax Calculation Results" 
      icon={FileText}
      description={`${result.entityType} • ${inputs.use2026Rules ? '2026 Rules' : 'Pre-2026 Rules'}`}
      maxWidth="4xl"
      headerActions={
        <Button 
          variant="ghost" 
          onClick={() => navigate('/calculator', { state: { entityType: inputs.entityType } })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      }
    >
      {/* Success Celebration with Confetti */}
      <SuccessCelebration 
        isVisible={saveFormFeedback.isSuccess} 
        message={saveFormFeedback.message}
        description={saveFormFeedback.description}
        onComplete={saveFormFeedback.reset}
      />
      {/* Action Buttons Row */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <Link to="/tax-breakdown" state={{ result, inputs }}>
          <Button variant="hero">
            <ListOrdered className="h-4 w-4" />
            View Breakdown
          </Button>
        </Link>
        <Button
          variant={showComparison ? "hero" : "outline"}
          onClick={() => setShowComparison(!showComparison)}
        >
          <BarChart3 className="h-4 w-4" />
          {showComparison ? 'Hide Comparison' : 'Compare Entities'}
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowSaveDialog(true)}
          disabled={tier === 'free'}
        >
          <Save className="h-4 w-4" />
          Save Business
          {tier === 'free' && <Lock className="h-3 w-3 ml-1" />}
        </Button>
        <ExportActionsMenu
          onExportPDF={exportToPDF}
          onExportCSV={exportToCSV}
          reportTitle={`Tax Calculation - ${result.entityType}`}
          reportType="tax-calculation"
        />
      </div>

      {/* Comparison Dashboard */}
      {showComparison && (
        <div className="rounded-2xl border border-border glass-frosted p-6 shadow-card mb-6 animate-slide-up">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Entity Comparison Dashboard
          </h3>
          
          {/* Recommendation Banner */}
          <div className={`rounded-xl p-4 mb-6 ${
            betterOption === inputs.entityType 
              ? 'bg-success/10 border border-success/20' 
              : 'bg-warning/10 border border-warning/20'
          }`}>
            <p className={`text-sm font-medium ${
              betterOption === inputs.entityType ? 'text-success' : 'text-warning'
            }`}>
              {betterOption === inputs.entityType 
                ? `✓ You've selected the optimal structure for your turnover.` 
                : `💡 Switching to ${betterOption === 'company' ? 'a Limited Company' : 'a Business Name'} could save you ${formatCurrency(Math.abs(savings))}`
              }
            </p>
          </div>

          {/* Side by Side Comparison */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Business Name Column */}
            <div className={`rounded-xl p-5 ${
              inputs.entityType === 'business_name' 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'bg-secondary/50'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-foreground">Business Name</h4>
                {inputs.entityType === 'business_name' && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Current</span>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax Payable</span>
                  <span className="font-semibold text-foreground">{formatCurrency(businessResult.totalTaxPayable)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Effective Rate</span>
                  <span className="font-medium text-foreground">{businessResult.effectiveRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Income Tax</span>
                  <span className="text-foreground">{formatCurrency(businessResult.incomeTax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT</span>
                  <span className="text-foreground">{formatCurrency(businessResult.vatPayable)}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Personal Income Tax (PIT) based on progressive tax bands
                </p>
              </div>
            </div>

            {/* Company Column */}
            <div className={`rounded-xl p-5 ${
              inputs.entityType === 'company' 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'bg-secondary/50'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-foreground">Limited Company</h4>
                {inputs.entityType === 'company' && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Current</span>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax Payable</span>
                  <span className="font-semibold text-foreground">{formatCurrency(companyResult.totalTaxPayable)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Effective Rate</span>
                  <span className="font-medium text-foreground">{companyResult.effectiveRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CIT</span>
                  <span className="text-foreground">{formatCurrency(companyResult.incomeTax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dev. Levy</span>
                  <span className="text-foreground">{formatCurrency(companyResult.developmentLevy)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT</span>
                  <span className="text-foreground">{formatCurrency(companyResult.vatPayable)}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {companyResult.isSmallCompany 
                    ? '0% CIT for small companies (≤₦25M turnover)'
                    : 'Company Income Tax (CIT) at applicable rate'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Visual Bar Comparison */}
          <div className="mt-6 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Business Name</span>
                <span>{formatCurrency(businessResult.totalTaxPayable)}</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(100, (businessResult.totalTaxPayable / Math.max(businessResult.totalTaxPayable, companyResult.totalTaxPayable)) * 100)}%` 
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Limited Company</span>
                <span>{formatCurrency(companyResult.totalTaxPayable)}</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(100, (companyResult.totalTaxPayable / Math.max(businessResult.totalTaxPayable, companyResult.totalTaxPayable)) * 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Verification Badge */}
      {result.verification && (
        <div className="mb-6 animate-slide-up">
          <VerificationBadge 
            verification={result.verification}
            onReVerify={() => toast.info('Rules verified as of Jan 21, 2026')}
          />
        </div>
      )}

      {/* Alerts */}
      {result.alerts.length > 0 && (
        <div className="space-y-3 mb-6 animate-slide-up">
          {result.alerts.map((alert, i) => (
            <div 
              key={i}
              className={`flex items-start gap-3 rounded-xl border p-4 ${alertColors[alert.type]}`}
            >
              {alertIcons[alert.type]}
              <p className="text-sm">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6 animate-slide-up">
        {/* Gross Income */}
        <div className="rounded-2xl border border-border glass-frosted p-4 sm:p-6 shadow-card overflow-hidden card-interactive">
          <p className="text-sm text-muted-foreground mb-1">Gross Income</p>
          <p className="text-lg sm:text-2xl font-bold text-foreground break-all">{formatCurrency(result.grossIncome)}</p>
        </div>

        {/* Taxable Income */}
        <div className="rounded-2xl border border-border glass-frosted p-4 sm:p-6 shadow-card overflow-hidden card-interactive">
          <p className="text-sm text-muted-foreground mb-1">Taxable Income</p>
          <p className="text-lg sm:text-2xl font-bold text-foreground break-all">{formatCurrency(result.taxableIncome)}</p>
        </div>

        {/* Total Tax */}
        <div className="rounded-2xl border border-primary/30 glass-frosted p-4 sm:p-6 shadow-card overflow-hidden glow-sm">
          <p className="text-sm text-muted-foreground mb-1">Total Tax Payable</p>
          <p className="text-lg sm:text-2xl font-bold text-primary break-all">{formatCurrency(result.totalTaxPayable)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Effective Rate: {result.effectiveRate.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Save Business Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Business</DialogTitle>
            <DialogDescription>
              Save this calculation to your business list
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBusiness}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Results;