import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  Lock
} from "lucide-react";
import { formatCurrency, calculateTax, type TaxResult, type TaxInputs } from "@/lib/taxCalculations";
import { downloadPDF } from "@/lib/pdfExport";
import { useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as TaxResult | undefined;
  const inputs = location.state?.inputs as TaxInputs | undefined;
  const [showComparison, setShowComparison] = useState(false);
  const { canExport, showWatermark, tier } = useSubscription();

  if (!result || !inputs) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">No Results</h1>
          <p className="text-muted-foreground mb-6">Please use the calculator first</p>
          <Link to="/calculator">
            <Button variant="hero">Go to Calculator</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate comparison data
  const companyInputs: TaxInputs = { ...inputs, entityType: 'company' };
  const businessInputs: TaxInputs = { ...inputs, entityType: 'business_name' };
  const companyResult = calculateTax(companyInputs);
  const businessResult = calculateTax(businessInputs);

  const exportToCSV = () => {
    if (!canExport()) {
      toast.error('Upgrade to Basic or higher to export CSV', {
        action: { label: 'Upgrade', onClick: () => navigate('/pricing') }
      });
      return;
    }
    const rows = [
      ['NaijaTaxPro Tax Calculation Report'],
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
    a.download = 'naijataxpro-calculation.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (!canExport()) {
      toast.error('Upgrade to Basic or higher to export PDF', {
        action: { label: 'Upgrade', onClick: () => navigate('/pricing') }
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
    <div className="min-h-screen bg-gradient-hero">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
              <Calculator className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">NaijaTaxPro</span>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8 pb-20">
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

          {/* Toggle Comparison */}
          <div className="flex justify-center mb-6">
            <Button
              variant={showComparison ? "hero" : "outline"}
              onClick={() => setShowComparison(!showComparison)}
            >
              <BarChart3 className="h-4 w-4" />
              {showComparison ? 'Hide' : 'Show'} Comparison Dashboard
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
                    ? '✓ You selected the optimal structure!' 
                    : `💡 Switching to ${betterOption === 'company' ? 'Limited Company' : 'Business Name'} could save you ${formatCurrency(Math.abs(savings))}/year`
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
                      Personal Income Tax via State IRS. Simpler compliance, unlimited liability.
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
                      <span className="text-muted-foreground">Dev Levy</span>
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
                        ? '0% CIT (Small Company). Limited liability protection.'
                        : 'CIT via FIRS. Limited liability, better for scaling.'
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

          {/* Main Result Card */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-card mb-6 animate-slide-up">
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground mb-2">Total Tax Payable</p>
              <p className="text-4xl font-bold text-foreground">
                {formatCurrency(result.totalTaxPayable)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Effective Rate: {result.effectiveRate.toFixed(2)}%
              </p>
            </div>

            {/* Summary Grid */}
            <div className="grid gap-4 sm:grid-cols-2 mb-8">
              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground mb-1">Gross Income</p>
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(result.grossIncome)}
                </p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground mb-1">Taxable Income</p>
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(result.taxableIncome)}
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Tax Breakdown</h3>
              <div className="space-y-3">
                {result.breakdown.map((item, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                    <p className={`font-semibold ${item.amount < 0 ? 'text-success' : 'text-foreground'}`}>
                      {item.amount < 0 ? '-' : ''}{formatCurrency(Math.abs(item.amount))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Input Summary */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card mb-6 animate-slide-up">
            <h3 className="font-semibold text-foreground mb-4">Your Inputs</h3>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <InputRow label="Turnover" value={inputs.turnover} />
              <InputRow label="Expenses" value={inputs.expenses} />
              {inputs.entityType === 'company' && (
                <InputRow label="Fixed Assets" value={inputs.fixedAssets} />
              )}
              {inputs.entityType === 'business_name' && inputs.use2026Rules && (
                <InputRow label="Rent Paid" value={inputs.rentPaid} />
              )}
              {inputs.vatableSales > 0 && (
                <InputRow label="Vatable Sales" value={inputs.vatableSales} />
              )}
              {inputs.vatablePurchases > 0 && (
                <InputRow label="Vatable Purchases" value={inputs.vatablePurchases} />
              )}
              {inputs.rentalIncome > 0 && (
                <InputRow label="Rental Income" value={inputs.rentalIncome} />
              )}
              {inputs.consultancyIncome > 0 && (
                <InputRow label="Consultancy Income" value={inputs.consultancyIncome} />
              )}
              {inputs.dividendIncome > 0 && (
                <InputRow label="Dividend Income" value={inputs.dividendIncome} />
              )}
              {inputs.capitalGains > 0 && (
                <InputRow label="Capital Gains" value={inputs.capitalGains} />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 sm:flex-row animate-slide-up">
            <Button 
              variant="hero" 
              size="lg" 
              className="flex-1"
              onClick={exportToPDF}
            >
              <FileDown className="h-5 w-5" />
              Download PDF Report
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={exportToCSV}
            >
              <Download className="h-5 w-5" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/calculator', { state: { entityType: inputs.entityType } })}
            >
              Recalculate
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            This is an estimate for educational purposes. Consult a certified tax professional 
            for official advice. References: Nigeria Tax Act 2025, CAMA 2020.
          </p>
        </div>
      </main>
    </div>
  );
};

const InputRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{formatCurrency(value)}</span>
  </div>
);

export default Results;
