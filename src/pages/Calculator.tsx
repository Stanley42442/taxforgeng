import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SEOHead, createHowToSchema, createBreadcrumbSchema } from "@/components/seo/SEOHead";
import { PageLayout } from "@/components/PageLayout";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Building2, 
  Briefcase,
  HelpCircle,
  ArrowRight,
  Info,
  Sparkles,
  Store,
  Plus,
  Receipt,
  Utensils,
  Car,
  Plug,
  Home,
  Package,
  Calculator
} from "lucide-react";
import { calculateTax, type TaxInputs, type SectorTaxRules } from "@/lib/taxCalculations";
import { SectorPresets } from "@/components/SectorPresets";
import { toast } from "sonner";
import { useSubscription, type SavedBusiness } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import logger from "@/lib/logger";

// Move components OUTSIDE main function to prevent re-creation on every render
const NeumorphicInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  tooltip 
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
  tooltip?: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  
  const formatWithCommas = (num: number): string => {
    if (!num) return '';
    return num.toLocaleString('en-NG');
  };
  
  const numericValue = value ? Number(value) : 0;
  // Always show formatted value with commas and prefix
  const displayValue = numericValue ? `₦${formatWithCommas(numericValue)}` : '';
  
  // Restore cursor position after formatting
  useEffect(() => {
    if (cursorPosition !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      setCursorPosition(null);
    }
  }, [displayValue, cursorPosition]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    // Strip all non-numeric characters
    const numValue = input.replace(/[^0-9]/g, '');
    
    // Calculate cursor position based on digit count before cursor
    const beforeCursor = input.slice(0, cursorPos);
    const digitsBeforeCursor = beforeCursor.replace(/[^0-9]/g, '').length;
    
    // Find new cursor position in formatted string
    const newNumValue = numValue ? Number(numValue) : 0;
    const formatted = newNumValue ? `₦${formatWithCommas(newNumValue)}` : '';
    let newCursorPos = 0;
    let digitCount = 0;
    
    for (let i = 0; i < formatted.length && digitCount < digitsBeforeCursor; i++) {
      newCursorPos = i + 1;
      if (/[0-9]/.test(formatted[i])) {
        digitCount++;
      }
    }
    
    setCursorPosition(newCursorPos);
    onChange(numValue);
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {tooltip && (
          <Popover>
            <PopoverTrigger>
              <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </PopoverTrigger>
            <PopoverContent className="text-sm max-w-xs">{tooltip}</PopoverContent>
          </Popover>
        )}
      </div>
      <Input
        ref={inputRef}
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-12 text-lg font-medium truncate"
      />
    </div>
  );
};

