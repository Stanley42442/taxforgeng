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
  Leaf
} from "lucide-react";
import { formatCurrency, calculateTax, type TaxResult, type TaxInputs } from "@/lib/taxCalculations";
import { downloadPDF } from "@/lib/pdfExport";
import { useState, useEffect, useRef } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { notifyTaxCalculation } from "@/lib/notifications";
import { NavMenu } from "@/components/NavMenu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
          // Send notification for completed tax calculation
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
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">No Results Available</h1>
            <p className="text-muted-foreground mb-6">Please use the calculator first to generate results.</p>
            <Link to="/calculator">
              <Button variant="hero">Go to Calculator</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate comparison data
  const companyInputs: TaxInputs = { ...inputs, entityType: 'company' };
  const businessInputs: TaxInputs = { ...inputs, entityType: 'business_name' };
  const companyResult = calculateTax(companyInputs);
  const businessResult = calculateTax(businessInputs);

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

    const success = addBusiness({
      name: businessName.trim(),
      entityType: inputs.entityType,
      turnover: inputs.turnover,
    });

    if (success) {
      toast.success(`${businessName} saved successfully!`, {
        action: { label: "View", onClick: () => navigate('/businesses') }
      });
      setShowSaveDialog(false);
      setBusinessName("");
    } else {
      toast.error("Failed to save business");
    }
  };

  const exportToCSV = () => {
    if (!canExport()) {
      toast.error("Upgrade to export reports", {
        action: { label: "Upgrade", onClick: () => navigate('/pricing') }
      });
      return;
    }
    const rows = [
      ['TaxForge NG Tax Calculation Report'],
      [''],
      ['Entity Type', result.entityType],
      ['Tax Rules', inputs.use2026Rules ? '2026 (New Rules)' : 'Pre-2026 (Current)'],
      [''],
      ['Income Summary'],
      ['Gross Income', result.grossIncome],
      ['Taxable Income', result.taxableIncome],
      [''],
      ['Tax Breakdown'],
      ...result.breakdown.map(item => [item.label, item.amount]),
      [''],
      ['Summary'],
      ['Total Tax Payable', result.totalTaxPayable],
      ['Effective Rate', `${result.effectiveRate.toFixed(2)}%`],
    ];

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taxforge-ng-calculation.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      <NavMenu />

      <main className="container mx-auto px-4 py-6 pb-8 flex-1">
        <div className="mx-auto max-w-4xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate('/calculator', { state: { entityType: inputs.entityType } })}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Calculator
          </Button>

          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
              <FileText className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tax Calculation Results
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                {inputs.entityType === 'company' 
                  ? <Building2 className="h-4 w-4" /> 
                  : <Briefcase className="h-4 w-4" />
                }
                {result.entityType}
              </span>
              <span className="text-border">•</span>
              <span>{inputs.use2026Rules ? '2026 Rules' : 'Pre-2026 Rules'}</span>
            </div>
          </div>

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
            <Button variant="outline" onClick={exportToPDF}>
              <FileDown className="h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>

          {/* Comparison Dashboard */}
          {showComparison && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-6 animate-slide-up">
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
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <p className="text-sm text-muted-foreground mb-1">Gross Income</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(result.grossIncome)}</p>
            </div>
            
            {/* Total Tax */}
            <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-card">
              <p className="text-sm text-muted-foreground mb-1">Total Tax Payable</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(result.totalTaxPayable)}</p>
            </div>
            
            {/* Effective Rate */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <p className="text-sm text-muted-foreground mb-1">Effective Tax Rate</p>
              <p className="text-2xl font-bold text-foreground">{result.effectiveRate.toFixed(2)}%</p>
            </div>
          </div>

          {/* Tax Breakdown */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-6 animate-slide-up">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Tax Breakdown
            </h3>
            <div className="space-y-3">
              {result.breakdown.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    {item.label.includes('VAT') && <Percent className="h-4 w-4 text-muted-foreground" />}
                    {item.label.includes('Income Tax') && <Calculator className="h-4 w-4 text-muted-foreground" />}
                    {item.label.includes('Levy') && <Leaf className="h-4 w-4 text-muted-foreground" />}
                    {item.label.includes('WHT') && <FileText className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-foreground">{item.label}</span>
                  </div>
                  <span className="font-medium text-foreground">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Net Income After Tax */}
          <div className="rounded-2xl border border-success/30 bg-gradient-to-br from-success/10 to-success/5 p-6 shadow-card animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Net Income After Tax</p>
                <p className="text-3xl font-bold text-success">{formatCurrency(result.grossIncome - result.totalTaxPayable)}</p>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Save Business Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Business</DialogTitle>
            <DialogDescription>
              Save this calculation as a business for quick access later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Business Name</label>
              <Input
                placeholder="Enter business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Entity Type:</strong> {inputs.entityType === 'company' ? 'Limited Company' : 'Business Name'}</p>
              <p><strong>Turnover:</strong> {formatCurrency(inputs.turnover)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveBusiness}>Save Business</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Results;
