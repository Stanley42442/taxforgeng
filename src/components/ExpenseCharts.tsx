import { useMemo, useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/taxCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, BarChart3 } from "lucide-react";

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
  const [animationComplete, setAnimationComplete] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const pieContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger entrance animation after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    const animTimer = setTimeout(() => setAnimationComplete(true), 1200);
    return () => {
      clearTimeout(timer);
      clearTimeout(animTimer);
    };
  }, []);

  // Handle click outside pie chart to deselect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pieContainerRef.current && !pieContainerRef.current.contains(event.target as Node)) {
        setActiveIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePieClick = (data: any, index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

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
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-primary" />
            </div>
            Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className={`transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {categoryData.length > 0 ? (
              <div className="h-[20rem] relative" ref={pieContainerRef}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                      animationBegin={200}
                      animationDuration={1000}
                      animationEasing="ease-out"
                      onClick={handlePieClick}
                      style={{ cursor: 'pointer' }}
                    >
                      {categoryData.map((entry, index) => {
                        const isActive = activeIndex === index;
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={isActive ? 'hsl(var(--foreground))' : 'transparent'}
                            strokeWidth={isActive ? 3 : 0}
                            style={{
                              filter: activeIndex !== null && !isActive ? 'opacity(0.4)' : 'none',
                              transform: isActive ? 'scale(1.05)' : 'scale(1)',
                              transformOrigin: 'center',
                              transition: 'all 0.2s ease-out'
                            }}
                          />
                        );
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {activeIndex !== null && categoryData[activeIndex] && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{categoryData[activeIndex].name}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(categoryData[activeIndex].value)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((categoryData[activeIndex].value / categoryData.reduce((sum, e) => sum + e.value, 0)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[20rem] flex items-center justify-center text-muted-foreground">
                No expense data yet
              </div>
            )}
            {/* Color Key Legend */}
            {categoryData.length > 0 && (
              <div className={`mt-4 grid grid-cols-2 gap-2 transition-all duration-500 delay-300 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}>
                {categoryData.map((entry, index) => {
                  const total = categoryData.reduce((sum, e) => sum + e.value, 0);
                  const percent = ((entry.value / total) * 100).toFixed(0);
                  const isActive = activeIndex === index;
                  return (
                    <div 
                      key={`legend-${index}`} 
                      className={`flex items-center gap-2 text-sm cursor-pointer rounded-md p-1 transition-all ${
                        isActive ? 'bg-muted ring-2 ring-primary' : 'hover:bg-muted/50'
                      } ${activeIndex !== null && !isActive ? 'opacity-40' : ''}`}
                      onClick={() => setActiveIndex(isActive ? null : index)}
                    >
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-muted-foreground truncate">{entry.name}</span>
                      <span className="font-medium text-foreground ml-auto">{percent}%</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className={`mt-4 text-center transition-all duration-500 delay-500 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Income vs Expenses Bar Chart Card */}
      <Card className="glass-frosted shadow-futuristic border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-accent" />
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
