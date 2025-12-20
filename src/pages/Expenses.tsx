import { useState } from "react";
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
  Lock,
  FileSpreadsheet,
  PieChart
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
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'other' as Expense['category'],
  });

  const isBasicPlus = tier !== 'free';

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

  const handleAddExpense = () => {
    if (!newExpense.description.trim() || !newExpense.amount) {
      toast.error("Please fill all fields");
      return;
    }

    const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === newExpense.category);
    const expense: Expense = {
      id: crypto.randomUUID(),
      date: newExpense.date,
      description: newExpense.description.trim(),
      amount: Number(newExpense.amount),
      category: newExpense.category,
      type: categoryInfo?.type || 'expense',
      isDeductible: categoryInfo?.type === 'expense' ? (categoryInfo?.deductible ?? false) : false,
    };

    setExpenses(prev => [expense, ...prev]);
    setShowAddDialog(false);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      category: 'other',
    });
    toast.success("Entry added");
  };

  const handleCSVImport = () => {
    // Mock CSV import
    const mockData: Expense[] = [
      { id: crypto.randomUUID(), date: '2025-12-01', description: 'Client Payment - Project A', amount: 500000, category: 'income', type: 'income', isDeductible: false },
      { id: crypto.randomUUID(), date: '2025-12-05', description: 'Office Rent December', amount: 150000, category: 'rent', type: 'expense', isDeductible: true },
      { id: crypto.randomUUID(), date: '2025-12-10', description: 'Google Ads Campaign', amount: 45000, category: 'marketing', type: 'expense', isDeductible: true },
      { id: crypto.randomUUID(), date: '2025-12-12', description: 'Staff Salaries', amount: 350000, category: 'salary', type: 'expense', isDeductible: true },
      { id: crypto.randomUUID(), date: '2025-12-15', description: 'Freelance Work', amount: 200000, category: 'income', type: 'income', isDeductible: false },
    ];

    setExpenses(prev => [...mockData, ...prev]);
    toast.success("Imported 5 entries from CSV (mock data)");
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast.success("Entry deleted");
  };

  // Calculate summaries
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const deductibleExpenses = expenses.filter(e => e.isDeductible).reduce((sum, e) => sum + e.amount, 0);
  const taxableIncome = Math.max(0, totalIncome - deductibleExpenses);
  
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

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6 animate-slide-up">
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
          </div>

          {/* Expense List */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card animate-slide-up">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Transactions ({expenses.length})
            </h2>

            {expenses.length === 0 ? (
              <div className="text-center py-10">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No entries yet</p>
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
                {expenses.map((expense) => (
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
                ))}
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
            Entries are stored locally. For accurate tax filing, consult a professional.
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
            <Button variant="hero" onClick={handleAddExpense}>
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expenses;