const InputSection = ({ title, tooltip, children }: { title: string; tooltip?: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <h3 className="font-semibold text-foreground">{title}</h3>
      {tooltip && (
        <Popover>
          <PopoverTrigger>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent className="text-sm max-w-xs">{tooltip}</PopoverContent>
        </Popover>
      )}
    </div>
    {children}
  </div>
);

type ExpenseCategory = 'office_supplies' | 'travel' | 'utilities' | 'meals' | 'rent' | 'equipment' | 'other';

const categoryIcons: Record<ExpenseCategory, React.ReactNode> = {
  office_supplies: <Package className="h-4 w-4" />,
  travel: <Car className="h-4 w-4" />,
  utilities: <Plug className="h-4 w-4" />,
  meals: <Utensils className="h-4 w-4" />,
  rent: <Home className="h-4 w-4" />,
  equipment: <Package className="h-4 w-4" />,
  other: <Receipt className="h-4 w-4" />,
};

const categoryLabels: Record<ExpenseCategory, string> = {
  office_supplies: 'Office Supplies',
  travel: 'Travel',
  utilities: 'Utilities',
  meals: 'Meals',
  rent: 'Rent',
  equipment: 'Equipment',
  other: 'Other',
};

const CalculatorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const preselectedEntity = location.state?.entityType;
  const { tier, savedBusinesses, loading: subscriptionLoading } = useSubscription();
  const { user, loading: authLoading } = useAuth();

  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [entityType, setEntityType] = useState<'business_name' | 'company'>(
    preselectedEntity || 'business_name'
  );
  const [use2026Rules, setUse2026Rules] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string | undefined>(undefined);
  const [sectorRules, setSectorRules] = useState<SectorTaxRules | undefined>(undefined);
  
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

  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [expenseBreakdown, setExpenseBreakdown] = useState<Record<string, number>>({});
  const [quickExpense, setQuickExpense] = useState({
    description: '',
    amount: '',
    category: 'other' as string,
  });

  const isLoading = authLoading || subscriptionLoading;
  const isFreeTierOrGuest = !user || tier === 'free';

  useEffect(() => {
    if (!isLoading && isFreeTierOrGuest) {
      toast.info("Business Tax requires a paid plan. Redirecting to Personal Tax Calculator.", {
        duration: 4000
      });
      navigate('/individual-calculator', { 
        state: { showUpgradePrompt: true },
        replace: true 
      });
    }
  }, [isLoading, isFreeTierOrGuest, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <div className="space-y-2 text-center">
            <div className="animate-pulse bg-muted h-4 w-32 mx-auto rounded" />
            <div className="animate-pulse bg-muted h-3 w-24 mx-auto rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isFreeTierOrGuest) {
    return null;
  }

  const fetchBusinessExpenses = async (businessId: string) => {
    if (!user || businessId === '__new__') {
      setExpenseBreakdown({});
      return { totalExpenses: 0, deductibleExpenses: 0 };
    }
    
    const { data, error } = await supabase
      .from('expenses')
      .select('amount, is_deductible, type, category')
      .eq('user_id', user.id)
      .eq('business_id', businessId);
    
    if (error) {
      logger.error('Error fetching expenses:', error);
      setExpenseBreakdown({});
      return { totalExpenses: 0, deductibleExpenses: 0 };
    }
    
    const expenses = data || [];
    const totalExpenses = expenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const deductibleExpenses = expenses
      .filter(e => e.is_deductible)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const breakdown: Record<string, number> = {};
    expenses.forEach(e => {
      const cat = e.category || 'other';
      breakdown[cat] = (breakdown[cat] || 0) + Number(e.amount);
    });
    setExpenseBreakdown(breakdown);
    
    return { totalExpenses, deductibleExpenses };
  };

  const handleQuickExpenseSubmit = async () => {
    if (!user || !selectedBusinessId || selectedBusinessId === '__new__') return;
    
    const amount = Number(quickExpense.amount.replace(/[^0-9]/g, ''));
    if (!amount) {
      toast.error('Please enter an amount');
      return;
    }

    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,
      business_id: selectedBusinessId,
      type: 'expense',
      category: quickExpense.category,
      description: quickExpense.description || `${categoryLabels[quickExpense.category as ExpenseCategory]} expense`,
      amount,
      is_deductible: true,
    });

    if (error) {
      toast.error('Failed to add expense');
      logger.error(error);
      return;
    }

    toast.success('Expense added');
    setQuickExpense({ description: '', amount: '', category: 'other' });
    setExpenseDialogOpen(false);

    const { deductibleExpenses } = await fetchBusinessExpenses(selectedBusinessId);
    setInputs(prev => ({
      ...prev,
      expenses: deductibleExpenses > 0 ? deductibleExpenses.toString() : ''
    }));
  };

  const handleBusinessSelect = async (businessId: string) => {
    setSelectedBusinessId(businessId);
    
    if (businessId === '__new__') {
      setInputs(prev => ({ ...prev, turnover: '', expenses: '' }));
      setSelectedSector(undefined);
      setSectorRules(undefined);
      setExpenseBreakdown({});
      return;
    }
    
    const business = savedBusinesses.find(b => b.id === businessId);
    if (business) {
      setEntityType(business.entityType as 'business_name' | 'company');
      const turnover = business.turnover ? business.turnover.toString() : '';
      const { deductibleExpenses } = await fetchBusinessExpenses(businessId);
      
      setInputs(prev => ({ 
        ...prev, 
        turnover,
        expenses: deductibleExpenses > 0 ? deductibleExpenses.toString() : ''
      }));
      
      if (business.sector) {
        setSelectedSector(business.sector);
      }
      
      const expenseText = deductibleExpenses > 0 
        ? ` • Expenses: ₦${deductibleExpenses.toLocaleString()}`
        : '';
      
      toast.success(`Loaded ${business.name}`, {
        description: `Entity: ${business.entityType === 'company' ? 'Company (LTD)' : 'Business Name'}${business.sector ? ` • Sector: ${business.sector.replace(/_/g, ' ')}` : ''}${expenseText}`
      });
    }
  };

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
      sectorId: selectedSector,
      sectorRules: sectorRules,
    };

    const result = calculateTax(taxInputs);
    navigate('/results', { state: { result, inputs: taxInputs } });
  };

  const canCalculate = Number(inputs.turnover) > 0;

  return (
    <PageLayout maxWidth="2xl" showBackground={true}>
      <SEOHead
        title="Nigerian Tax Calculator 2026 - CIT, PIT, VAT, WHT | TaxForge"
        description="Calculate Nigerian CIT, PIT, PAYE, VAT, and WHT instantly. 2026 tax reform rules built in. Compare Business Name vs LLC. Free, no signup required."
        canonicalPath="/calculator"
        keywords="Nigeria tax calculator, CIT calculator, PAYE calculator Nigeria, VAT calculator, WHT calculator, business tax Nigeria 2026"
        schema={{
          ...createHowToSchema(
            'How to Calculate Nigerian Business Tax',
            'Use TaxForge NG to calculate CIT, VAT, WHT, and PIT for your Nigerian business in minutes.',
            [
              { name: 'Select your business or start new', text: 'Choose an existing saved business or start a new calculation from scratch.' },
              { name: 'Choose entity type', text: 'Select Business Name or Company (LTD) to apply the correct tax rules.' },
              { name: 'Enter financial details', text: 'Input your annual turnover, expenses, rent paid, and other income sources.' },
              { name: 'Apply sector presets', text: 'Optionally select your industry sector for tailored VAT and CIT rules.' },
              { name: 'Calculate and review', text: 'Click Calculate to see your full tax breakdown including CIT, VAT, WHT, and effective tax rate.' },
            ]
          ),
          breadcrumb: createBreadcrumbSchema([
            { name: 'Home', url: 'https://taxforgeng.com/' },
            { name: 'Calculator', url: 'https://taxforgeng.com/calculator' },
          ]),
        }}
      />
      <div className="mx-auto max-w-2xl">
        {/* Header */}
         <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4 text-accent" />
            NRS Compliant
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Business Tax Calculator
          </h1>
          <p className="text-muted-foreground mb-4">
            Calculate your Nigerian business taxes accurately
          </p>
        </div>

        {/* Business Selector */}
        {savedBusinesses.length > 0 && (
          <div className="mb-6 border border-border rounded-xl bg-card p-5 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="rounded-xl p-3 bg-primary/10 text-primary flex-shrink-0">
                <Store className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Select Business
                </Label>
                <Select value={selectedBusinessId} onValueChange={handleBusinessSelect}>
                  <SelectTrigger className="w-full h-12 rounded-xl border-2 border-border/60 bg-background/80 backdrop-blur-sm">
                    <SelectValue placeholder="Select a business" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__new__">
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-accent" />
                        New Calculation
                      </span>
                    </SelectItem>
                    {savedBusinesses.map((business) => (
                      <SelectItem key={business.id} value={business.id}>
                        <span className="flex items-center gap-2">
                          {business.entityType === 'company' ? (
                            <Building2 className="h-4 w-4 text-primary" />
                          ) : (
                            <Briefcase className="h-4 w-4 text-primary" />
                          )}
                          {business.name}
                          {business.verificationStatus === 'verified' && (
                            <span className="text-xs bg-success/20 text-success px-1.5 py-0.5 rounded">✓ CAC</span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Sector Presets */}
        <div className="mb-6 animate-slide-up">
          <SectorPresets 
            selectedSector={selectedSector}
            onApplyPreset={(taxRules, sectorId) => {
              setSelectedSector(sectorId);
              setSectorRules(taxRules);
              
              toast.success(`${sectorId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} sector rules applied`, {
                description: taxRules.vatStatus === 'zero' 
                  ? 'Zero-rated VAT • Input credits recoverable' 
                  : taxRules.vatStatus === 'exempt'
                  ? 'VAT exempt • No VAT on supplies'
                  : taxRules.citRate !== undefined 
                  ? `CIT: ${taxRules.citRate}% • VAT: ${taxRules.vatRate || 7.5}%`
                  : 'Standard tax rules applied'
              });
            }} 
          />
        </div>

        {/* Tax Rule Toggle */}
        <div className="mb-6 border border-border rounded-xl bg-card p-5 animate-slide-up">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className={`rounded-xl p-3 flex-shrink-0 transition-all duration-300 ${
                use2026Rules 
                  ? 'bg-success/20 text-success' 
                  : 'bg-secondary text-secondary-foreground'
              }`}>
                <Info className="h-6 w-6" />
              </div>
              <div className="min-w-0 mr-3">
                <p className="font-semibold text-foreground">
                  {use2026Rules ? '2026 Tax Rules' : 'Pre-2026 Tax Rules'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {use2026Rules 
                    ? '0% CIT for small companies, new PIT bands' 
                    : '30% CIT, old reliefs and bands'}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 ml-2">
              <Switch 
                checked={use2026Rules} 
                onCheckedChange={setUse2026Rules}
                className="data-[state=checked]:bg-success"
              />
            </div>
          </div>
        </div>

        {/* Entity Type Selection */}
        <Tabs 
          value={entityType} 
          onValueChange={(v) => setEntityType(v as 'business_name' | 'company')}
          className="mb-6 animate-slide-up-delay-1"
        >
          <TabsList className="grid w-full grid-cols-2 h-auto p-1.5 bg-muted rounded-lg">
            <TabsTrigger 
              value="business_name"
              className="flex items-center gap-2 py-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Briefcase className="h-5 w-5" />
              <span className="font-semibold">Business Name</span>
            </TabsTrigger>
            <TabsTrigger 
              value="company"
              className="flex items-center gap-2 py-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Building2 className="h-5 w-5" />
              <span className="font-semibold">Company (LTD)</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Input Form */}
        <div className="border border-border rounded-xl bg-card p-6 md:p-8 animate-slide-up-delay-2">
          <div className="space-y-8">
            {/* Primary Income */}
            <InputSection title="Primary Income" tooltip="Your main business revenue and expenses">
              <div className="grid gap-4 sm:grid-cols-2">
                <NeumorphicInput
                  label="Annual Turnover"
                  value={inputs.turnover}
                  onChange={(v) => updateInput('turnover', v)}
                  placeholder="0"
                  required
                />
                <div className="space-y-2">
                  <NeumorphicInput
                    label="Deductible Expenses"
                    value={inputs.expenses}
                    onChange={(v) => updateInput('expenses', v)}
                    placeholder="0"
                    tooltip="Business expenses that reduce your taxable income"
                  />
                  {selectedBusinessId && selectedBusinessId !== '__new__' && (
                    <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          <Plus className="h-4 w-4 mr-1" />
                          Quick Add Expense
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Quick Expense</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Category</Label>
                            <Select value={quickExpense.category} onValueChange={(v) => setQuickExpense(prev => ({ ...prev, category: v }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(categoryLabels).map(([key, label]) => (
                                  <SelectItem key={key} value={key}>
                                    <span className="flex items-center gap-2">
                                      {categoryIcons[key as ExpenseCategory]}
                                      {label}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Amount</Label>
                            <Input
                              placeholder="₦0"
                              value={quickExpense.amount}
                              onChange={(e) => setQuickExpense(prev => ({ ...prev, amount: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Description (Optional)</Label>
                            <Input
                              placeholder="e.g., Office supplies"
                              value={quickExpense.description}
                              onChange={(e) => setQuickExpense(prev => ({ ...prev, description: e.target.value }))}
                            />
                          </div>
                          <Button onClick={handleQuickExpenseSubmit} className="w-full">
                            Add Expense
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </InputSection>

            {/* VAT Section */}
            <InputSection title="VAT Details" tooltip="Value Added Tax on your sales and purchases">
              <div className="grid gap-4 sm:grid-cols-2">
                <NeumorphicInput
                  label="VATable Sales"
                  value={inputs.vatableSales}
                  onChange={(v) => updateInput('vatableSales', v)}
                  placeholder="0"
                />
                <NeumorphicInput
                  label="VATable Purchases"
                  value={inputs.vatablePurchases}
                  onChange={(v) => updateInput('vatablePurchases', v)}
                  placeholder="0"
                />
              </div>
            </InputSection>

            {/* Additional Income */}
            <InputSection title="Additional Income" tooltip="Other sources of taxable income">
              <div className="grid gap-4 sm:grid-cols-2">
                <NeumorphicInput
                  label="Rental Income"
                  value={inputs.rentalIncome}
                  onChange={(v) => updateInput('rentalIncome', v)}
                  placeholder="0"
                />
                <NeumorphicInput
                  label="Consultancy Income"
                  value={inputs.consultancyIncome}
                  onChange={(v) => updateInput('consultancyIncome', v)}
                  placeholder="0"
                />
                <NeumorphicInput
                  label="Dividend Income"
                  value={inputs.dividendIncome}
                  onChange={(v) => updateInput('dividendIncome', v)}
                  placeholder="0"
                />
                <NeumorphicInput
                  label="Capital Gains"
                  value={inputs.capitalGains}
                  onChange={(v) => updateInput('capitalGains', v)}
                  placeholder="0"
                />
              </div>
            </InputSection>

            {/* For Company Only */}
            {entityType === 'company' && (
              <InputSection title="Company Details" tooltip="Additional details for limited companies">
                <div className="grid gap-4 sm:grid-cols-2">
                  <NeumorphicInput
                    label="Fixed Assets Value"
                    value={inputs.fixedAssets}
                    onChange={(v) => updateInput('fixedAssets', v)}
                    placeholder="0"
                    tooltip="Used to determine small company status (≤₦250M for 0% CIT under 2026 rules)"
                  />
                  <NeumorphicInput
                    label="Rent Paid"
                    value={inputs.rentPaid}
                    onChange={(v) => updateInput('rentPaid', v)}
                    placeholder="0"
                  />
                </div>
              </InputSection>
            )}

            {/* Calculate Button */}
            <Button 
              variant="default" 
              size="lg" 
              className="w-full h-14 text-lg"
              onClick={handleCalculate}
              disabled={!canCalculate}
            >
              <Calculator className="h-5 w-5" />
              Calculate Tax
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CalculatorPage;
