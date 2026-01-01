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
  Sparkles
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
  const [showCharts, setShowCharts] = useState(false);
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
        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-accent glow-accent">
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
    
    // Send notification for added expense/income
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
          <div className="glass-frosted p-8 rounded-3xl inline-block">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">Loading expenses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative w-full max-w-full overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      
      <NavMenu />

      <main className="flex-1 relative z-10 py-6 pb-8 px-4 w-full overflow-x-hidden">
        <div className="w-full max-w-5xl mx-auto overflow-hidden">
          {/* Header */}
          <div className="text-center mb-10 animate-slide-up">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-primary glow-primary">
              <Receipt className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Expense Tracking
            </h1>
            <p className="text-lg text-muted-foreground">
              Track income and expenses for real-time tax estimates
            </p>
          </div>

          {/* Summary Cards - Glass Design */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8 animate-slide-up-delay-1">
            {[
              { icon: TrendingUp, value: totalIncome, label: 'Income', color: 'success', glowClass: 'glow-success' },
              { icon: TrendingDown, value: totalExpenses, label: 'Expenses', color: 'destructive', glowClass: '' },
              { icon: Receipt, value: deductibleExpenses, label: 'Deductible', color: 'primary', glowClass: '' },
              { icon: Calculator, value: estimatedTax, label: 'Est. Tax', color: 'warning', glowClass: 'glow-accent' }
            ].map((stat, idx) => (
              <div key={idx} className="glass hover-lift p-4 sm:p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg bg-${stat.color}/10 ${stat.glowClass}`}>
                    <stat.icon className={`h-4 w-4 text-${stat.color}`} />
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <p className={`text-xl sm:text-2xl font-bold text-${stat.color} truncate`}>
                  {formatCurrency(stat.value)}
                </p>
              </div>
            ))}
          </div>

          {/* Action Buttons - Premium Style */}
          <div className="flex flex-wrap items-center gap-3 mb-8 animate-slide-up-delay-2">
            <Button variant="glow" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
            <Button variant="glass" onClick={handleCSVImport}>
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Import CSV</span>
              <span className="sm:hidden">Import</span>
            </Button>
            <Button 
              variant="glass"
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
              <span className="hidden sm:inline">Use in Calculator</span>
              <span className="sm:hidden">Calculate</span>
            </Button>
            <Button 
              variant="glass"
              onClick={() => setShowCharts(!showCharts)}
            >
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">{showCharts ? 'Hide' : 'Show'} Charts</span>
              <span className="sm:hidden">Charts</span>
            </Button>
            {savedBusinesses.length > 0 && (
              <Select value={filterBusinessId} onValueChange={setFilterBusinessId}>
                <SelectTrigger className="w-[180px] glass border-0">
                  <SelectValue placeholder="Filter" />
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

          {/* Charts Section */}
          {showCharts && filteredExpenses.length > 0 && (
            <div className="glass-frosted rounded-3xl p-6 mb-8 animate-fade-in">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Expense Analytics
              </h2>
              <ExpenseCharts expenses={filteredExpenses} />
            </div>
          )}

          {/* Expense List - Glass Card */}
          <div className="glass-frosted rounded-3xl p-6 animate-fade-in">
            <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
              </div>
              Transactions ({filteredExpenses.length})
            </h2>

            {filteredExpenses.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Receipt className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-6">
                  {filterBusinessId !== 'all' ? 'No entries for this business' : 'No entries yet'}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="glow" onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4" />
                    Add Entry
                  </Button>
                  <Button variant="glass" onClick={handleCSVImport}>
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
                    <div 
                      key={expense.id}
                      className="glass p-4 rounded-xl hover-lift group"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl flex-shrink-0">{getCategoryIcon(expense.category)}</span>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{expense.description}</p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
                            <span>{new Date(expense.date).toLocaleDateString()}</span>
                            {businessName && (
                              <>
                                <span>•</span>
                                <span>{businessName}</span>
                              </>
                            )}
                            {expense.isDeductible && (
                              <span className="px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                                Deductible
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <span className={`font-bold text-lg ${expense.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                          {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
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
        </div>
      </main>

      {/* Add Expense Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="glass-frosted border-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Add Entry
            </DialogTitle>
            <DialogDescription>
              Add a new income or expense entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <div className="neumorphic-sm p-1">
                <Input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="border-0 bg-transparent"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={newExpense.category} 
                onValueChange={(v) => setNewExpense({ ...newExpense, category: v as Expense['category'] })}
              >
                <SelectTrigger className="neumorphic-sm border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <div className="neumorphic-sm p-1">
                <Input
                  placeholder="e.g., Client payment, Office rent"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="border-0 bg-transparent"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amount (₦)</Label>
              <div className="neumorphic-sm p-1">
                <Input
                  type="number"
                  placeholder="0"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="border-0 bg-transparent"
                />
              </div>
            </div>
            {savedBusinesses.length > 0 && (
              <div className="space-y-2">
                <Label>Business (optional)</Label>
                <Select 
                  value={newExpense.businessId || "none"} 
                  onValueChange={(v) => setNewExpense({ ...newExpense, businessId: v === "none" ? "" : v })}
                >
                  <SelectTrigger className="neumorphic-sm border-0">
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
            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button variant="glow" onClick={handleAddExpense}>
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expenses;
