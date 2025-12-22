import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/taxCalculations";

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  isDeductible: boolean;
  businessId?: string;
}

interface ExpenseChartsProps {
  expenses: Expense[];
}

const CATEGORY_COLORS: Record<string, string> = {
  income: '#22c55e',
  rent: '#3b82f6',
  transport: '#8b5cf6',
  marketing: '#f59e0b',
  salary: '#ef4444',
  utilities: '#06b6d4',
  supplies: '#ec4899',
  other: '#6b7280',
};

const CATEGORY_LABELS: Record<string, string> = {
  income: 'Income',
  rent: 'Rent & Office',
  transport: 'Transport',
  marketing: 'Marketing',
  salary: 'Salaries',
  utilities: 'Utilities',
  supplies: 'Supplies',
  other: 'Other',
};

export const ExpenseCharts = ({ expenses }: ExpenseChartsProps) => {
  // Category breakdown for pie chart (expenses only)
  const categoryData = useMemo(() => {
    const expenseItems = expenses.filter(e => e.type === 'expense');
    const categoryTotals: Record<string, number> = {};
    
    expenseItems.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: CATEGORY_LABELS[category] || category,
        value: amount,
        color: CATEGORY_COLORS[category] || '#6b7280',
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Monthly data for bar chart
  const monthlyData = useMemo(() => {
    const monthTotals: Record<string, { month: string; income: number; expenses: number }> = {};
    
    expenses.forEach(e => {
      const date = new Date(e.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-NG', { month: 'short', year: '2-digit' });
      
      if (!monthTotals[monthKey]) {
        monthTotals[monthKey] = { month: monthLabel, income: 0, expenses: 0 };
      }
      
      if (e.type === 'income') {
        monthTotals[monthKey].income += e.amount;
      } else {
        monthTotals[monthKey].expenses += e.amount;
      }
    });
    
    return Object.entries(monthTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, data]) => data)
      .slice(-6); // Last 6 months
  }, [expenses]);

  const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Add some expenses to see charts
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Expense Category Pie Chart */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <h3 className="font-semibold text-foreground mb-4">Expense Breakdown</h3>
        {categoryData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No expense data yet
          </div>
        )}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      {/* Monthly Income vs Expenses Bar Chart */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <h3 className="font-semibold text-foreground mb-4">Monthly Overview</h3>
        {monthlyData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Add entries to see monthly trends
          </div>
        )}
      </div>
    </div>
  );
};
