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
  Loader2
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

const Expenses = () => {
  const { tier, savedBusinesses } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterBusinessId, setFilterBusinessId] = useState<string>('all');
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'other' as Expense['category'],
    businessId: '' as string,
  });

  const isBasicPlus = tier !== 'free';

  // Fetch expenses from database
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

  if (!isBasicPlus) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-warning/10">
              <Crown className="h-10 w-10 text-warning" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Expense Tracking</h1>
            <p className="text-muted-foreground mb-6">
              Track income and expenses to get real-time tax estimates. Available on Basic+ plans.
            </p>
            <Button variant="hero" onClick={() => navigate('/pricing')}>
              <Crown className="h-4 w-4" />
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

  // Filter expenses by business
  const filteredExpenses = filterBusinessId === 'all' 
    ? expenses 
    : expenses.filter(e => e.businessId === filterBusinessId);

  // Calculate summaries from filtered expenses
  const totalIncome = filteredExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = filteredExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const deductibleExpenses = filteredExpenses.filter(e => e.isDeductible).reduce((sum, e) => sum + e.amount, 0);
  const taxableIncome = Math.max(0, totalIncome - deductibleExpenses);

  // Get business name helper
  const getBusinessName = (businessId?: string) => {
    if (!businessId) return null;
    const business = savedBusinesses.find(b => b.id === businessId);
    return business?.name || null;
  };
  
  // Estimate tax (simplified PIT bands for demo)
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

  const estimatedTax = estimateTax(taxableIncome);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <NavMenu />

      <main className="container mx-auto px-4 py-8 pb-20">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
              <Receipt className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Expense Tracking
            </h1>
            <p className="text-muted-foreground">
              Track income and expenses for real-time tax estimates
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-4 mb-6 animate-slide-up">
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-muted-foreground">Income</span>
              </div>
              <p className="text-xl font-bold text-success">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-sm text-muted-foreground">Expenses</span>
              </div>
              <p className="text-xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Deductible</span>
              </div>
              <p className="text-xl font-bold text-foreground">{formatCurrency(deductibleExpenses)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-warning" />
                <span className="text-sm text-muted-foreground">Est. Tax</span>
              </div>
              <p className="text-xl font-bold text-warning">{formatCurrency(estimatedTax)}</p>
            </div>
          </div>

          {/* Action Buttons & Filter */}
          <div className="flex flex-wrap items-center gap-3 mb-6 animate-slide-up">
            <Button variant="hero" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
            <Button variant="outline" onClick={handleCSVImport}>
              <Upload className="h-4 w-4" />
              Import CSV (Mock)
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/calculator', { 
                state: { 
                  prefill: { 
                    turnover: totalIncome, 
                    expenses: deductibleExpenses 
                  } 
                } 
              })}
              disabled={totalIncome === 0}
            >
              <Calculator className="h-4 w-4" />
              Use in Calculator
            </Button>
            {savedBusinesses.length > 0 && (
              <Select value={filterBusinessId} onValueChange={setFilterBusinessId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by business" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Businesses</SelectItem>
                  {savedBusinesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Expense List */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card animate-slide-up">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Transactions ({expenses.length})
            </h2>

            {filteredExpenses.length === 0 ? (
              <div className="text-center py-10">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  {filterBusinessId !== 'all' ? 'No entries for this business' : 'No entries yet'}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => setShowAddDialog(true)}>
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
              <div className="space-y-2">
                {filteredExpenses.map((expense) => {
                  const businessName = getBusinessName(expense.businessId);
                  return (
                    <div 
                      key={expense.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getCategoryIcon(expense.category)}</span>
                        <div>
                          <p className="font-medium text-foreground text-sm">{expense.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString('en-NG', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                            {businessName && (
                              <span className="ml-2 text-primary">• {businessName}</span>
                            )}
                            {expense.isDeductible && (
                              <span className="ml-2 text-success">• Deductible</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${expense.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                          {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tax Estimate Card */}
          {expenses.length > 0 && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card animate-slide-up">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Real-Time Tax Estimate
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-1">Net Income</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(totalIncome - totalExpenses)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-1">Taxable Income</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(taxableIncome)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10">
                  <p className="text-sm text-muted-foreground mb-1">Estimated Tax (PIT)</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(estimatedTax)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Estimate based on 2026 PIT rules. Actual tax may vary. Use the full calculator for accurate results.
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            Expenses are saved to your account and persist across sessions.
          </p>
        </div>
      </main>

      {/* Add Entry Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Entry</DialogTitle>
            <DialogDescription>
              Add an income or expense entry to track
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense(prev => ({ 
                    ...prev, 
                    category: value as Expense['category'] 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label} {cat.type === 'income' ? '(Income)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {savedBusinesses.length > 0 && (
              <div>
                <Label htmlFor="business">Link to Business (Optional)</Label>
                <Select
                  value={newExpense.businessId}
                  onValueChange={(value) => setNewExpense(prev => ({ ...prev, businessId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No business</SelectItem>
                    {savedBusinesses.map((business) => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Client Payment, Office Rent"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExpense}>Add Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expenses;
