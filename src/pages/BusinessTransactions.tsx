import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format, isPast, isToday, parseISO } from "date-fns";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import logger from "@/lib/logger";
import { GlobalDateFilterBar } from "@/components/GlobalDateFilterBar";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionRowData } from "@/components/transactions/TransactionRow";
import { useDateRange } from "@/contexts/DateRangeContext";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import {
  Receipt,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/taxCalculations";
import { isWithinInterval } from "date-fns";

interface BusinessExpense {
  id: string;
  date: string;
  description: string | null;
  amount: number;
  category: string;
  type: string;
  is_deductible: boolean;
  business_id: string | null;
  deleted_at: string | null;
}

export default function BusinessTransactions() {
  const { tier, savedBusinesses } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { computedRange } = useDateRange();
  
  const [expenses, setExpenses] = useState<BusinessExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBusinessId, setFilterBusinessId] = useState<string>('all');

  const isStarterPlus = tier !== 'free';

  // Fetch expenses
  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .gte('date', format(computedRange.start, 'yyyy-MM-dd'))
      .lte('date', format(computedRange.end, 'yyyy-MM-dd'))
      .order('date', { ascending: false });

    if (error) {
      logger.error('Error fetching expenses:', error);
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
      .channel('business-transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${user.id}` },
        () => fetchExpenses()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchExpenses]);

  // Transform to TransactionRowData
  const transactions: TransactionRowData[] = useMemo(() => {
    let filtered = expenses;
    
    // Filter by business
    if (filterBusinessId !== 'all') {
      filtered = filtered.filter(e => e.business_id === filterBusinessId);
    }

    return filtered.map((e) => {
      const expenseDate = parseISO(e.date);
      const business = savedBusinesses.find(b => b.id === e.business_id);
      
      return {
        id: e.id,
        date: expenseDate,
        category: e.category,
        description: e.description || '',
        amount: Number(e.amount),
        type: (e.type === 'income' ? 'income' : 'expense') as 'income' | 'expense',
        status: (isPast(expenseDate) || isToday(expenseDate) ? 'cleared' : 'pending') as 'cleared' | 'pending',
        businessName: business?.name,
        isDeductible: e.is_deductible,
        isDeleted: !!e.deleted_at,
      };
    });
  }, [expenses, filterBusinessId, savedBusinesses]);

  // Summary calculations
  const summary = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      net: income - expense,
      count: transactions.length,
    };
  }, [transactions]);

  // Handle delete
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      logger.error('Error deleting expense:', error);
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
      .from('expenses')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) {
      logger.error('Error restoring expense:', error);
      toast.error('Failed to restore transaction');
    } else {
      toast.success('Transaction restored');
      fetchExpenses();
    }
  };

  // Upgrade prompt for free tier
  if (!isStarterPlus) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <UpgradePrompt
            feature="Business Transactions"
            requiredTier="starter"
          />
        </div>
      </PageLayout>
    );
  }

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
              Business Transactions
            </h1>
            <p className="text-muted-foreground mt-1">
              Track income and expenses across your businesses
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchExpenses} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate('/expenses')} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Global Date Filter */}
        <GlobalDateFilterBar />

        {/* Business Filter */}
        {savedBusinesses.length > 1 && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by business:</span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterBusinessId === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterBusinessId('all')}
              >
                All Businesses
              </Button>
              {savedBusinesses.map(b => (
                <Button
                  key={b.id}
                  variant={filterBusinessId === b.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterBusinessId(b.id)}
                >
                  {b.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Income</p>
                <p className="text-lg font-bold text-success">{formatCurrency(summary.income)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expenses</p>
                <p className="text-lg font-bold text-destructive">{formatCurrency(summary.expense)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Net</p>
                <p className={`text-lg font-bold ${summary.net >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(summary.net)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Receipt className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Transactions</p>
                <p className="text-lg font-bold">{summary.count}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transaction Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
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
              showBusiness={savedBusinesses.length > 0}
              isLoading={loading}
              emptyMessage="No transactions found for this period"
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
