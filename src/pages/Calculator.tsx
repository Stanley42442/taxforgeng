import { useState, useEffect } from "react";
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
  Package
} from "lucide-react";
import { calculateTax, type TaxInputs, type SectorTaxRules } from "@/lib/taxCalculations";
import { NavMenu } from "@/components/NavMenu";
import { SectorPresets } from "@/components/SectorPresets";
import { toast } from "sonner";
import { useSubscription, type SavedBusiness } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const CalculatorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const preselectedEntity = location.state?.entityType;
  const { tier, savedBusinesses, loading: subscriptionLoading } = useSubscription();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
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

  // Quick-add expense state
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [expenseBreakdown, setExpenseBreakdown] = useState<Record<string, number>>({});
  const [quickExpense, setQuickExpense] = useState({
    description: '',
    amount: '',
    category: 'other' as string,
  });

  // Wait for auth and subscription data to load before checking access
  const isLoading = authLoading || subscriptionLoading;
  const isFreeTierOrGuest = !user || tier === 'free';

  useEffect(() => {
    // Only redirect after loading is complete
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

  // Show loading state while checking access
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if redirecting
  if (isFreeTierOrGuest) {
    return null;
  }

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
    meals: 'Meals & Entertainment',
    rent: 'Rent',
    equipment: 'Equipment',
    other: 'Other',
  };

  // Fetch expenses for selected business with category breakdown
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
      console.error('Error fetching expenses:', error);
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

    // Calculate category breakdown
    const breakdown: Record<string, number> = {};
    expenses.forEach(e => {
      const cat = e.category || 'other';
      breakdown[cat] = (breakdown[cat] || 0) + Number(e.amount);
    });
    setExpenseBreakdown(breakdown);
    
    return { totalExpenses, deductibleExpenses };
  };

  // Handle quick expense submission
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
      console.error(error);
      return;
    }

    toast.success('Expense added');
    setQuickExpense({ description: '', amount: '', category: 'other' });
    setExpenseDialogOpen(false);

    // Refresh expenses
    const { deductibleExpenses } = await fetchBusinessExpenses(selectedBusinessId);
    setInputs(prev => ({
      ...prev,
      expenses: deductibleExpenses > 0 ? deductibleExpenses.toString() : ''
    }));
  };

  // Handle business selection
  const handleBusinessSelect = async (businessId: string) => {
    setSelectedBusinessId(businessId);
    
    if (businessId === '__new__') {
      // Reset to defaults when "New calculation" is selected
      setInputs(prev => ({ ...prev, turnover: '', expenses: '' }));
      setSelectedSector(undefined);
      setSectorRules(undefined);
      setExpenseBreakdown({});
      return;
    }
    
    const business = savedBusinesses.find(b => b.id === businessId);
    if (business) {
      // Pre-fill entity type
      setEntityType(business.entityType as 'business_name' | 'company');
      
      // Pre-fill turnover
      const turnover = business.turnover ? business.turnover.toString() : '';
      
      // Fetch and pre-fill expenses for this business
      const { deductibleExpenses } = await fetchBusinessExpenses(businessId);
      
      setInputs(prev => ({ 
        ...prev, 
        turnover,
        expenses: deductibleExpenses > 0 ? deductibleExpenses.toString() : ''
      }));
      
      // Pre-fill sector if available
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
    <div className="min-h-screen flex flex-col relative">
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
              {t('calculator.firsCompliant')}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {t('calculator.title')}
            </h1>
            <p className="text-muted-foreground mb-4">
              {t('calculator.subtitle')}
            </p>
          </div>

          {/* Business Selector */}
          {savedBusinesses.length > 0 && (
            <div className="mb-6 glass-frosted rounded-2xl p-5 shadow-futuristic animate-slide-up">
              <div className="flex items-center gap-4">
                <div className="rounded-xl p-3 bg-primary/10 text-primary flex-shrink-0">
                  <Store className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    {t('calculator.selectBusiness')}
                  </Label>
                  <Select value={selectedBusinessId} onValueChange={handleBusinessSelect}>
                    <SelectTrigger className="w-full h-12 rounded-xl border-2 border-border/60 bg-background/80 backdrop-blur-sm">
                      <SelectValue placeholder={t('calculator.selectBusiness')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__new__">
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-accent" />
                          {t('calculator.newCalculation')}
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
                // Store sector rules for calculation
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

          {/* Tax Rule Toggle - Neumorphic */}
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
                    {use2026Rules ? t('calculator.2026Rules') : t('calculator.pre2026Rules')}
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
                <span className="font-semibold">{t('calculator.businessName')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="company"
                className="flex items-center gap-2 py-4 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Building2 className="h-5 w-5" />
                <span className="font-semibold">{t('calculator.company')}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Input Form - Glassmorphic Card */}
          <div className="glass-frosted rounded-3xl p-6 md:p-8 shadow-futuristic animate-slide-up-delay-2">
            <div className="space-y-8">
              {/* Primary Income */}
              <InputSection title={t('calculator.primaryIncome')} tooltip="Your main business revenue and expenses">
                <div className="grid gap-4 sm:grid-cols-2">
                  <NeumorphicInput
                    label={t('calculator.annualTurnover')}
                    value={inputs.turnover}
                    onChange={(v) => updateInput('turnover', v)}
                    tooltip="Total revenue/sales for the year"
                    required
                  />
                  <div>
                    <NeumorphicInput
                      label={t('calculator.expenses')}
                      value={inputs.expenses}
                      onChange={(v) => updateInput('expenses', v)}
                      tooltip="Deductible business costs"
                    />
                    {/* Quick Add Expense Button */}
                    {selectedBusinessId && selectedBusinessId !== '__new__' && (
                      <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 text-xs text-primary hover:text-primary/80"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {t('calculator.quickAddExpense')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-frosted">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Receipt className="h-5 w-5 text-primary" />
                              {t('expense.addExpense')}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">{t('expense.category')}</Label>
                              <Select 
                                value={quickExpense.category} 
                                onValueChange={(v) => setQuickExpense(prev => ({ ...prev, category: v }))}
                              >
                                <SelectTrigger className="h-12 rounded-xl">
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
                              <Label className="text-sm font-medium mb-2 block">{t('expense.amount')}</Label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-semibold">₦</span>
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  value={quickExpense.amount ? Number(quickExpense.amount.replace(/[^0-9]/g, '')).toLocaleString() : ''}
                                  onChange={(e) => setQuickExpense(prev => ({ 
                                    ...prev, 
                                    amount: e.target.value.replace(/[^0-9]/g, '') 
                                  }))}
                                  className="pl-10 h-12 rounded-xl"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium mb-2 block">{t('expense.description')}</Label>
                              <Input
                                value={quickExpense.description}
                                onChange={(e) => setQuickExpense(prev => ({ ...prev, description: e.target.value }))}
                                className="h-12 rounded-xl"
                                placeholder="..."
                              />
                            </div>
                            <Button 
                              onClick={handleQuickExpenseSubmit}
                              className="w-full h-12 rounded-xl"
                              disabled={!quickExpense.amount}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {t('expense.addExpense')}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                {/* Expense Breakdown by Category */}
                {selectedBusinessId && selectedBusinessId !== '__new__' && Object.keys(expenseBreakdown).length > 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-secondary/30 border border-border/40">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-primary" />
                      Expense Breakdown
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(expenseBreakdown).map(([category, amount]) => (
                        <div 
                          key={category} 
                          className="flex items-center gap-2 p-2 rounded-lg bg-background/50"
                        >
                          <span className="text-muted-foreground">
                            {categoryIcons[category as ExpenseCategory] || categoryIcons.other}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground truncate">
                              {categoryLabels[category as ExpenseCategory] || category}
                            </p>
                            <p className="text-sm font-medium text-foreground">
                              ₦{amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </InputSection>

              {/* Company-specific fields */}
              {entityType === 'company' && (
                <InputSection title="Company Assets" tooltip="Required to determine small company status">
                  <NeumorphicInput
                    label={t('calculator.fixedAssets')}
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
                    label={t('calculator.rentPaid')}
                    value={inputs.rentPaid}
                    onChange={(v) => updateInput('rentPaid', v)}
                    tooltip="Relief: min(20% of rent, ₦500k)"
                  />
                </InputSection>
              )}

              {/* VAT */}
              <InputSection title={t('calculator.vatDetails')} tooltip="Mandatory if turnover > ₦25m">
                <div className="grid gap-4 sm:grid-cols-2">
                  <NeumorphicInput
                    label={t('calculator.vatableSales')}
                    value={inputs.vatableSales}
                    onChange={(v) => updateInput('vatableSales', v)}
                    tooltip="Sales subject to VAT"
                  />
                  <NeumorphicInput
                    label={t('calculator.vatablePurchases')}
                    value={inputs.vatablePurchases}
                    onChange={(v) => updateInput('vatablePurchases', v)}
                    tooltip="Purchases with recoverable VAT"
                  />
                </div>
              </InputSection>

              {/* Other Income */}
              <InputSection title={t('calculator.additionalIncome')} tooltip="Additional income sources">
                <div className="grid gap-4 sm:grid-cols-2">
                  <NeumorphicInput
                    label={t('calculator.rentalIncome')}
                    value={inputs.rentalIncome}
                    onChange={(v) => updateInput('rentalIncome', v)}
                    tooltip="10% WHT usually deducted at source"
                  />
                  <NeumorphicInput
                    label={t('calculator.consultancyIncome')}
                    value={inputs.consultancyIncome}
                    onChange={(v) => updateInput('consultancyIncome', v)}
                    tooltip="10% WHT for companies, 5% for individuals"
                  />
                  <NeumorphicInput
                    label={t('calculator.dividendIncome')}
                    value={inputs.dividendIncome}
                    onChange={(v) => updateInput('dividendIncome', v)}
                    tooltip="Franked dividends from Nigerian companies are tax-exempt"
                  />
                  <NeumorphicInput
                    label={t('calculator.capitalGains')}
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
                <span>{t('calculator.calculateTax')}</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
              {!canCalculate && (
                <p className="text-center text-sm text-muted-foreground mt-3">
                  {t('calculator.annualTurnover')}
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
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 h-14 rounded-xl border-2 border-border/60 bg-background/80 backdrop-blur-sm shadow-md text-lg font-medium text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary/10 hover:border-primary/50 hover:shadow-md transition-all duration-300"
          placeholder="0"
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
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
