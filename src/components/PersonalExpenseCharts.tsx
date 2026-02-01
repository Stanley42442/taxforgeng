import { useMemo, useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/taxCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, BarChart3, Home, Shield, GraduationCap, Banknote, Heart, Users, Accessibility, Building } from "lucide-react";
import { ReusablePieChart } from "@/components/ui/reusable-pie-chart";
import type { PersonalExpense, AnnualTotals } from "@/hooks/usePersonalExpenses";
import { PERSONAL_EXPENSE_CATEGORIES, getCategoryById } from "@/lib/personalExpenseCategories";

interface PersonalExpenseChartsProps {
  expenses: PersonalExpense[];
  annualTotals: AnnualTotals;
}

const PERSONAL_CATEGORY_COLORS: Record<string, string> = {
  rent: '#3b82f6',           // Blue
  pension_contribution: '#22c55e', // Green
  nhf_contribution: '#10b981',     // Emerald
  health_insurance: '#ec4899',     // Pink
  life_insurance: '#8b5cf6',       // Purple
  child_education: '#f59e0b',      // Amber
  dependent_care: '#06b6d4',       // Cyan
  disability_support: '#6366f1',   // Indigo
  gratuity_received: '#f97316',    // Orange
  other: '#6b7280',               // Gray
};

const PERSONAL_CATEGORY_LABELS: Record<string, string> = {
  rent: 'Rent',
  pension_contribution: 'Pension',
  nhf_contribution: 'NHF',
  health_insurance: 'Health Insurance',
  life_insurance: 'Life Insurance',
  child_education: 'Child Education',
  dependent_care: 'Dependent Care',
  disability_support: 'Disability',
  gratuity_received: 'Gratuity',
  other: 'Other',
};

export const PersonalExpenseCharts = ({ expenses, annualTotals }: PersonalExpenseChartsProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Category breakdown for pie chart from annualTotals
  const categoryData = useMemo(() => {
    return Object.entries(annualTotals)
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount]) => ({
        name: PERSONAL_CATEGORY_LABELS[category] || category,
        value: amount,
        color: PERSONAL_CATEGORY_COLORS[category] || '#6b7280',
      }))
      .sort((a, b) => b.value - a.value);
  }, [annualTotals]);

  // Monthly data for bar chart - group personal expenses by month
  const monthlyData = useMemo(() => {
    const monthTotals: Record<string, { month: string; total: number }> = {};
    
    expenses.forEach(e => {
      const date = new Date(e.start_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-NG', { month: 'short', year: '2-digit' });
      
      if (!monthTotals[monthKey]) {
        monthTotals[monthKey] = { month: monthLabel, total: 0 };
      }
      
      // Add the payment amount based on interval
      const amount = Number(e.amount);
      monthTotals[monthKey].total += amount;
    });
    
    return Object.entries(monthTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, data]) => data)
      .slice(-6); // Last 6 months
  }, [expenses]);

  const totalDeductible = Object.values(annualTotals).reduce((sum, val) => sum + val, 0);

  if (expenses.length === 0 && totalDeductible === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Add personal expenses to see breakdown
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
      {/* Personal Expense Category Pie Chart Card */}
      <Card className="glass-frosted shadow-futuristic border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-accent" />
            </div>
            Personal Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <>
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
                emptyMessage="No personal expense data"
              />
              <div className={`mt-4 text-center transition-all duration-500 delay-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}>
                <p className="text-sm text-muted-foreground">Total Deductible</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(totalDeductible)}</p>
              </div>
            </>
          ) : (
            <div className="h-[320px] flex items-center justify-center text-muted-foreground">
              No personal expenses recorded
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Personal Expenses Bar Chart Card */}
      <Card className="glass-frosted shadow-futuristic border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            Monthly Personal Expenses
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
                      tickFormatter={(value) => value >= 1000000 ? `₦${(value / 1000000).toFixed(1)}M` : `₦${(value / 1000).toFixed(0)}K`}
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
                      dataKey="total" 
                      name="Personal Expenses" 
                      fill="#8b5cf6" 
                      radius={[4, 4, 0, 0]}
                      animationBegin={300}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[28rem] flex items-center justify-center text-muted-foreground">
                Add personal expenses to see trends
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
