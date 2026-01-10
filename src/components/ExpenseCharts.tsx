import { useMemo, useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/taxCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, BarChart3 } from "lucide-react";
import { ReusablePieChart, PieChartDataItem } from "@/components/ui/reusable-pie-chart";

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
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
      .slice(-3); // Last 3 months
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
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
      {/* Expense Category Pie Chart Card */}
      <Card className="glass-frosted shadow-futuristic border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
            <ReusablePieChart
              data={categoryData}
              height={320}
              innerRadius={50}
              outerRadius={85}
              showCenterLabel
              selectedIndex={activeIndex}
              onSliceClick={(_, index) => setActiveIndex(activeIndex === index ? null : index)}
              centerLabelFormatter={(item, total) => (
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(item.value)}</p>
                  <p className="text-xs text-muted-foreground">
                    {((item.value / total) * 100).toFixed(1)}%
                  </p>
                </div>
              )}
              legendClassName="grid grid-cols-2 gap-2"
              emptyMessage="No expense data yet"
            />
            <div className={`mt-4 text-center transition-all duration-500 delay-500 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
            </div>
        </CardContent>
      </Card>

      {/* Monthly Income vs Expenses Bar Chart Card */}
      <Card className="glass-frosted shadow-futuristic border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-accent" />
            </div>
            Monthly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className={`transition-all duration-700 ease-out delay-150 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {monthlyData.length > 0 ? (
              <div className="h-[28rem]">
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
                    <Bar 
                      dataKey="income" 
                      name="Income" 
                      fill="#22c55e" 
                      radius={[4, 4, 0, 0]}
                      animationBegin={300}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                    <Bar 
                      dataKey="expenses" 
                      name="Expenses" 
                      fill="#ef4444" 
                      radius={[4, 4, 0, 0]}
                      animationBegin={400}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[28rem] flex items-center justify-center text-muted-foreground">
                Add entries to see monthly trends
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
