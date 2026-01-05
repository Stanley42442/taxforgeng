import { useState, useEffect } from "react";
import { NavMenu } from "@/components/NavMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { notifyExpenseAdded } from "@/lib/notifications";
import {
  Receipt,
  Plus,
  Upload,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calculator,
  Crown,
  FileSpreadsheet,
  PieChart,
  Loader2,
  Sparkles,
  CalendarIcon,
  Filter,
  X,
  Camera
} from "lucide-react";
import { formatCurrency } from "@/lib/taxCalculations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ExpenseCharts } from "@/components/ExpenseCharts";
import { OCRReceiptScanner } from "@/components/OCRReceiptScanner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'income' | 'rent' | 'transport' | 'marketing' | 'salary' | 'utilities' | 'supplies' | 'other';
  type: 'income' | 'expense';
  isDeductible: boolean;
  businessId?: string;
}

const EXPENSE_CATEGORIES = [
  { value: 'income', label: 'Income', type: 'income' as const },
  { value: 'rent', label: 'Rent & Office', type: 'expense' as const, deductible: true },
  { value: 'transport', label: 'Transport & Travel', type: 'expense' as const, deductible: true },
  { value: 'marketing', label: 'Marketing & Ads', type: 'expense' as const, deductible: true },
  { value: 'salary', label: 'Salaries & Wages', type: 'expense' as const, deductible: true },
  { value: 'utilities', label: 'Utilities', type: 'expense' as const, deductible: true },
  { value: 'supplies', label: 'Supplies & Equipment', type: 'expense' as const, deductible: true },
  { value: 'other', label: 'Other Expenses', type: 'expense' as const, deductible: false },
];

const getCategoryIcon = (category: Expense['category']) => {
  const icons: Record<Expense['category'], string> = {
    income: '💰',
    rent: '🏢',
    transport: '🚗',
    marketing: '📢',
    salary: '👥',
    utilities: '💡',
    supplies: '📦',
    other: '📋',
  };
  return icons[category];
};

const estimateTax = (income: number): number => {
  if (income <= 800000) return 0;
  let tax = 0;
  let remaining = income;
  
  if (remaining > 800000) {
    const band = Math.min(remaining - 800000, 2200000);
    tax += band * 0.15;
    remaining -= 800000 + band;
  }
  if (remaining > 0) {
    const band = Math.min(remaining, 7000000);
    tax += band * 0.19;
    remaining -= band;
  }
  if (remaining > 0) {
    const band = Math.min(remaining, 40000000);
    tax += band * 0.21;
    remaining -= band;
  }
  if (remaining > 0) {
    tax += remaining * 0.25;
  }
  
  return tax;
};

