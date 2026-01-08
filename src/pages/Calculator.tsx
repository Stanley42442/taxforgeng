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

const CalculatorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const preselectedEntity = location.state?.entityType;
  const { tier, savedBusinesses, loading: subscriptionLoading } = useSubscription();
  const { user, loading: authLoading } = useAuth();

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
    meals: 'Meals',
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
              FIRS Compliant
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
            <div className="mb-6 glass-frosted rounded-2xl p-5 shadow-futuristic animate-slide-up">
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
                    placeholder="0"
                    required
                  />
                  <div className="space-y-2">
                    <NeumorphicInput
                      label="Deductible Expenses"
                      value={inputs.expenses}
                      onChange={(v) => updateInput('expenses', v)}
                      placeholder="0"
                    />
                    {selectedBusinessId && selectedBusinessId !== '__new__' && (
                      <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            <Plus className="h-3 w-3 mr-1" />
                            Quick Add Expense
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Quick Expense</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
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
                            <div className="space-y-2">
                              <Label>Description (optional)</Label>
                              <Input 
                                placeholder="Enter description"
                                value={quickExpense.description}
                                onChange={(e) => setQuickExpense(prev => ({ ...prev, description: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Amount (₦)</Label>
                              <Input 
                                placeholder="0"
                                value={quickExpense.amount}
                                onChange={(e) => setQuickExpense(prev => ({ ...prev, amount: e.target.value.replace(/[^0-9]/g, '') }))}
                              />
                            </div>
                            <Button className="w-full" onClick={handleQuickExpenseSubmit}>
                              Add Expense
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    {Object.keys(expenseBreakdown).length > 0 && (
                      <div className="text-xs text-muted-foreground space-y-1 mt-2 p-2 bg-secondary/30 rounded-lg">
                        {Object.entries(expenseBreakdown).map(([cat, amount]) => (
                          <div key={cat} className="flex justify-between">
                            <span className="flex items-center gap-1">
                              {categoryIcons[cat as ExpenseCategory] || <Receipt className="h-3 w-3" />}
                              {categoryLabels[cat as ExpenseCategory] || cat}
                            </span>
                            <span>₦{amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </InputSection>

              {/* VAT Details */}
              <InputSection title="VAT Details" tooltip="Value Added Tax on sales and purchases">
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
              <InputSection title="Additional Income" tooltip="Other income sources that may be taxed differently">
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

              {/* Other Details */}
              <InputSection title="Other Details" tooltip="Additional deductions and income">
                <div className="grid gap-4 sm:grid-cols-2">
                  <NeumorphicInput
                    label="Rent Paid (WHT)"
                    value={inputs.rentPaid}
                    onChange={(v) => updateInput('rentPaid', v)}
                    placeholder="0"
                  />
                  <NeumorphicInput
                    label="Foreign Income"
                    value={inputs.foreignIncome}
                    onChange={(v) => updateInput('foreignIncome', v)}
                    placeholder="0"
                  />
                  <NeumorphicInput
                    label="Fixed Assets (Capital Allowance)"
                    value={inputs.fixedAssets}
                    onChange={(v) => updateInput('fixedAssets', v)}
                    placeholder="0"
                    className="sm:col-span-2"
                  />
                </div>
              </InputSection>
            </div>

            {/* Calculate Button */}
            <div className="mt-8">
              <Button
                className="w-full h-14 text-lg rounded-2xl bg-gradient-primary hover:shadow-lg hover:scale-[1.02] transition-all duration-300 glow-primary"
                onClick={handleCalculate}
                disabled={!canCalculate}
              >
                Calculate Tax
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Reusable Input Section Component
const InputSection = ({ 
  title, 
  tooltip, 
  children 
}: { 
  title: string; 
  tooltip: string; 
  children: React.ReactNode 
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="text-sm">
          {tooltip}
        </PopoverContent>
      </Popover>
    </div>
    {children}
  </div>
);

// Neumorphic Input Component
const NeumorphicInput = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) => (
  <div className={`space-y-2 ${className}`}>
    <Label className="text-sm font-medium text-muted-foreground">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₦</span>
      <Input
        type="text"
        value={value ? Number(value).toLocaleString() : ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8 h-12 rounded-xl border-2 border-border/60 bg-background/80 backdrop-blur-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
      />
    </div>
  </div>
);

export default CalculatorPage;
