import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Building2, 
  Briefcase,
  HelpCircle,
  ArrowRight,
  Info,
  Sparkles
} from "lucide-react";
import { calculateTax, type TaxInputs } from "@/lib/taxCalculations";
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
    const numValue = value.replace(/[^0-9]/g, '');
    setInputs(prev => ({ ...prev, [field]: numValue }));
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
    <div className="min-h-screen flex flex-col overflow-x-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <div className="fixed inset-0 bg-dots opacity-15 pointer-events-none" />
      
      {/* Floating Orbs */}
      <div className="fixed top-32 right-20 w-64 h-64 rounded-full bg-primary/8 blur-3xl animate-float-slow pointer-events-none" />
      <div className="fixed bottom-20 left-10 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-float pointer-events-none" />

      <NavMenu />

      <main className="container mx-auto px-4 py-6 pb-8 flex-1 relative z-10">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4 text-accent animate-pulse-soft" />
              FIRS Compliant Calculator
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Tax Calculator
            </h1>
            <p className="text-muted-foreground">
              Calculate your Nigerian taxes accurately
            </p>
          </div>

          {/* Tax Rule Toggle - Neumorphic */}
          <div className="mb-6 glass-frosted rounded-2xl p-5 shadow-futuristic animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`rounded-xl p-3 transition-all duration-300 ${
                  use2026Rules 
                    ? 'bg-success/20 text-success glow-success' 
                    : 'bg-secondary text-secondary-foreground neumorphic-sm'
                }`}>
                  <Info className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
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
                className="data-[state=checked]:bg-success"
              />
            </div>
          </div>

          {/* Entity Type Selection - Glass Tabs */}
          <Tabs 
            value={entityType} 
            onValueChange={(v) => setEntityType(v as 'business_name' | 'company')}
            className="mb-6 animate-slide-up-delay-1"
          >
            <TabsList className="grid w-full grid-cols-2 h-auto p-1.5 glass-frosted rounded-2xl">
              <TabsTrigger 
                value="business_name"
                className="flex items-center gap-2 py-4 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Briefcase className="h-5 w-5" />
                <span className="font-semibold">Business Name</span>
              </TabsTrigger>
              <TabsTrigger 
                value="company"
                className="flex items-center gap-2 py-4 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Building2 className="h-5 w-5" />
                <span className="font-semibold">Company (LTD)</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Input Form - Glassmorphic Card */}
          <div className="glass-frosted rounded-3xl p-6 md:p-8 shadow-futuristic animate-slide-up-delay-2">
            <div className="space-y-8">
              {/* Primary Income */}
              <InputSection title="Primary Income" tooltip="Your main business revenue and expenses">
                <div className="grid gap-4 sm:grid-cols-2">
                  <NeumorphicInput
                    label="Annual Turnover"
                    value={inputs.turnover}
                    onChange={(v) => updateInput('turnover', v)}
                    tooltip="Total revenue/sales for the year"
                    required
                  />
                  <NeumorphicInput
                    label="Business Expenses"
                    value={inputs.expenses}
                    onChange={(v) => updateInput('expenses', v)}
                    tooltip="Deductible business costs"
                  />
                </div>
              </InputSection>

              {/* Company-specific fields */}
              {entityType === 'company' && (
                <InputSection title="Company Assets" tooltip="Required to determine small company status">
                  <NeumorphicInput
                    label="Fixed Assets Value"
                    value={inputs.fixedAssets}
                    onChange={(v) => updateInput('fixedAssets', v)}
                    tooltip="Total value of property, equipment, vehicles etc."
                  />
                </InputSection>
              )}

              {/* Rent (for Business Name PIT relief) */}
              {entityType === 'business_name' && use2026Rules && (
                <InputSection title="Rent Relief" tooltip="2026 rules allow relief for rent paid">
                  <NeumorphicInput
                    label="Annual Rent Paid"
                    value={inputs.rentPaid}
                    onChange={(v) => updateInput('rentPaid', v)}
                    tooltip="Relief: min(20% of rent, ₦500k)"
                  />
                </InputSection>
              )}

              {/* VAT */}
              <InputSection title="VAT (7.5%)" tooltip="Mandatory if turnover > ₦25m">
                <div className="grid gap-4 sm:grid-cols-2">
                  <NeumorphicInput
                    label="Vatable Sales"
                    value={inputs.vatableSales}
                    onChange={(v) => updateInput('vatableSales', v)}
                    tooltip="Sales subject to VAT"
                  />
                  <NeumorphicInput
                    label="Vatable Purchases"
                    value={inputs.vatablePurchases}
                    onChange={(v) => updateInput('vatablePurchases', v)}
                    tooltip="Purchases with recoverable VAT"
                  />
                </div>
              </InputSection>

              {/* Other Income */}
              <InputSection title="Other Income (Optional)" tooltip="Additional income sources">
                <div className="grid gap-4 sm:grid-cols-2">
                  <NeumorphicInput
                    label="Rental Income"
                    value={inputs.rentalIncome}
                    onChange={(v) => updateInput('rentalIncome', v)}
                    tooltip="10% WHT usually deducted at source"
                  />
                  <NeumorphicInput
                    label="Consultancy Income"
                    value={inputs.consultancyIncome}
                    onChange={(v) => updateInput('consultancyIncome', v)}
                    tooltip="10% WHT for companies, 5% for individuals"
                  />
                  <NeumorphicInput
                    label="Dividend Income"
                    value={inputs.dividendIncome}
                    onChange={(v) => updateInput('dividendIncome', v)}
                    tooltip="Franked dividends from Nigerian companies are tax-exempt"
                  />
                  <NeumorphicInput
                    label="Capital Gains"
                    value={inputs.capitalGains}
                    onChange={(v) => updateInput('capitalGains', v)}
                    tooltip="10% Capital Gains Tax applies"
                  />
                </div>
              </InputSection>
            </div>

            {/* Calculate Button */}
            <div className="mt-10">
              <Button 
                variant="glow" 
                size="xl" 
                className="w-full text-lg shadow-2xl"
                onClick={handleCalculate}
                disabled={!canCalculate}
              >
                <span>Calculate Tax</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
              {!canCalculate && (
                <p className="text-center text-sm text-muted-foreground mt-3">
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

const InputSection = ({
  title,
  tooltip,
  children,
}: {
  title: string;
  tooltip: string;
  children: React.ReactNode;
}) => (
  <div>
    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
      {title}
      <TooltipHelper content={tooltip} />
    </h3>
    {children}
  </div>
);

const NeumorphicInput = ({
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
      <Label className="flex items-center gap-1.5 mb-2.5 text-sm font-medium">
        {label}
        {required && <span className="text-destructive">*</span>}
        <TooltipHelper content={tooltip} />
      </Label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
          ₦
        </span>
        <Input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 h-12 rounded-xl neumorphic-inset border-0 bg-muted/30 focus:ring-2 focus:ring-primary/30 transition-all"
          placeholder="0"
        />
      </div>
    </div>
  );
};

const TooltipHelper = ({ content }: { content: string }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-5 w-5 text-muted-foreground hover:text-foreground rounded-full"
        aria-label="Help"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="max-w-xs p-3 glass-frosted" side="top">
      <p className="text-sm">{content}</p>
    </PopoverContent>
  </Popover>
);

export default CalculatorPage;
