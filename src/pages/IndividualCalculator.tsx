import { useState, useEffect, useRef } from "react";
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
  RefreshCw,
  Download,
  Save,
  History,
  ArrowLeftRight,
  TrendingDown,
  Loader2,
  X
} from "lucide-react";
import { ForeignIncomeCalculator } from "@/components/ForeignIncomeCalculator";
import { calculateIndividualTax, formatCurrency, type IndividualTaxInputs, type IndividualTaxResult } from "@/lib/individualTaxCalculations";
import { PRESUMPTIVE_TAX_RATES } from "@/lib/sectorConfig";
import { usePersonalExpenses } from "@/hooks/usePersonalExpenses";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { downloadIndividualTaxPDF } from "@/lib/individualPdfExport";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useDeviceCSS, getResponsiveClasses } from "@/hooks/useDeviceCSS";

type CalculationType = 'pit' | 'crypto' | 'investment' | 'informal' | 'foreign_income';

interface SavedCalculation {
  id: string;
  calculation_type: string;
  inputs: IndividualTaxInputs;
  result: IndividualTaxResult;
  created_at: string;
}

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
  const { device, isMobile, isTablet, containerClass } = useDeviceCSS();
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
  const [comparisonResult, setComparisonResult] = useState<ReturnType<typeof calculateIndividualTax> | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  // Track if we need to populate (using ref to avoid re-triggers)
  const shouldPopulateRef = useRef(false);
  const lastPopulatedRef = useRef<string | null>(null);


  // Populate fields from expenses
  const populateFromExpenses = (totals: typeof annualTotals, showToast = true) => {
    setPensionContribution(totals.pension_contribution > 0 ? totals.pension_contribution.toLocaleString('en-NG') : '');
    setNhfContribution(totals.nhf_contribution > 0 ? totals.nhf_contribution.toLocaleString('en-NG') : '');
    setLifeInsurance(totals.life_insurance > 0 ? totals.life_insurance.toLocaleString('en-NG') : '');
    setHealthInsurance(totals.health_insurance > 0 ? totals.health_insurance.toLocaleString('en-NG') : '');
    setRentPaid(totals.rent > 0 ? totals.rent.toLocaleString('en-NG') : '');
    if (showToast) {
      toast.success('Fields populated from personal expenses');
    }
  };

  // Handle initial load when toggle is on and data arrives
  useEffect(() => {
    if (shouldPopulateRef.current && annualTotals && !expensesLoading) {
      const totalsKey = JSON.stringify(annualTotals);
      if (lastPopulatedRef.current !== totalsKey) {
        populateFromExpenses(annualTotals);
        lastPopulatedRef.current = totalsKey;
        shouldPopulateRef.current = false;
      }
    }
  }, [annualTotals, expensesLoading]);

  const handleRefreshExpenses = async () => {
    lastPopulatedRef.current = null; // Reset to allow re-population
    shouldPopulateRef.current = true;
    await refetch();
  };

  const handleToggleLoadExpenses = (checked: boolean) => {
    if (checked && !user) {
      toast.error('Please log in to load personal expenses');
      return;
    }
    setLoadFromExpenses(checked);
    if (checked) {
      shouldPopulateRef.current = true;
      lastPopulatedRef.current = null;
      // If data already loaded, populate immediately
      if (annualTotals && !expensesLoading) {
        populateFromExpenses(annualTotals);
        lastPopulatedRef.current = JSON.stringify(annualTotals);
        shouldPopulateRef.current = false;
      }
    } else {
      // Clear auto-populated fields
      setPensionContribution('');
      setNhfContribution('');
      setLifeInsurance('');
      setHealthInsurance('');
      setRentPaid('');
      shouldPopulateRef.current = false;
      lastPopulatedRef.current = null;
    }
  };

  const parseNumber = (value: string) => Number(value.replace(/[^0-9]/g, '')) || 0;
  const formatInput = (value: string) => {
    const num = parseNumber(value);
    return num ? num.toLocaleString('en-NG') : '';
  };

  const getInputs = (rules2026: boolean): IndividualTaxInputs => ({
    calculationType,
    use2026Rules: rules2026,
    employmentIncome: parseNumber(employmentIncome),
    pensionContribution: parseNumber(pensionContribution),
    nhfContribution: parseNumber(nhfContribution),
    nhisContribution: parseNumber(healthInsurance), // NHIS/Health Insurance
    lifeInsurancePremium: parseNumber(lifeInsurance),
    annualRentPaid: parseNumber(rentPaid), // For 2026 Rent Relief
    cryptoIncome: parseNumber(cryptoIncome),
    cryptoGains: parseNumber(cryptoGains),
    cryptoLosses: parseNumber(cryptoLosses),
    dividendIncome: parseNumber(dividendIncome),
    interestIncome: parseNumber(interestIncome),
    capitalGains: parseNumber(capitalGains),
    estimatedTurnover: parseNumber(estimatedTurnover),
    location,
  });

  const handleCalculate = () => {
    const inputs = getInputs(use2026Rules);
    const calcResult = calculateIndividualTax(inputs);
    setResult(calcResult);

    // Calculate comparison with opposite rules
    const comparisonInputs = getInputs(!use2026Rules);
    const compResult = calculateIndividualTax(comparisonInputs);
    setComparisonResult(compResult);
  };

  const handleSaveCalculation = async () => {
    if (!user) {
      toast.error('Please log in to save calculations');
      return;
    }
    if (!result) return;

    setIsSaving(true);
    try {
      const inputs = getInputs(use2026Rules);
      const { error } = await supabase
        .from('individual_calculations')
        .insert([{
          user_id: user.id,
          calculation_type: calculationType,
          inputs: JSON.parse(JSON.stringify(inputs)),
          result: JSON.parse(JSON.stringify(result)),
        }]);

      if (error) throw error;
      toast.success('Calculation saved successfully');
    } catch (error) {
      console.error('Error saving calculation:', error);
      toast.error('Failed to save calculation');
    } finally {
      setIsSaving(false);
    }
  };

  const loadCalculationHistory = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('individual_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSavedCalculations(data as unknown as SavedCalculation[]);
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Failed to load calculation history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadSavedCalculation = (calc: SavedCalculation) => {
    const inputs = calc.inputs;
    setCalculationType(inputs.calculationType as CalculationType);
    setUse2026Rules(inputs.use2026Rules);
    setEmploymentIncome(inputs.employmentIncome ? inputs.employmentIncome.toLocaleString('en-NG') : '');
    setPensionContribution(inputs.pensionContribution ? inputs.pensionContribution.toLocaleString('en-NG') : '');
    setNhfContribution(inputs.nhfContribution ? inputs.nhfContribution.toLocaleString('en-NG') : '');
    setLifeInsurance(inputs.lifeInsurancePremium ? inputs.lifeInsurancePremium.toLocaleString('en-NG') : '');
    setCryptoIncome(inputs.cryptoIncome ? inputs.cryptoIncome.toLocaleString('en-NG') : '');
    setCryptoGains(inputs.cryptoGains ? inputs.cryptoGains.toLocaleString('en-NG') : '');
    setCryptoLosses(inputs.cryptoLosses ? inputs.cryptoLosses.toLocaleString('en-NG') : '');
    setDividendIncome(inputs.dividendIncome ? inputs.dividendIncome.toLocaleString('en-NG') : '');
    setInterestIncome(inputs.interestIncome ? inputs.interestIncome.toLocaleString('en-NG') : '');
    setCapitalGains(inputs.capitalGains ? inputs.capitalGains.toLocaleString('en-NG') : '');
    setEstimatedTurnover(inputs.estimatedTurnover ? inputs.estimatedTurnover.toLocaleString('en-NG') : '');
    setLocation(inputs.location || 'other_urban');
    setResult(calc.result);
    setShowHistoryDialog(false);
    toast.success('Calculation loaded');
  };

  const getCalcTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      pit: 'Employment PIT',
      crypto: 'Crypto Tax',
      investment: 'Investment Tax',
      informal: 'Informal Tax',
      foreign_income: 'Foreign Income'
    };
    return labels[type] || type;
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
      <div className={getResponsiveClasses(device, {
        mobile: 'mb-4 glass-premium rounded-xl p-4 mobile-card',
        all: 'mb-6 glass-frosted rounded-2xl p-5 shadow-futuristic animate-slide-up'
      })}>
        <div className={getResponsiveClasses(device, {
          mobile: 'flex items-center justify-between gap-3',
          all: 'flex items-center justify-between gap-4'
        })}>
          <div className={getResponsiveClasses(device, {
            mobile: 'flex items-center gap-3 min-w-0 flex-1',
            all: 'flex items-center gap-4 min-w-0 flex-1'
          })}>
            <div className={`rounded-xl flex-shrink-0 transition-all duration-300 ${
              isMobile ? 'p-2.5' : 'p-3'
            } ${
              use2026Rules 
                ? 'bg-success/20 text-success glow-success' 
                : 'bg-secondary text-secondary-foreground neumorphic-sm'
            }`}>
              <Info className={isMobile ? 'h-5 w-5' : 'h-6 w-6'} />
            </div>
            <div className="min-w-0 mr-3">
              <p className={getResponsiveClasses(device, {
                mobile: 'font-semibold text-foreground text-sm',
                all: 'font-semibold text-foreground'
              })}>
                {use2026Rules ? 'Nigeria Tax Act 2026' : 'Current Tax Rules'}
              </p>
              <p className={getResponsiveClasses(device, {
                mobile: 'text-xs text-muted-foreground',
                all: 'text-sm text-muted-foreground'
              })}>
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
        className={getResponsiveClasses(device, {
          mobile: 'mb-4',
          all: 'mb-6 animate-slide-up'
        })}
      >
        <TabsList className={getResponsiveClasses(device, {
          mobile: 'grid w-full grid-cols-3 h-auto p-1 glass-premium rounded-xl gap-1',
          all: 'grid w-full grid-cols-3 md:grid-cols-5 h-auto p-1.5 glass-frosted rounded-2xl'
        })}>
          <TabsTrigger 
            value="pit"
            className={getResponsiveClasses(device, {
              mobile: 'flex items-center justify-center gap-1 py-2.5 rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all touch-feedback',
              all: 'flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300'
            })}
          >
            <Briefcase className={isMobile ? 'h-4 w-4' : 'h-4 w-4'} />
            <span className={isMobile ? 'text-xs font-medium' : 'text-sm font-medium hidden sm:inline'}>
              {isMobile ? 'PIT' : 'Employment'}
            </span>
            {!isMobile && <span className="text-sm font-medium sm:hidden">PIT</span>}
          </TabsTrigger>
          <TabsTrigger 
            value="foreign_income"
            className={getResponsiveClasses(device, {
              mobile: 'flex items-center justify-center gap-1 py-2.5 rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all touch-feedback',
              all: 'flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300'
            })}
          >
            <Globe className="h-4 w-4" />
            <span className={isMobile ? 'text-xs font-medium' : 'text-sm font-medium'}>Foreign</span>
          </TabsTrigger>
          <TabsTrigger 
            value="crypto"
            className={getResponsiveClasses(device, {
              mobile: 'flex items-center justify-center gap-1 py-2.5 rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all touch-feedback',
              all: 'flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300'
            })}
          >
            <Bitcoin className="h-4 w-4" />
            <span className={isMobile ? 'text-xs font-medium' : 'text-sm font-medium'}>Crypto</span>
          </TabsTrigger>
          <TabsTrigger 
            value="investment"
            className={getResponsiveClasses(device, {
              mobile: 'flex items-center justify-center gap-1 py-2.5 rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all touch-feedback',
              all: 'flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300'
            })}
          >
            <TrendingUp className="h-4 w-4" />
            <span className={isMobile ? 'text-xs font-medium' : 'text-sm font-medium hidden sm:inline'}>
              {isMobile ? 'Invest' : 'Investment'}
            </span>
            {!isMobile && <span className="text-sm font-medium sm:hidden">Invest</span>}
          </TabsTrigger>
          <TabsTrigger 
            value="informal"
            className={getResponsiveClasses(device, {
              mobile: 'flex items-center justify-center gap-1 py-2.5 rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all touch-feedback',
              all: 'flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300'
            })}
          >
            <Store className="h-4 w-4" />
            <span className={isMobile ? 'text-xs font-medium' : 'text-sm font-medium'}>Informal</span>
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
                      onClick={handleRefreshExpenses}
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
                    First ₦800k exempt. Old CRA abolished - enter Rent Paid for Rent Relief (20%, max ₦500k).
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

      {/* Calculate Button and History */}
      {calculationType !== 'foreign_income' && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 animate-slide-up">
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
          
          {user && (
            <>
              <Dialog open={showHistoryDialog} onOpenChange={(open) => {
                setShowHistoryDialog(open);
                if (open) loadCalculationHistory();
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="gap-2">
                    <History className="h-5 w-5" />
                    <span className="hidden sm:inline">Recent</span>
                    <span className="sm:hidden">History</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Recent Calculations
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[55vh] pr-4">
                    {isLoadingHistory ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : savedCalculations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No saved calculations yet</p>
                        <p className="text-sm">Calculate and save to see history</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {savedCalculations.slice(0, 5).map((calc) => (
                          <div 
                            key={calc.id}
                            className="p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all hover:bg-primary/5"
                            onClick={() => loadSavedCalculation(calc)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">{getCalcTypeLabel(calc.calculation_type)}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(calc.created_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Tax Payable:</span>
                              <span className="font-semibold text-primary">
                                {formatCurrency(calc.result.taxPayable)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {calc.inputs.use2026Rules ? '2026 Rules' : 'Pre-2026 Rules'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Rate: {calc.result.effectiveRate.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  {savedCalculations.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <Button 
                        variant="outline" 
                        className="w-full gap-2"
                        onClick={() => {
                          setShowHistoryDialog(false);
                          navigate('/calculation-history');
                        }}
                      >
                        View All History
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      )}

      {/* Results Section */}
      {result && (
        <Card className="glass-frosted border-0 shadow-futuristic animate-slide-up">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Calculation Results
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveCalculation}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span className="hidden sm:inline">Save</span>
                </Button>
              )}
              <Button
                variant={showComparison ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
                className="gap-2"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span className="hidden sm:inline">Compare Rules</span>
                <span className="sm:hidden">Compare</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const inputs = getInputs(use2026Rules);
                  downloadIndividualTaxPDF({
                    inputs,
                    result,
                    employmentIncome: parseNumber(employmentIncome),
                    pensionContribution: parseNumber(pensionContribution),
                    nhfContribution: parseNumber(nhfContribution),
                    lifeInsurance: parseNumber(lifeInsurance),
                    healthInsurance: parseNumber(healthInsurance),
                    rentPaid: parseNumber(rentPaid),
                    cryptoIncome: parseNumber(cryptoIncome),
                    cryptoGains: parseNumber(cryptoGains),
                    cryptoLosses: parseNumber(cryptoLosses),
                    dividendIncome: parseNumber(dividendIncome),
                    interestIncome: parseNumber(interestIncome),
                    capitalGains: parseNumber(capitalGains),
                    estimatedTurnover: parseNumber(estimatedTurnover),
                    location,
                  });
                  toast.success('PDF downloaded successfully');
                }}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Comparison View */}
            {showComparison && comparisonResult && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    Tax Rule Comparison
                  </h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowComparison(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Rules */}
                  <div className={`p-4 rounded-xl border-2 ${use2026Rules ? 'border-success bg-success/5' : 'border-muted bg-muted/20'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      {use2026Rules && <CheckCircle className="h-4 w-4 text-success" />}
                      <span className="font-medium text-sm">
                        {use2026Rules ? 'Nigeria Tax Act 2026' : 'Pre-2026 Rules'}
                      </span>
                      {use2026Rules && <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">Selected</Badge>}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax Payable:</span>
                        <span className="font-bold text-lg">{formatCurrency(result.taxPayable)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Effective Rate:</span>
                        <span className="font-medium">{result.effectiveRate.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Comparison Rules */}
                  <div className={`p-4 rounded-xl border-2 ${!use2026Rules ? 'border-success bg-success/5' : 'border-muted bg-muted/20'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      {!use2026Rules && <CheckCircle className="h-4 w-4 text-success" />}
                      <span className="font-medium text-sm">
                        {!use2026Rules ? 'Nigeria Tax Act 2026' : 'Pre-2026 Rules'}
                      </span>
                      {!use2026Rules && <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">Selected</Badge>}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax Payable:</span>
                        <span className="font-bold text-lg">{formatCurrency(comparisonResult.taxPayable)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Effective Rate:</span>
                        <span className="font-medium">{comparisonResult.effectiveRate.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Savings Summary */}
                {(() => {
                  const savings = comparisonResult.taxPayable - result.taxPayable;
                  const savings2026 = use2026Rules ? savings : -savings;
                  return savings2026 !== 0 && (
                    <div className={`mt-4 p-3 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-2 text-center ${
                      savings2026 > 0 ? 'bg-success/10 border border-success/20' : 'bg-warning/10 border border-warning/20'
                    }`}>
                      {savings2026 > 0 ? (
                        <>
                          <TrendingDown className="h-5 w-5 text-success" />
                          <span className="text-success font-medium">
                            You save {formatCurrency(Math.abs(savings2026))} with 2026 Rules
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-5 w-5 text-warning" />
                          <span className="text-warning font-medium">
                            Pre-2026 Rules would save you {formatCurrency(Math.abs(savings2026))}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Summary */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Total Tax Payable</p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">{formatCurrency(result.taxPayable)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 rounded-xl bg-secondary">
                    <p className="text-xs text-muted-foreground">Taxable Income</p>
                    <p className="text-base sm:text-lg font-semibold">{formatCurrency(result.taxableIncome)}</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-secondary">
                    <p className="text-xs text-muted-foreground">Effective Rate</p>
                    <p className="text-base sm:text-lg font-semibold">{result.effectiveRate.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
              
              {/* Breakdown */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Tax Breakdown</h4>
                {result.breakdown.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                    <span className="text-muted-foreground text-xs sm:text-sm">{item.label}</span>
                    <span className="font-medium text-xs sm:text-sm">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reliefs Section */}
            {result.reliefs && result.reliefs.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-medium text-foreground mb-4">Tax Reliefs Applied</h4>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                  {result.reliefs.map((relief, i) => (
                    <div key={i} className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{relief.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{relief.description}</p>
                        </div>
                        <span className="text-sm font-semibold text-success whitespace-nowrap">-{formatCurrency(relief.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alerts Section */}
            {result.alerts && result.alerts.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-medium text-foreground mb-4">Alerts & Insights</h4>
                <div className="space-y-2">
                  {result.alerts.map((alert, i) => (
                    <div 
                      key={i} 
                      className={`p-3 rounded-lg text-xs sm:text-sm ${
                        alert.type === 'success' ? 'bg-success/10 text-success border border-success/20' :
                        alert.type === 'warning' ? 'bg-warning/10 text-warning border border-warning/20' :
                        'bg-info/10 text-info border border-info/20'
                      }`}
                    >
                      {alert.type === 'success' && <CheckCircle className="h-4 w-4 inline mr-2" />}
                      {alert.type === 'warning' && <AlertCircle className="h-4 w-4 inline mr-2" />}
                      {alert.type === 'info' && <Info className="h-4 w-4 inline mr-2" />}
                      {alert.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations Section */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-medium text-foreground mb-4">Recommendations</h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
};

export default IndividualCalculatorPage;