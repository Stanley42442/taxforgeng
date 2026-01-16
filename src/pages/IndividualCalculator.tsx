import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/PageLayout";
import { 
  User, 
  Briefcase,
  HelpCircle,
  ArrowRight,
  Info,
  Sparkles,
  Bitcoin,
  TrendingUp,
  Store,
  Globe,
  Calculator,
  CheckCircle,
  AlertCircle,
  Wallet,
  RefreshCw
} from "lucide-react";
import { ForeignIncomeCalculator } from "@/components/ForeignIncomeCalculator";
import { calculateIndividualTax, formatCurrency, type IndividualTaxInputs } from "@/lib/individualTaxCalculations";
import { PRESUMPTIVE_TAX_RATES } from "@/lib/sectorConfig";
import { usePersonalExpenses } from "@/hooks/usePersonalExpenses";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type CalculationType = 'pit' | 'crypto' | 'investment' | 'informal' | 'foreign_income';

const InputField = ({
  label,
  value,
  onChange,
  tooltip,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  tooltip?: string;
  required?: boolean;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {tooltip && (
        <Popover>
          <PopoverTrigger>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent side="top" className="text-sm max-w-xs">
            {tooltip}
          </PopoverContent>
        </Popover>
      )}
    </div>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₦</span>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 bg-background"
        placeholder="0"
      />
    </div>
  </div>
);

const IndividualCalculatorPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  
  const [use2026Rules, setUse2026Rules] = useState(true);
  const [calculationType, setCalculationType] = useState<CalculationType>('pit');
  const [loadFromExpenses, setLoadFromExpenses] = useState(false);
  
  // Personal expenses data
  const { annualTotals, loading: expensesLoading, refetch } = usePersonalExpenses(currentYear);
  
  // PIT inputs
  const [employmentIncome, setEmploymentIncome] = useState('');
  const [pensionContribution, setPensionContribution] = useState('');
  const [nhfContribution, setNhfContribution] = useState('');
  const [lifeInsurance, setLifeInsurance] = useState('');
  const [healthInsurance, setHealthInsurance] = useState('');
  const [rentPaid, setRentPaid] = useState('');
  
  // Crypto inputs
  const [cryptoIncome, setCryptoIncome] = useState('');
  const [cryptoGains, setCryptoGains] = useState('');
  const [cryptoLosses, setCryptoLosses] = useState('');
  
  // Investment inputs
  const [dividendIncome, setDividendIncome] = useState('');
  const [interestIncome, setInterestIncome] = useState('');
  const [capitalGains, setCapitalGains] = useState('');
  
  // Informal inputs
  const [estimatedTurnover, setEstimatedTurnover] = useState('');
  const [location, setLocation] = useState('other_urban');

  const [result, setResult] = useState<ReturnType<typeof calculateIndividualTax> | null>(null);

  // Auto-populate from personal expenses when toggled on
  useEffect(() => {
    if (loadFromExpenses && annualTotals) {
      setPensionContribution(annualTotals.pension_contribution > 0 ? annualTotals.pension_contribution.toLocaleString('en-NG') : '');
      setNhfContribution(annualTotals.nhf_contribution > 0 ? annualTotals.nhf_contribution.toLocaleString('en-NG') : '');
      setLifeInsurance(annualTotals.life_insurance > 0 ? annualTotals.life_insurance.toLocaleString('en-NG') : '');
      setHealthInsurance(annualTotals.health_insurance > 0 ? annualTotals.health_insurance.toLocaleString('en-NG') : '');
      setRentPaid(annualTotals.rent > 0 ? annualTotals.rent.toLocaleString('en-NG') : '');
      toast.success('Fields populated from personal expenses');
    }
  }, [loadFromExpenses, annualTotals]);

  const handleToggleLoadExpenses = (checked: boolean) => {
    if (checked && !user) {
      toast.error('Please log in to load personal expenses');
      return;
    }
    setLoadFromExpenses(checked);
    if (!checked) {
      // Clear auto-populated fields
      setPensionContribution('');
      setNhfContribution('');
      setLifeInsurance('');
      setHealthInsurance('');
      setRentPaid('');
    }
  };

  const parseNumber = (value: string) => Number(value.replace(/[^0-9]/g, '')) || 0;
  const formatInput = (value: string) => {
    const num = parseNumber(value);
    return num ? num.toLocaleString('en-NG') : '';
  };

  const handleCalculate = () => {
    const inputs: IndividualTaxInputs = {
      calculationType,
      use2026Rules,
      employmentIncome: parseNumber(employmentIncome),
      pensionContribution: parseNumber(pensionContribution),
      nhfContribution: parseNumber(nhfContribution),
      lifeInsurancePremium: parseNumber(lifeInsurance),
      cryptoIncome: parseNumber(cryptoIncome),
      cryptoGains: parseNumber(cryptoGains),
      cryptoLosses: parseNumber(cryptoLosses),
      dividendIncome: parseNumber(dividendIncome),
      interestIncome: parseNumber(interestIncome),
      capitalGains: parseNumber(capitalGains),
      estimatedTurnover: parseNumber(estimatedTurnover),
      location,
    };

    const calcResult = calculateIndividualTax(inputs);
    setResult(calcResult);
    toast.success('Calculation complete');
  };

  const canCalculate = () => {
    switch (calculationType) {
      case 'pit':
        return parseNumber(employmentIncome) > 0;
      case 'crypto':
        return parseNumber(cryptoIncome) > 0 || parseNumber(cryptoGains) > 0;
      case 'investment':
        return parseNumber(dividendIncome) > 0 || parseNumber(interestIncome) > 0 || parseNumber(capitalGains) > 0;
      case 'informal':
        return parseNumber(estimatedTurnover) > 0;
      case 'foreign_income':
        return true;
      default:
        return false;
    }
  };

  return (
    <PageLayout 
      title="Individual Tax Calculator" 
      icon={User}
      description="Calculate your personal income tax under Nigerian tax law"
      maxWidth="4xl"
    >
      {/* Tax Rule Toggle */}
      <div className="mb-6 glass-frosted rounded-2xl p-5 shadow-futuristic animate-slide-up">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className={`rounded-xl p-3 flex-shrink-0 transition-all duration-300 ${
              use2026Rules 
                ? 'bg-success/20 text-success glow-success' 
                : 'bg-secondary text-secondary-foreground neumorphic-sm'
            }`}>
              <Info className="h-6 w-6" />
            </div>
            <div className="min-w-0 mr-3">
              <p className="font-semibold text-foreground">
                {use2026Rules ? 'Nigeria Tax Act 2026' : 'Current Tax Rules'}
              </p>
              <p className="text-sm text-muted-foreground">
                {use2026Rules 
                  ? '₦800k exemption, 0-25% progressive rates' 
                  : '₦300k start, 7-24% progressive rates'}
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

      {/* Calculator Type Selection */}
      <Tabs 
        value={calculationType} 
        onValueChange={(v) => {
          setCalculationType(v as CalculationType);
          setResult(null);
        }}
        className="mb-6 animate-slide-up"
      >
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 h-auto p-1.5 glass-frosted rounded-2xl">
          <TabsTrigger 
            value="pit"
            className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300"
          >
            <Briefcase className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">Employment</span>
            <span className="text-sm font-medium sm:hidden">PIT</span>
          </TabsTrigger>
          <TabsTrigger 
            value="foreign_income"
            className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300"
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">Foreign</span>
          </TabsTrigger>
          <TabsTrigger 
            value="crypto"
            className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300"
          >
            <Bitcoin className="h-4 w-4" />
            <span className="text-sm font-medium">Crypto</span>
          </TabsTrigger>
          <TabsTrigger 
            value="investment"
            className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">Investment</span>
            <span className="text-sm font-medium sm:hidden">Invest</span>
          </TabsTrigger>
          <TabsTrigger 
            value="informal"
            className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300"
          >
            <Store className="h-4 w-4" />
            <span className="text-sm font-medium">Informal</span>
          </TabsTrigger>
        </TabsList>

        {/* PIT Calculator */}
        <TabsContent value="pit" className="mt-6 space-y-4">
          {/* Load from Personal Expenses Toggle */}
          <Card className="glass-frosted border-0 shadow-sm">
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2.5 transition-all duration-300 ${
                    loadFromExpenses 
                      ? 'bg-accent/20 text-accent' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Load from Personal Expenses</p>
                    <p className="text-xs text-muted-foreground">
                      Auto-populate relief fields from tracked expenses
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {loadFromExpenses && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => refetch()}
                      disabled={expensesLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${expensesLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                  <Switch 
                    checked={loadFromExpenses} 
                    onCheckedChange={handleToggleLoadExpenses}
                    disabled={expensesLoading}
                  />
                </div>
              </div>
              {loadFromExpenses && annualTotals && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex flex-wrap gap-2">
                    {annualTotals.rent > 0 && (
                      <Badge variant="outline" className="text-xs">Rent: ₦{annualTotals.rent.toLocaleString()}</Badge>
                    )}
                    {annualTotals.pension_contribution > 0 && (
                      <Badge variant="outline" className="text-xs">Pension: ₦{annualTotals.pension_contribution.toLocaleString()}</Badge>
                    )}
                    {annualTotals.nhf_contribution > 0 && (
                      <Badge variant="outline" className="text-xs">NHF: ₦{annualTotals.nhf_contribution.toLocaleString()}</Badge>
                    )}
                    {annualTotals.health_insurance > 0 && (
                      <Badge variant="outline" className="text-xs">Health Ins: ₦{annualTotals.health_insurance.toLocaleString()}</Badge>
                    )}
                    {annualTotals.life_insurance > 0 && (
                      <Badge variant="outline" className="text-xs">Life Ins: ₦{annualTotals.life_insurance.toLocaleString()}</Badge>
                    )}
                  </div>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="mt-2 h-auto p-0 text-xs"
                    onClick={() => navigate('/personal-expenses')}
                  >
                    Manage Personal Expenses →
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-frosted border-0 shadow-futuristic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Employment Income Tax
              </CardTitle>
              <CardDescription>
                Calculate PAYE and personal income tax
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Annual Gross Income"
                  value={formatInput(employmentIncome)}
                  onChange={(v) => setEmploymentIncome(v)}
                  tooltip="Your total annual salary before any deductions"
                  required
                />
                <InputField
                  label="Rent Paid"
                  value={formatInput(rentPaid)}
                  onChange={(v) => !loadFromExpenses && setRentPaid(v)}
                  tooltip="Annual rent paid on accommodation"
                />
                <InputField
                  label="Pension Contribution"
                  value={formatInput(pensionContribution)}
                  onChange={(v) => !loadFromExpenses && setPensionContribution(v)}
                  tooltip="Employee pension contribution (typically 8% of basic)"
                />
                <InputField
                  label="NHF Contribution"
                  value={formatInput(nhfContribution)}
                  onChange={(v) => !loadFromExpenses && setNhfContribution(v)}
                  tooltip="National Housing Fund contribution (2.5% of basic)"
                />
                <InputField
                  label="Health Insurance"
                  value={formatInput(healthInsurance)}
                  onChange={(v) => !loadFromExpenses && setHealthInsurance(v)}
                  tooltip="Annual health insurance premium"
                />
                <InputField
                  label="Life Insurance Premium"
                  value={formatInput(lifeInsurance)}
                  onChange={(v) => !loadFromExpenses && setLifeInsurance(v)}
                  tooltip="Annual life insurance premium payments"
                />
              </div>
              
              {use2026Rules && (
                <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium text-sm">2026 Benefits Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    First ₦800,000 exempt, lower progressive rates apply
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Foreign Income Calculator */}
        <TabsContent value="foreign_income" className="mt-6">
          <ForeignIncomeCalculator />
        </TabsContent>

        {/* Crypto Calculator */}
        <TabsContent value="crypto" className="mt-6">
          <Card className="glass-frosted border-0 shadow-futuristic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bitcoin className="h-5 w-5 text-primary" />
                Cryptocurrency Tax
              </CardTitle>
              <CardDescription>
                Calculate tax on crypto trading and income
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Crypto Income"
                  value={formatInput(cryptoIncome)}
                  onChange={(v) => setCryptoIncome(v)}
                  tooltip="Income received in cryptocurrency (converted to NGN)"
                />
                <InputField
                  label="Capital Gains (Trading)"
                  value={formatInput(cryptoGains)}
                  onChange={(v) => setCryptoGains(v)}
                  tooltip="Profit from selling cryptocurrency"
                />
                <InputField
                  label="Capital Losses"
                  value={formatInput(cryptoLosses)}
                  onChange={(v) => setCryptoLosses(v)}
                  tooltip="Losses from cryptocurrency trading"
                />
              </div>
              
              {use2026Rules && (
                <div className="p-4 rounded-xl bg-info/10 border border-info/20">
                  <div className="flex items-center gap-2 text-info">
                    <Info className="h-4 w-4" />
                    <span className="font-medium text-sm">2026 Crypto Rules</span>
                  </div>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Crypto income taxed as regular income</li>
                    <li>• Capital gains taxed at 10%</li>
                    <li>• Losses can offset gains in same year</li>
                    <li>• Records must be kept for 6 years</li>
                    <li>• Staking rewards treated as income</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investment Calculator */}
        <TabsContent value="investment" className="mt-6">
          <Card className="glass-frosted border-0 shadow-futuristic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Investment Income Tax
              </CardTitle>
              <CardDescription>
                Tax on dividends, interest, and capital gains
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Dividend Income"
                  value={formatInput(dividendIncome)}
                  onChange={(v) => setDividendIncome(v)}
                  tooltip="Income from stock dividends"
                />
                <InputField
                  label="Interest Income"
                  value={formatInput(interestIncome)}
                  onChange={(v) => setInterestIncome(v)}
                  tooltip="Income from savings and fixed deposits"
                />
                <InputField
                  label="Capital Gains"
                  value={formatInput(capitalGains)}
                  onChange={(v) => setCapitalGains(v)}
                  tooltip="Profit from selling assets"
                />
              </div>
              
              <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium text-sm">Tax-Efficient Investments</span>
                </div>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Nigerian company dividends are tax-exempt</li>
                  <li>• Government bonds interest is tax-exempt</li>
                  <li>• REITs distributions enjoy preferential rates</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Informal Calculator */}
        <TabsContent value="informal" className="mt-6">
          <Card className="glass-frosted border-0 shadow-futuristic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Informal Sector Tax
              </CardTitle>
              <CardDescription>
                Presumptive tax for small traders and informal businesses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Estimated Annual Turnover"
                  value={formatInput(estimatedTurnover)}
                  onChange={(v) => setEstimatedTurnover(v)}
                  tooltip="Your estimated annual sales"
                  required
                />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lagos">Lagos</SelectItem>
                      <SelectItem value="abuja">Abuja (FCT)</SelectItem>
                      <SelectItem value="port_harcourt">Port Harcourt</SelectItem>
                      <SelectItem value="other_urban">Other Urban</SelectItem>
                      <SelectItem value="rural">Rural Area</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                <div className="flex items-center gap-2 text-warning">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium text-sm">Presumptive Tax Notice</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Presumptive tax is a simplified flat-rate tax for informal businesses based on turnover and location.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Calculate Button */}
      {calculationType !== 'foreign_income' && (
        <div className="text-center mb-8 animate-slide-up">
          <Button 
            variant="hero" 
            size="lg" 
            onClick={handleCalculate}
            disabled={!canCalculate()}
            className="min-w-[200px]"
          >
            <Calculator className="h-5 w-5" />
            Calculate Tax
          </Button>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <Card className="glass-frosted border-0 shadow-futuristic animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Calculation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Summary */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Total Tax Payable</p>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(result.taxPayable)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary">
                    <p className="text-xs text-muted-foreground">Taxable Income</p>
                    <p className="text-lg font-semibold">{formatCurrency(result.taxableIncome)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary">
                    <p className="text-xs text-muted-foreground">Effective Rate</p>
                    <p className="text-lg font-semibold">{result.effectiveRate.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
              
              {/* Breakdown */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Tax Breakdown</h4>
                {result.breakdown.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
};

export default IndividualCalculatorPage;