import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();
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
            <h1 className="text-2xl font-bold text-foreground mb-4">{t('results.noResults')}</h1>
            <p className="text-muted-foreground mb-6">{t('results.useCalculatorFirst')}</p>
            <Link to="/calculator">
              <Button variant="hero">{t('results.goToCalculator')}</Button>
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
      toast.error("Upgrade to Basic or higher to save businesses", {
        action: { label: 'Upgrade', onClick: () => navigate('/pricing') }
      });
      return;
    }

    if (!canSaveBusiness()) {
      toast.error("You've reached your business limit", {
        action: { label: 'Upgrade', onClick: () => navigate('/pricing') }
      });
      return;
    }

    const success = addBusiness({
      name: businessName.trim(),
      entityType: inputs.entityType,
      turnover: inputs.turnover,
    });

    if (success) {
      toast.success(`"${businessName}" saved successfully!`, {
        action: { label: 'View', onClick: () => navigate('/businesses') }
      });
      setShowSaveDialog(false);
      setBusinessName("");
    } else {
      toast.error("Failed to save business");
    }
  };

  const exportToCSV = () => {
    if (!canExport()) {
      toast.error('Upgrade to Basic or higher to export CSV', {
        action: { label: 'Upgrade', onClick: () => navigate('/pricing') }
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
            {t('results.backToCalculator')}
          </Button>

          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
              <FileText className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('results.title')}
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
              <span>{inputs.use2026Rules ? t('results.rules2026') : t('results.rulesPre2026')}</span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Link to="/tax-breakdown" state={{ result, inputs }}>
              <Button variant="hero">
                <ListOrdered className="h-4 w-4" />
                {t('results.viewBreakdown')}
              </Button>
            </Link>
            <Button
              variant={showComparison ? "hero" : "outline"}
              onClick={() => setShowComparison(!showComparison)}
            >
              <BarChart3 className="h-4 w-4" />
              {showComparison ? t('results.hideComparison') : t('results.showComparison')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(true)}
              disabled={tier === 'free'}
            >
              <Save className="h-4 w-4" />
              {t('results.saveBusiness')}
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
                {t('results.entityComparisonDashboard')}
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
                    ? `✓ ${t('results.optimalStructure')}` 
                    : `💡 ${t('results.switchingSaves').replace('{entity}', betterOption === 'company' ? t('results.limitedCompany') : t('results.businessName')).replace('{amount}', formatCurrency(Math.abs(savings)))}`
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
                    <h4 className="font-semibold text-foreground">{t('results.businessName')}</h4>
                    {inputs.entityType === 'business_name' && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{t('results.current')}</span>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('results.taxPayable')}</span>
                      <span className="font-semibold text-foreground">{formatCurrency(businessResult.totalTaxPayable)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('results.effectiveRate')}</span>
                      <span className="font-medium text-foreground">{businessResult.effectiveRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('results.incomeTax')}</span>
                      <span className="text-foreground">{formatCurrency(businessResult.incomeTax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('results.vat')}</span>
                      <span className="text-foreground">{formatCurrency(businessResult.vatPayable)}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {t('results.pitDescription')}
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
                    <h4 className="font-semibold text-foreground">{t('results.limitedCompany')}</h4>
                    {inputs.entityType === 'company' && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{t('results.current')}</span>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('results.taxPayable')}</span>
                      <span className="font-semibold text-foreground">{formatCurrency(companyResult.totalTaxPayable)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('results.effectiveRate')}</span>
                      <span className="font-medium text-foreground">{companyResult.effectiveRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('results.cit')}</span>
                      <span className="text-foreground">{formatCurrency(companyResult.incomeTax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('results.devLevy')}</span>
                      <span className="text-foreground">{formatCurrency(companyResult.developmentLevy)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('results.vat')}</span>
                      <span className="text-foreground">{formatCurrency(companyResult.vatPayable)}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {companyResult.isSmallCompany 
                        ? t('results.smallCompanyCIT')
                        : t('results.citDescription')
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

          {/* Sector Tax Rules Applied */}
          {result.sectorRules && result.sectorId && (
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6 shadow-card mb-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Sector Tax Rules Applied</h3>
                  <p className="text-sm text-muted-foreground capitalize">{result.sectorId.replace(/_/g, ' ')} Sector</p>
                </div>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {/* CIT Rate */}
                {result.sectorRules.citRate !== undefined && (
                  <div className="flex items-start gap-3 rounded-xl bg-card/60 p-4 border border-border/50">
                    <Percent className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">CIT Rate</p>
                      <p className="text-lg font-semibold text-primary">{result.sectorRules.citRate}%</p>
                      {result.sectorRules.citRate === 0 && (
                        <p className="text-xs text-success">Tax exempt</p>
                      )}
                    </div>
                  </div>
                )}

                {/* VAT Status */}
                {result.sectorRules.vatStatus && (
                  <div className="flex items-start gap-3 rounded-xl bg-card/60 p-4 border border-border/50">
                    <Receipt className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">VAT Status</p>
                      <p className={`text-sm font-semibold ${result.sectorRules.vatStatus === 'exempt' ? 'text-success' : 'text-foreground'}`}>
                        {result.sectorRules.vatStatus === 'exempt' ? 'VAT Exempt' : 
                         result.sectorRules.vatStatus === 'zero' ? 'Zero-Rated' :
                         result.sectorRules.vatStatus === 'reduced' ? `Reduced (${result.sectorRules.vatRate || 0}%)` : 'Standard VAT'}
                      </p>
                    </div>
                  </div>
                )}

                {/* WHT Rate */}
                {result.sectorRules.whtRate !== undefined && result.sectorRules.whtRate > 0 && (
                  <div className="flex items-start gap-3 rounded-xl bg-card/60 p-4 border border-border/50">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">WHT Rate</p>
                      <p className="text-sm font-semibold text-success">{result.sectorRules.whtRate}% withholding</p>
                    </div>
                  </div>
                )}

                {/* EDTI Rate */}
                {result.sectorRules.edtiRate !== undefined && result.sectorRules.edtiRate > 0 && (
                  <div className="flex items-start gap-3 rounded-xl bg-card/60 p-4 border border-border/50">
                    <Leaf className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">EDTI Credit</p>
                      <p className="text-sm font-semibold text-success">{result.sectorRules.edtiRate}% export credit</p>
                    </div>
                  </div>
                )}

                {/* Hydrocarbon Tax */}
                {(result.sectorRules.hydrocarbonTaxMin || result.sectorRules.hydrocarbonTaxMax) && (
                  <div className="flex items-start gap-3 rounded-xl bg-card/60 p-4 border border-border/50">
                    <Fuel className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Hydrocarbon Tax</p>
                      <p className="text-sm font-semibold text-warning">
                        {result.sectorRules.hydrocarbonTaxMin}% - {result.sectorRules.hydrocarbonTaxMax}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Presumptive Tax */}
                {(result.sectorRules.presumptiveMin || result.sectorRules.presumptiveMax) && (
                  <div className="flex items-start gap-3 rounded-xl bg-card/60 p-4 border border-border/50">
                    <Calculator className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Presumptive Tax</p>
                      <p className="text-sm font-semibold text-foreground">
                        {result.sectorRules.presumptiveMin}% - {result.sectorRules.presumptiveMax}% of turnover
                      </p>
                    </div>
                  </div>
                )}

                {/* Pioneer Status */}
                {result.sectorRules.pioneerStatus && (
                  <div className="flex items-start gap-3 rounded-xl bg-card/60 p-4 border border-border/50">
                    <Crown className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Pioneer Status</p>
                      <p className="text-sm font-semibold text-success">Tax holiday eligible</p>
                    </div>
                  </div>
                )}

                {/* Green Hire Deduction */}
                {result.sectorRules.greenHireDeduction !== undefined && result.sectorRules.greenHireDeduction > 0 && (
                  <div className="flex items-start gap-3 rounded-xl bg-card/60 p-4 border border-border/50">
                    <Leaf className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Green Hire Deduction</p>
                      <p className="text-sm font-semibold text-success">{result.sectorRules.greenHireDeduction}% extra deduction</p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                <Info className="h-3 w-3" />
                These sector-specific rules have been applied to your tax calculation
              </p>
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

          {/* Disclaimer */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            This is an estimate for educational purposes. Consult a certified tax professional 
            for official advice. References: Nigeria Tax Act 2025, CAMA 2020.
          </p>
        </div>
      </main>

      {/* Save Business Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" />
              Save Business Profile
            </DialogTitle>
            <DialogDescription>
              Save this calculation to your dashboard for future reference and CAC verification.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Business Name
            </label>
            <Input
              placeholder="e.g., My Trading Company Ltd"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
            <div className="mt-4 p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-2">Will save:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Entity:</span>{' '}
                  <span className="font-medium text-foreground">
                    {inputs.entityType === 'company' ? 'Limited Company' : 'Business Name'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Turnover:</span>{' '}
                  <span className="font-medium text-foreground">{formatCurrency(inputs.turnover)}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBusiness} disabled={!businessName.trim()}>
              <Save className="h-4 w-4" />
              Save Business
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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