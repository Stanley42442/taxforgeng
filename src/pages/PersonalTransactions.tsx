import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import logger from '@/lib/logger';
import { GlobalDateFilterBar } from '@/components/GlobalDateFilterBar';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { TransactionRowData } from '@/components/transactions/TransactionRow';
import { useDateRange } from '@/contexts/DateRangeContext';
import { PERSONAL_EXPENSE_CATEGORIES, getCategoryById } from '@/lib/personalExpenseCategories';
import {
  Wallet,
  Plus,
  TrendingUp,
  Calculator,
  RefreshCw,
  PiggyBank,
} from 'lucide-react';

interface PersonalExpense {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  payment_interval: string;
  start_date: string;
  end_date: string | null;
  tax_year: number;
  is_active: boolean;
  notes: string | null;
}

export default function PersonalTransactions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { computedRange } = useDateRange();
  
  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  // Fetch personal expenses
  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('personal_expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_date', format(computedRange.start, 'yyyy-MM-dd'))
      .lte('start_date', format(computedRange.end, 'yyyy-MM-dd'))
      .order('start_date', { ascending: false });

    if (error) {
      logger.error('Error fetching personal expenses:', error);
      toast.error('Failed to load transactions');
    } else {
      setExpenses(data || []);
    }
    setLoading(false);
  }, [user, computedRange]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('personal-transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'personal_expenses', filter: `user_id=eq.${user.id}` },
        () => fetchExpenses()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchExpenses]);

  // Transform to TransactionRowData
  const transactions: TransactionRowData[] = useMemo(() => {
    return expenses.map((e) => {
      const expenseDate = parseISO(e.start_date);
      const category = getCategoryById(e.category);
      // All personal expense categories are tax deductible by design
      const isDeductible = true;
      
      return {
        id: e.id,
        date: expenseDate,
        category: category?.name || e.category,
        description: e.description || '',
        amount: Number(e.amount),
        type: 'expense' as const, // Personal expenses are always expenses (tax deductions)
        status: (e.is_active ? 'active' : 'inactive') as 'active' | 'inactive',
        isDeductible,
      };
    });
  }, [expenses]);

  // Summary calculations
  const summary = useMemo(() => {
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    const deductible = transactions.filter(t => t.isDeductible).reduce((sum, t) => sum + t.amount, 0);
    return {
      total,
      deductible,
      count: transactions.length,
    };
  }, [transactions]);

  // Handle delete (soft delete by setting is_active to false)
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('personal_expenses')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      logger.error('Error deactivating expense:', error);
      toast.error('Failed to delete transaction');
    } else {
      toast.success('Transaction deleted', {
        action: {
          label: 'Undo',
          onClick: () => handleRestore(id),
        },
      });
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  // Handle restore
  const handleRestore = async (id: string) => {
    const { error } = await supabase
      .from('personal_expenses')
      .update({ is_active: true })
      .eq('id', id);

    if (error) {
      logger.error('Error restoring expense:', error);
      toast.error('Failed to restore transaction');
    } else {
      toast.success('Transaction restored');
      fetchExpenses();
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

  if (!user) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center max-w-md">
            <CardContent>
              <h2 className="text-xl font-semibold mb-4">Login Required</h2>
              <p className="text-muted-foreground mb-4">Please log in to view your transactions.</p>
              <Button onClick={() => navigate('/auth')}>Go to Login</Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Personal Transactions
            </h1>
            <p className="text-muted-foreground mt-1">
              Track tax-deductible personal expenses
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchExpenses} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate('/personal-expenses')} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Global Date Filter */}
        <GlobalDateFilterBar />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Expenses</p>
                <p className="text-lg font-bold">{formatCurrency(summary.total)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <PiggyBank className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tax Deductible</p>
                <p className="text-lg font-bold text-success">{formatCurrency(summary.deductible)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Transactions</p>
                <p className="text-lg font-bold">{summary.count}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Action */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Use in Tax Calculator</p>
                <p className="text-sm text-muted-foreground">Apply these deductions to your tax calculation</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/individual-calculator')}>
              Calculate Tax
            </Button>
          </div>
        </Card>

        {/* Transaction Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Transactions
            </CardTitle>
            <CardDescription>
              {format(computedRange.start, 'MMM d, yyyy')} — {format(computedRange.end, 'MMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionTable
              transactions={transactions}
              onDelete={handleDelete}
              onRestore={handleRestore}
              showBusiness={false}
              isLoading={loading}
              emptyMessage="No personal transactions found for this period"
              categories={PERSONAL_EXPENSE_CATEGORIES.map(c => c.name)}
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
