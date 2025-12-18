import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Calculator as CalcIcon, 
  Building2, 
  Briefcase,
  HelpCircle,
  ArrowRight,
  Info
} from "lucide-react";
import { calculateTax, formatCurrency, type TaxInputs } from "@/lib/taxCalculations";
import { NavMenu } from "@/components/NavMenu";

const CalculatorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const preselectedEntity = location.state?.entityType;

  const [entityType, setEntityType] = useState<'business_name' | 'company'>(
    preselectedEntity || 'business_name'
  );
  const [use2026Rules, setUse2026Rules] = useState(false);
  
  const [inputs, setInputs] = useState({
    turnover: '',
    expenses: '',
    rentPaid: '',
    vatableSales: '',
    vatablePurchases: '',
    rentalIncome: '',
    consultancyIncome: '',
    dividendIncome: '',
    capitalGains: '',
    foreignIncome: '',
    fixedAssets: '',
  });

  const updateInput = (field: string, value: string) => {
    // Allow only numbers and format
    const numValue = value.replace(/[^0-9]/g, '');
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const formatInputDisplay = (value: string) => {
    if (!value) return '';
    return Number(value).toLocaleString('en-NG');
  };

  const handleCalculate = () => {
    const taxInputs: TaxInputs = {
      entityType,
      turnover: Number(inputs.turnover) || 0,
      expenses: Number(inputs.expenses) || 0,
      rentPaid: Number(inputs.rentPaid) || 0,
      vatableSales: Number(inputs.vatableSales) || 0,
      vatablePurchases: Number(inputs.vatablePurchases) || 0,
      rentalIncome: Number(inputs.rentalIncome) || 0,
      consultancyIncome: Number(inputs.consultancyIncome) || 0,
      dividendIncome: Number(inputs.dividendIncome) || 0,
      capitalGains: Number(inputs.capitalGains) || 0,
      foreignIncome: Number(inputs.foreignIncome) || 0,
      fixedAssets: Number(inputs.fixedAssets) || 0,
      use2026Rules,
    };

    const result = calculateTax(taxInputs);
    navigate('/results', { state: { result, inputs: taxInputs } });
  };

  const canCalculate = Number(inputs.turnover) > 0;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <NavMenu />

      <main className="container mx-auto px-4 py-8 pb-20">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-8 animate-slide-up">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tax Calculator
            </h1>
            <p className="text-muted-foreground">
              Calculate your Nigerian taxes accurately
            </p>
          </div>

          {/* Tax Rule Toggle */}
          <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-card animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${use2026Rules ? 'bg-success/10 text-success' : 'bg-secondary text-secondary-foreground'}`}>
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {use2026Rules ? 'Nigeria Tax Act 2025 Rules' : 'Current (Pre-2026) Rules'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {use2026Rules 
                      ? '0% CIT for small companies, new PIT bands' 
                      : '30% CIT, old reliefs and bands'}
                  </p>
                </div>
              </div>
              <Switch 
                checked={use2026Rules} 
                onCheckedChange={setUse2026Rules}
              />
            </div>
          </div>

          {/* Entity Type Selection */}
          <Tabs 
            value={entityType} 
            onValueChange={(v) => setEntityType(v as 'business_name' | 'company')}
            className="mb-6 animate-slide-up"
          >
            <TabsList className="grid w-full grid-cols-2 h-auto p-1">
              <TabsTrigger 
                value="business_name"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Briefcase className="h-4 w-4" />
                Business Name
              </TabsTrigger>
              <TabsTrigger 
                value="company"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Building2 className="h-4 w-4" />
                Company (LTD)
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Input Form */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card animate-slide-up">
            <div className="space-y-6">
              {/* Primary Income */}
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  Primary Income
                  <TooltipHelper content="Your main business revenue and expenses" />
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Annual Turnover"
                    value={inputs.turnover}
                    onChange={(v) => updateInput('turnover', v)}
                    tooltip="Total revenue/sales for the year"
                    required
                  />
                  <InputField
                    label="Business Expenses"
                    value={inputs.expenses}
                    onChange={(v) => updateInput('expenses', v)}
                    tooltip="Deductible business costs"
                  />
                </div>
              </div>

              {/* Company-specific fields */}
              {entityType === 'company' && (
                <div>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    Company Assets
                    <TooltipHelper content="Required to determine small company status" />
                  </h3>
                  <InputField
                    label="Fixed Assets Value"
                    value={inputs.fixedAssets}
                    onChange={(v) => updateInput('fixedAssets', v)}
                    tooltip="Total value of property, equipment, vehicles etc."
                  />
                </div>
              )}

              {/* Rent (for Business Name PIT relief) */}
              {entityType === 'business_name' && use2026Rules && (
                <div>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    Rent Relief
                    <TooltipHelper content="2026 rules allow relief for rent paid" />
                  </h3>
                  <InputField
                    label="Annual Rent Paid"
                    value={inputs.rentPaid}
                    onChange={(v) => updateInput('rentPaid', v)}
                    tooltip="Relief: min(20% of rent, ₦500k)"
                  />
                </div>
              )}

              {/* VAT */}
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  VAT (7.5%)
                  <TooltipHelper content="Mandatory if turnover > ₦25m" />
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Vatable Sales"
                    value={inputs.vatableSales}
                    onChange={(v) => updateInput('vatableSales', v)}
                    tooltip="Sales subject to VAT"
                  />
                  <InputField
                    label="Vatable Purchases"
                    value={inputs.vatablePurchases}
                    onChange={(v) => updateInput('vatablePurchases', v)}
                    tooltip="Purchases with recoverable VAT"
                  />
                </div>
              </div>

              {/* Other Income */}
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  Other Income (Optional)
                  <TooltipHelper content="Additional income sources" />
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Rental Income"
                    value={inputs.rentalIncome}
                    onChange={(v) => updateInput('rentalIncome', v)}
                    tooltip="10% WHT usually deducted at source"
                  />
                  <InputField
                    label="Consultancy Income"
                    value={inputs.consultancyIncome}
                    onChange={(v) => updateInput('consultancyIncome', v)}
                    tooltip="10% WHT for companies, 5% for individuals"
                  />
                  <InputField
                    label="Dividend Income"
                    value={inputs.dividendIncome}
                    onChange={(v) => updateInput('dividendIncome', v)}
                    tooltip="Franked dividends from Nigerian companies are tax-exempt"
                  />
                  <InputField
                    label="Capital Gains"
                    value={inputs.capitalGains}
                    onChange={(v) => updateInput('capitalGains', v)}
                    tooltip="10% Capital Gains Tax applies"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button 
                variant="hero" 
                size="xl" 
                className="w-full"
                onClick={handleCalculate}
                disabled={!canCalculate}
              >
                Calculate Tax
                <ArrowRight className="h-5 w-5" />
              </Button>
              {!canCalculate && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Enter your annual turnover to calculate
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const InputField = ({
  label,
  value,
  onChange,
  tooltip,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  tooltip: string;
  required?: boolean;
}) => {
  const displayValue = value ? Number(value).toLocaleString('en-NG') : '';

  return (
    <div>
      <Label className="flex items-center gap-1 mb-2 text-sm">
        {label}
        {required && <span className="text-destructive">*</span>}
        <TooltipHelper content={tooltip} />
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          ₦
        </span>
        <Input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          className="pl-7"
          placeholder="0"
        />
      </div>
    </div>
  );
};

const TooltipHelper = ({ content }: { content: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-foreground"
        aria-label="Help"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs">
      <p className="text-sm">{content}</p>
    </TooltipContent>
  </Tooltip>
);

export default CalculatorPage;
