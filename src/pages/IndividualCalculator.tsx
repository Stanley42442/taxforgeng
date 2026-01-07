import { useState } from "react";
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
import { useLanguage } from "@/contexts/LanguageContext";
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
  AlertCircle
} from "lucide-react";
import { NavMenu } from "@/components/NavMenu";
import { ForeignIncomeCalculator } from "@/components/ForeignIncomeCalculator";
import { calculateIndividualTax, formatCurrency, type IndividualTaxInputs } from "@/lib/individualTaxCalculations";
import { PRESUMPTIVE_TAX_RATES } from "@/lib/sectorConfig";
import { toast } from "sonner";

type CalculationType = 'pit' | 'crypto' | 'investment' | 'informal' | 'foreign_income';

const IndividualCalculatorPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [use2026Rules, setUse2026Rules] = useState(true);
  const [calculationType, setCalculationType] = useState<CalculationType>('pit');
  
  // PIT inputs
  const [employmentIncome, setEmploymentIncome] = useState('');
  const [pensionContribution, setPensionContribution] = useState('');
  const [nhfContribution, setNhfContribution] = useState('');
  const [lifeInsurance, setLifeInsurance] = useState('');
  
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
        return true; // ForeignIncomeCalculator handles its own calculation
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <div className="fixed inset-0 bg-dots opacity-15 pointer-events-none" />
      
      {/* Floating Orbs */}
      <div className="fixed top-32 right-20 w-64 h-64 rounded-full bg-accent/8 blur-3xl animate-float-slow pointer-events-none" />
      <div className="fixed bottom-20 left-10 w-48 h-48 rounded-full bg-primary/10 blur-3xl animate-float pointer-events-none" />

      <NavMenu />

      <main className="container mx-auto px-4 py-6 pb-8 flex-1 relative z-10">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-4">
              <User className="h-4 w-4 text-accent animate-pulse-soft" />
              Individual Tax Calculator
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Personal Tax Calculator
            </h1>
            <p className="text-muted-foreground">
              Calculate your personal taxes without a registered business
            </p>
          </div>

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
                    {use2026Rules ? 'Nigeria Tax Act 2025 Rules' : 'Current (Pre-2026) Rules'}
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
            className="mb-6 animate-slide-up-delay-1"
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
            <TabsContent value="pit" className="mt-6">
              <Card className="glass-frosted border-0 shadow-futuristic">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Employment Income Tax
                  </CardTitle>
                  <CardDescription>
                    Calculate PAYE for salaried employees
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="Annual Gross Income"
                      value={formatInput(employmentIncome)}
                      onChange={(v) => setEmploymentIncome(v)}
                      tooltip="Total annual salary including allowances"
                      required
                    />
                    <InputField
                      label="Pension Contribution"
                      value={formatInput(pensionContribution)}
                      onChange={(v) => setPensionContribution(v)}
                      tooltip="8% employee contribution to RSA"
                    />
                    <InputField
                      label="NHF Contribution"
                      value={formatInput(nhfContribution)}
                      onChange={(v) => setNhfContribution(v)}
                      tooltip="2.5% National Housing Fund"
                    />
                    <InputField
                      label="Life Insurance Premium"
                      value={formatInput(lifeInsurance)}
                      onChange={(v) => setLifeInsurance(v)}
                      tooltip="Premium on policy for own life"
                    />
                  </div>
                  
                  {use2026Rules && (
                    <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium text-sm">2026 Benefits Active</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        First ₦800,000 is tax-exempt. Consolidated Relief Allowance applies.
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
                    Calculate tax on crypto income and capital gains
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="Crypto Income (Mining, Staking)"
                      value={formatInput(cryptoIncome)}
                      onChange={(v) => setCryptoIncome(v)}
                      tooltip="Income from mining, staking, airdrops"
                    />
                    <InputField
                      label="Capital Gains from Trading"
                      value={formatInput(cryptoGains)}
                      onChange={(v) => setCryptoGains(v)}
                      tooltip="Profits from buying/selling crypto"
                    />
                    <InputField
                      label="Capital Losses"
                      value={formatInput(cryptoLosses)}
                      onChange={(v) => setCryptoLosses(v)}
                      tooltip="Losses can offset gains"
                    />
                  </div>
                  
                  {use2026Rules && (
                    <div className="p-4 rounded-xl bg-info/10 border border-info/20">
                      <div className="flex items-center gap-2 text-info">
                        <Info className="h-4 w-4" />
                        <span className="font-medium text-sm">2026 Crypto Rules</span>
                      </div>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• Gains under ₦10M: Exempt from CGT</li>
                        <li>• ₦10M - ₦50M: 10% CGT</li>
                        <li>• ₦50M - ₦150M: 15% CGT</li>
                        <li>• Above ₦150M: 25% CGT</li>
                        <li>• Losses carry forward for 4 years</li>
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
                    Calculate tax on dividends, interest, and capital gains
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="Dividend Income"
                      value={formatInput(dividendIncome)}
                      onChange={(v) => setDividendIncome(v)}
                      tooltip="Dividends from Nigerian companies (often exempt)"
                    />
                    <InputField
                      label="Interest Income"
                      value={formatInput(interestIncome)}
                      onChange={(v) => setInterestIncome(v)}
                      tooltip="Bank interest, bonds, fixed deposits"
                    />
                    <InputField
                      label="Capital Gains"
                      value={formatInput(capitalGains)}
                      onChange={(v) => setCapitalGains(v)}
                      tooltip="Gains from selling assets, shares, property"
                    />
                  </div>
                  
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium text-sm">Tax-Efficient Investments</span>
                    </div>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• Franked dividends from Nigerian companies: Exempt</li>
                      <li>• FGN Bonds interest: Exempt</li>
                      <li>• Treasury Bills: 10% WHT (final)</li>
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
                    Informal Business Tax
                  </CardTitle>
                  <CardDescription>
                    Presumptive tax for unregistered traders and micro-enterprises
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="Estimated Annual Turnover"
                      value={formatInput(estimatedTurnover)}
                      onChange={(v) => setEstimatedTurnover(v)}
                      tooltip="Approximate total sales for the year"
                      required
                    />
                    <div>
                      <Label className="flex items-center gap-1.5 mb-2.5 text-sm font-medium">
                        Business Location
                        <TooltipHelper content="Location affects presumptive tax rates" />
                      </Label>
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger className="h-14 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PRESUMPTIVE_TAX_RATES).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - {value.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                    <div className="flex items-center gap-2 text-warning">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium text-sm">Formalization Benefits</span>
                    </div>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• Access to bank loans and credit</li>
                      <li>• Government contracts eligibility</li>
                      <li>• Better tax planning options</li>
                      <li>• CAC registration from ₦10,000</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Calculate Button */}
          <div className="mb-8">
            <Button 
              variant="glow" 
              size="xl" 
              className="w-full text-lg shadow-2xl"
              onClick={handleCalculate}
              disabled={!canCalculate()}
            >
              <Calculator className="h-5 w-5 mr-2" />
              Calculate Tax
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          {/* Results Section */}
          {result && (
            <div className="animate-slide-up space-y-6">
              {/* Summary Card */}
              <Card className="glass-frosted border-0 shadow-futuristic overflow-hidden">
                <div className="bg-gradient-primary p-6 text-primary-foreground">
                  <div className="text-center">
                    <p className="text-sm opacity-80 mb-1">Total Tax Payable</p>
                    <p className="text-4xl font-bold">{formatCurrency(result.taxPayable)}</p>
                    <p className="text-sm opacity-80 mt-2">
                      Effective Rate: {result.effectiveRate.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <CardContent className="p-6">
                  {/* Reliefs */}
                  {result.reliefs.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        Tax Reliefs Applied
                      </h4>
                      <div className="space-y-2">
                        {result.reliefs.map((relief, i) => (
                          <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-success/10">
                            <div>
                              <p className="font-medium text-sm">{relief.name}</p>
                              <p className="text-xs text-muted-foreground">{relief.description}</p>
                            </div>
                            <Badge variant="secondary" className="bg-success/20 text-success">
                              -{formatCurrency(relief.amount)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Breakdown */}
                  {result.breakdown.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Tax Breakdown</h4>
                      <div className="space-y-2">
                        {result.breakdown.map((item, i) => (
                          <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                            <div>
                              <p className="font-medium text-sm">{item.label}</p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              )}
                            </div>
                            <span className="font-semibold">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alerts */}
                  {result.alerts.length > 0 && (
                    <div className="space-y-2">
                      {result.alerts.map((alert, i) => (
                        <div 
                          key={i} 
                          className={`flex items-start gap-2 p-3 rounded-lg ${
                            alert.type === 'success' ? 'bg-success/10 text-success' :
                            alert.type === 'warning' ? 'bg-warning/10 text-warning' :
                            'bg-info/10 text-info'
                          }`}
                        >
                          {alert.type === 'success' ? <CheckCircle className="h-4 w-4 mt-0.5" /> :
                           alert.type === 'warning' ? <AlertCircle className="h-4 w-4 mt-0.5" /> :
                           <Info className="h-4 w-4 mt-0.5" />}
                          <p className="text-sm">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {result.recommendations.length > 0 && (
                    <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Recommendations
                      </h4>
                      <ul className="space-y-1">
                        {result.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upgrade CTA */}
              <Card className="glass-frosted border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold">Need Business Tax Calculations?</h4>
                      <p className="text-sm text-muted-foreground">
                        Access advanced features for registered businesses
                      </p>
                    </div>
                    <Button onClick={() => navigate('/calculator')}>
                      Business Calculator
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Reusable Input Field Component
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
  return (
    <div>
      <Label className="flex items-center gap-1.5 mb-2.5 text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
        <TooltipHelper content={tooltip} />
      </Label>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-semibold text-lg z-10">
          ₦
        </span>
        <Input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 h-14 rounded-xl border-2 border-border/60 bg-background/80 backdrop-blur-sm shadow-md text-lg font-medium"
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
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="max-w-xs p-3 glass-frosted" side="top">
      <p className="text-sm">{content}</p>
    </PopoverContent>
  </Popover>
);

export default IndividualCalculatorPage;