const Expenses = () => {
  const { tier, savedBusinesses } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [filterBusinessId, setFilterBusinessId] = useState<string>('all');
  const [showCharts, setShowCharts] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'other' as Expense['category'],
    businessId: '',
  });

  useEffect(() => {
    setNewExpense(prev => ({
      ...prev,
      businessId: filterBusinessId !== 'all' ? filterBusinessId : ''
    }));
  }, [filterBusinessId]);

  const isBasicPlus = tier !== 'free';

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) {
        setExpenses([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        toast.error('Failed to load expenses');
      } else {
        const mapped: Expense[] = (data || []).map(e => ({
          id: e.id,
          date: e.date,
          description: e.description || '',
          amount: Number(e.amount),
          category: e.category as Expense['category'],
          type: e.type as 'income' | 'expense',
          isDeductible: e.is_deductible,
          businessId: e.business_id || undefined,
        }));
        setExpenses(mapped);
      }
      setLoading(false);
    };

    fetchExpenses();
  }, [user]);

  // Upgrade prompt for free tier
  if (!isBasicPlus) {
    return (
      <div className="min-h-screen bg-background">
        <NavMenu />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-accent">
              <Crown className="h-12 w-12 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">Expense Tracking</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Track income and expenses to get real-time tax estimates. Available on Basic+ plans.
            </p>
            <Button variant="glow" size="lg" onClick={() => navigate('/pricing')}>
              <Crown className="h-5 w-5" />
              Upgrade to Basic
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddExpense = async () => {
    if (!user) {
      toast.error("Please sign in to add expenses");
      return;
    }

    if (!newExpense.description.trim() || !newExpense.amount) {
      toast.error("Please fill all fields");
      return;
    }

    const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === newExpense.category);
    const expenseType = categoryInfo?.type || 'expense';
    const isDeductible = expenseType === 'expense' ? (categoryInfo?.deductible ?? false) : false;

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        business_id: newExpense.businessId || null,
        date: newExpense.date,
        description: newExpense.description.trim(),
        amount: Number(newExpense.amount),
        category: newExpense.category,
        type: expenseType,
        is_deductible: isDeductible,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
      return;
    }

    const expense: Expense = {
      id: data.id,
      date: data.date,
      description: data.description || '',
      amount: Number(data.amount),
      category: data.category as Expense['category'],
      type: data.type as 'income' | 'expense',
      isDeductible: data.is_deductible,
      businessId: data.business_id || undefined,
    };

    setExpenses(prev => [expense, ...prev]);
    setShowAddDialog(false);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      category: 'other',
      businessId: '',
    });
    toast.success("Entry added");
    notifyExpenseAdded(expense.description, expense.amount, expense.type === 'income');
  };

  const handleCSVImport = async () => {
    if (!user) {
      toast.error("Please sign in to import expenses");
      return;
    }

    const mockData = [
      { date: '2025-12-01', description: 'Client Payment - Project A', amount: 500000, category: 'income', type: 'income', is_deductible: false },
      { date: '2025-12-05', description: 'Office Rent December', amount: 150000, category: 'rent', type: 'expense', is_deductible: true },
      { date: '2025-12-10', description: 'Google Ads Campaign', amount: 45000, category: 'marketing', type: 'expense', is_deductible: true },
      { date: '2025-12-12', description: 'Staff Salaries', amount: 350000, category: 'salary', type: 'expense', is_deductible: true },
      { date: '2025-12-15', description: 'Freelance Work', amount: 200000, category: 'income', type: 'income', is_deductible: false },
    ];

    const { data, error } = await supabase
      .from('expenses')
      .insert(mockData.map(e => ({ ...e, user_id: user.id })))
      .select();

    if (error) {
      console.error('Error importing expenses:', error);
      toast.error('Failed to import expenses');
      return;
    }

    const mapped: Expense[] = (data || []).map(e => ({
      id: e.id,
      date: e.date,
      description: e.description || '',
      amount: Number(e.amount),
      category: e.category as Expense['category'],
      type: e.type as 'income' | 'expense',
      isDeductible: e.is_deductible,
    }));

    setExpenses(prev => [...mapped, ...prev]);
    toast.success("Imported 5 entries from CSV (mock data)");
  };

  const handleDeleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
      return;
    }

    setExpenses(prev => prev.filter(e => e.id !== id));
    toast.success("Entry deleted");
  };

  const filteredExpenses = expenses.filter(e => {
    if (filterBusinessId !== 'all' && e.businessId !== filterBusinessId) return false;
    if (filterType !== 'all' && e.type !== filterType) return false;
    if (filterCategory !== 'all' && e.category !== filterCategory) return false;
    if (dateFrom) {
      const expenseDate = new Date(e.date);
      if (expenseDate < dateFrom) return false;
    }
    if (dateTo) {
      const expenseDate = new Date(e.date);
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      if (expenseDate > endOfDay) return false;
    }
    return true;
  });

  const hasActiveFilters = filterType !== 'all' || filterCategory !== 'all' || dateFrom !== undefined || dateTo !== undefined || filterBusinessId !== 'all';

  const clearFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setFilterBusinessId('all');
  };

  const totalIncome = filteredExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = filteredExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const deductibleExpenses = filteredExpenses.filter(e => e.isDeductible).reduce((sum, e) => sum + e.amount, 0);
  const taxableIncome = Math.max(0, totalIncome - deductibleExpenses);
  const estimatedTax = estimateTax(taxableIncome);

  const getBusinessName = (businessId?: string) => {
    if (!businessId) return null;
    const business = savedBusinesses.find(b => b.id === businessId);
    return business?.name || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavMenu />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-mesh pointer-events-none" />
      
      <NavMenu />

      <main className="container mx-auto px-4 py-6 pb-8 relative z-10">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow-primary">
              <Receipt className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Expense Tracking</h1>
            <p className="text-muted-foreground">Track income and expenses for real-time tax estimates</p>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="glass-frosted rounded-xl p-4 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-success/10">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <span className="text-sm text-muted-foreground">Income</span>
              </div>
              <p className="text-xl font-bold text-success">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="glass-frosted rounded-xl p-4 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-destructive/10">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                </div>
                <span className="text-sm text-muted-foreground">Expenses</span>
              </div>
              <p className="text-xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="glass-frosted rounded-xl p-4 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Receipt className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Deductible</span>
              </div>
              <p className="text-xl font-bold text-primary">{formatCurrency(deductibleExpenses)}</p>
            </div>
            <div className="glass-frosted rounded-xl p-4 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-warning/10">
                  <Calculator className="h-4 w-4 text-warning" />
                </div>
                <span className="text-sm text-muted-foreground">Est. Tax</span>
              </div>
              <p className="text-xl font-bold text-warning">{formatCurrency(estimatedTax)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
            <Button variant="outline" onClick={() => setShowOCRScanner(true)}>
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Scan Receipt</span>
            </Button>
            <Button variant="outline" onClick={handleCSVImport}>
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Import CSV</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/calculator', { 
                state: { prefill: { turnover: totalIncome, expenses: deductibleExpenses } } 
              })}
              disabled={totalIncome === 0}
            >
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Use in Calculator</span>
            </Button>
            <Button variant="outline" onClick={() => setShowCharts(!showCharts)}>
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">{showCharts ? 'Hide' : 'Show'} Charts</span>
            </Button>
            <Button 
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && <span className="ml-1 text-xs">!</span>}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="glass rounded-xl p-4 mb-6 shadow-card">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Type</Label>
                  <Select value={filterType} onValueChange={(v) => setFilterType(v as 'all' | 'income' | 'expense')}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="income">Income Only</SelectItem>
                      <SelectItem value="expense">Expenses Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Category</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {savedBusinesses.length > 0 && (
                  <div className="space-y-2 sm:col-span-2 lg:col-span-4">
                    <Label className="text-sm">Business</Label>
                    <Select value={filterBusinessId} onValueChange={setFilterBusinessId}>
                      <SelectTrigger className="w-full sm:w-[280px]">
                        <SelectValue placeholder="All businesses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Businesses</SelectItem>
                        {savedBusinesses.map((business) => (
                          <SelectItem key={business.id} value={business.id}>{business.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Charts Section */}
          {showCharts && filteredExpenses.length > 0 && (
            <div className="neumorphic p-6 mb-6">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <PieChart className="h-5 w-5 text-primary" />
                </div>
                Expense Analytics
              </h2>
              <ExpenseCharts expenses={filteredExpenses} />
            </div>
          )}

          {/* Expense List */}
          <div className="glass-frosted rounded-xl p-6 shadow-futuristic">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
              </div>
              Transactions ({filteredExpenses.length})
            </h2>

            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                  <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  {filterBusinessId !== 'all' ? 'No entries for this business' : 'No entries yet'}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4" />
                    Add Entry
                  </Button>
                  <Button variant="outline" onClick={handleCSVImport}>
                    <Upload className="h-4 w-4" />
                    Import Mock CSV
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense) => {
                  const businessName = getBusinessName(expense.businessId);
                  return (
                    <div key={expense.id} className="neumorphic-sm bg-card/80 p-4 flex items-center gap-4 transition-all hover:shadow-card">
                      <div className="text-2xl p-2 rounded-xl bg-muted/30">{getCategoryIcon(expense.category)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{expense.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(expense.date).toLocaleDateString()}</span>
                          {businessName && <span>• {businessName}</span>}
                          {expense.isDeductible && (
                            <span className="px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">Deductible</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${expense.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                          {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteExpense(expense.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Expense Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Add Entry
            </DialogTitle>
            <DialogDescription>Add a new income or expense entry</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newExpense.category} onValueChange={(v) => setNewExpense({ ...newExpense, category: v as Expense['category'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="e.g., Client payment, Office rent"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (₦)</Label>
              <Input
                type="number"
                placeholder="0"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              />
            </div>
            {savedBusinesses.length > 0 && (
              <div className="space-y-2">
                <Label>Business (optional)</Label>
                <Select value={newExpense.businessId || "none"} onValueChange={(v) => setNewExpense({ ...newExpense, businessId: v === "none" ? "" : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No business</SelectItem>
                    {savedBusinesses.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddExpense}>Add Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OCR Receipt Scanner */}
      <OCRReceiptScanner
        open={showOCRScanner}
        onOpenChange={setShowOCRScanner}
        onReceiptParsed={async (data) => {
          if (!user) {
            toast.error("Please sign in to add expenses");
            return;
          }

          const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === data.category);
          const expenseType = categoryInfo?.type || 'expense';
          const isDeductible = expenseType === 'expense' ? (categoryInfo?.deductible ?? false) : false;

          const { data: dbData, error } = await supabase
            .from('expenses')
            .insert({
              user_id: user.id,
              date: data.date,
              description: data.description,
              amount: data.amount,
              category: data.category,
              type: expenseType,
              is_deductible: isDeductible,
            })
            .select()
            .single();

          if (error) {
            console.error('Error adding expense:', error);
            toast.error('Failed to add expense from receipt');
            return;
          }

          const expense: Expense = {
            id: dbData.id,
            date: dbData.date,
            description: dbData.description || '',
            amount: Number(dbData.amount),
            category: dbData.category as Expense['category'],
            type: dbData.type as 'income' | 'expense',
            isDeductible: dbData.is_deductible,
          };

          setExpenses(prev => [expense, ...prev]);
          notifyExpenseAdded(expense.description, expense.amount, expense.type === 'income');
        }}
      />
    </div>
  );
};

export default Expenses;
