import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Loader2,
  Sparkles,
  Calendar,
  PiggyBank,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/taxCalculations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface ExpenseAnalyticsProps {
  expenses: Expense[];
  businessName?: string;
}

interface SpendingPattern {
  category: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentChange: number;
  avgMonthly: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  income: 'Income',
  rent: 'Rent & Office',
  transport: 'Transport & Travel',
  marketing: 'Marketing & Ads',
  salary: 'Salaries & Wages',
  utilities: 'Utilities',
  supplies: 'Supplies & Equipment',
  other: 'Other Expenses',
};

export const ExpenseAnalytics = ({ expenses, businessName }: ExpenseAnalyticsProps) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightGenerated, setInsightGenerated] = useState(false);

  // Calculate monthly data for the last 6 months
  const monthlyData = useMemo<MonthlyData[]>(() => {
    const months: Record<string, MonthlyData> = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[key] = {
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        income: 0,
        expenses: 0,
        net: 0,
      };
    }

    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        if (expense.type === 'income') {
          months[key].income += expense.amount;
        } else {
          months[key].expenses += expense.amount;
        }
        months[key].net = months[key].income - months[key].expenses;
      }
    });

    return Object.values(months);
  }, [expenses]);

  // Calculate spending patterns by category
  const spendingPatterns = useMemo<SpendingPattern[]>(() => {
    const categories = ['rent', 'transport', 'marketing', 'salary', 'utilities', 'supplies', 'other'];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return categories.map(category => {
      const categoryExpenses = expenses.filter(e => e.category === category && e.type === 'expense');
      
      // Get last 3 months of data
      const monthlyTotals: number[] = [];
      for (let i = 2; i >= 0; i--) {
        const monthExpenses = categoryExpenses.filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === (currentMonth - i + 12) % 12 && 
                 (i > currentMonth ? d.getFullYear() === currentYear - 1 : d.getFullYear() === currentYear);
        });
        monthlyTotals.push(monthExpenses.reduce((sum, e) => sum + e.amount, 0));
      }

      const avgMonthly = monthlyTotals.reduce((a, b) => a + b, 0) / 3;
      const recentAvg = (monthlyTotals[1] + monthlyTotals[2]) / 2;
      const olderAvg = monthlyTotals[0];
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      let percentChange = 0;
      
      if (olderAvg > 0) {
        percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;
        if (percentChange > 10) trend = 'increasing';
        else if (percentChange < -10) trend = 'decreasing';
      }

      return {
        category,
        trend,
        percentChange,
        avgMonthly,
      };
    }).filter(p => p.avgMonthly > 0).sort((a, b) => b.avgMonthly - a.avgMonthly);
  }, [expenses]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    });

    const currentIncome = currentMonthExpenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const currentExpense = currentMonthExpenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    const lastIncome = lastMonthExpenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const lastExpense = lastMonthExpenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);

    const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpense) / currentIncome) * 100 : 0;
    const incomeGrowth = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;
    const expenseGrowth = lastExpense > 0 ? ((currentExpense - lastExpense) / lastExpense) * 100 : 0;

    // Find highest spending category this month
    const categoryTotals: Record<string, number> = {};
    currentMonthExpenses.filter(e => e.type === 'expense').forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

    return {
      currentIncome,
      currentExpense,
      savingsRate,
      incomeGrowth,
      expenseGrowth,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      netPosition: currentIncome - currentExpense,
    };
  }, [expenses]);

  const generateAIInsight = async () => {
    if (expenses.length < 3) {
      toast.error('Need at least 3 transactions for AI insights');
      return;
    }

    setLoadingInsight(true);
    try {
      const summaryData = {
        totalTransactions: expenses.length,
        monthlyData: monthlyData.slice(-3),
        topPatterns: spendingPatterns.slice(0, 3),
        metrics: {
          savingsRate: metrics.savingsRate.toFixed(1),
          incomeGrowth: metrics.incomeGrowth.toFixed(1),
          expenseGrowth: metrics.expenseGrowth.toFixed(1),
          topCategory: metrics.topCategory,
        },
        businessName: businessName || 'Business',
      };

      const { data, error } = await supabase.functions.invoke('expense-insights', {
        body: { summaryData }
      });

      if (error) throw error;
      
      setAiInsight(data.insight);
      setInsightGenerated(true);
    } catch (error) {
      console.error('Error generating insight:', error);
      toast.error('Failed to generate AI insight');
    } finally {
      setLoadingInsight(false);
    }
  };

  if (expenses.length === 0) {
    return (
      <Card className="p-6 text-center">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Add some transactions to see analytics</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Savings Rate</span>
          </div>
          <p className={`text-xl font-bold ${metrics.savingsRate >= 0 ? 'text-success' : 'text-destructive'}`}>
            {metrics.savingsRate.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.savingsRate >= 20 ? 'Great!' : metrics.savingsRate >= 0 ? 'Could improve' : 'Overspending'}
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Income Trend</span>
          </div>
          <p className={`text-xl font-bold ${metrics.incomeGrowth >= 0 ? 'text-success' : 'text-destructive'}`}>
            {metrics.incomeGrowth >= 0 ? '+' : ''}{metrics.incomeGrowth.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">vs last month</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-warning" />
            <span className="text-xs text-muted-foreground">Expense Trend</span>
          </div>
          <p className={`text-xl font-bold ${metrics.expenseGrowth <= 0 ? 'text-success' : 'text-destructive'}`}>
            {metrics.expenseGrowth >= 0 ? '+' : ''}{metrics.expenseGrowth.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">vs last month</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-accent-foreground" />
            <span className="text-xs text-muted-foreground">Net Position</span>
          </div>
          <p className={`text-xl font-bold ${metrics.netPosition >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(Math.abs(metrics.netPosition))}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.netPosition >= 0 ? 'Profit' : 'Loss'} this month
          </p>
        </Card>
      </div>

      {/* Spending Patterns */}
      {spendingPatterns.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Spending Patterns
          </h3>
          <div className="space-y-3">
            {spendingPatterns.slice(0, 5).map((pattern) => (
              <div key={pattern.category} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm">{CATEGORY_LABELS[pattern.category]}</span>
                  {pattern.trend === 'increasing' && (
                    <span className="flex items-center gap-1 text-xs text-destructive">
                      <TrendingUp className="h-3 w-3" />
                      +{pattern.percentChange.toFixed(0)}%
                    </span>
                  )}
                  {pattern.trend === 'decreasing' && (
                    <span className="flex items-center gap-1 text-xs text-success">
                      <TrendingDown className="h-3 w-3" />
                      {pattern.percentChange.toFixed(0)}%
                    </span>
                  )}
                  {pattern.trend === 'stable' && (
                    <span className="text-xs text-muted-foreground">Stable</span>
                  )}
                </div>
                <span className="text-sm font-medium">{formatCurrency(pattern.avgMonthly)}/mo</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Monthly Trend Chart */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          6-Month Overview
        </h3>
        <div className="space-y-3">
          {monthlyData.map((month, idx) => {
            const maxValue = Math.max(...monthlyData.map(m => Math.max(m.income, m.expenses)));
            const incomeWidth = maxValue > 0 ? (month.income / maxValue) * 100 : 0;
            const expenseWidth = maxValue > 0 ? (month.expenses / maxValue) * 100 : 0;
            
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium w-16">{month.month}</span>
                  <span className={month.net >= 0 ? 'text-success' : 'text-destructive'}>
                    {month.net >= 0 ? '+' : ''}{formatCurrency(month.net)}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-success rounded-full transition-all"
                      style={{ width: `${incomeWidth}%` }}
                    />
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-destructive rounded-full transition-all"
                      style={{ width: `${expenseWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-success rounded" /> Income
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-destructive rounded" /> Expenses
          </span>
        </div>
      </Card>

      {/* AI Insights */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Insights
          </h3>
          {insightGenerated && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={generateAIInsight}
              disabled={loadingInsight}
            >
              <RefreshCw className={`h-4 w-4 ${loadingInsight ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>

        {!insightGenerated && !loadingInsight && (
          <div className="text-center py-6">
            <Sparkles className="h-12 w-12 mx-auto text-primary/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              Get personalized insights and recommendations based on your spending patterns
            </p>
            <Button onClick={generateAIInsight} className="gap-2">
              <Brain className="h-4 w-4" />
              Generate AI Insights
            </Button>
          </div>
        )}

        {loadingInsight && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Analyzing your spending patterns...</span>
          </div>
        )}

        {insightGenerated && aiInsight && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{aiInsight}</div>
          </div>
        )}

        {/* Quick Alerts */}
        {metrics.topCategory && metrics.topCategory.amount > metrics.currentIncome * 0.4 && (
          <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">High spending alert</p>
              <p className="text-xs text-muted-foreground">
                {CATEGORY_LABELS[metrics.topCategory.name]} is {((metrics.topCategory.amount / metrics.currentIncome) * 100).toFixed(0)}% of your income this month
              </p>
            </div>
          </div>
        )}

        {metrics.savingsRate < 10 && metrics.currentIncome > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Low savings rate</p>
              <p className="text-xs text-muted-foreground">
                Consider reducing expenses to improve your {metrics.savingsRate.toFixed(1)}% savings rate
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
