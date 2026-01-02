import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { calculateTax, formatCurrency, type TaxInputs } from "@/lib/taxCalculations";
import { TrendingUp, Calendar, ArrowRight, Sparkles, AlertTriangle, Check } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";

interface YearProjection {
  year: number;
  turnover: number;
  expenses: number;
  taxPayable: number;
  effectiveRate: number;
  status: 'exempt' | 'small' | 'medium' | 'large';
  citRate: number;
}

interface MultiYearProjectionProps {
  onClose?: () => void;
}

const STATUS_INFO = {
  exempt: { label: 'Exempt', color: 'hsl(var(--success))', description: '0% CIT - Turnover < ₦25M' },
  small: { label: 'Small Company', color: 'hsl(var(--info))', description: '0% CIT (2026+) - Turnover ₦25M-₦50M' },
  medium: { label: 'Medium Company', color: 'hsl(var(--warning))', description: '20% CIT - Turnover ₦50M-₦500M' },
  large: { label: 'Large Company', color: 'hsl(var(--destructive))', description: '30% CIT - Turnover > ₦500M' },
};

export const MultiYearProjection = ({ onClose }: MultiYearProjectionProps) => {
  const [startingTurnover, setStartingTurnover] = useState(20000000); // ₦20M
  const [growthRate, setGrowthRate] = useState(25); // 25% annual growth
  const [expenseRatio, setExpenseRatio] = useState(30); // 30% expenses
  const [projectionYears, setProjectionYears] = useState(5);

  // Calculate projections for each year
  const calculateProjections = (): YearProjection[] => {
    const projections: YearProjection[] = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < projectionYears; i++) {
      const year = currentYear + i;
      const turnover = startingTurnover * Math.pow(1 + growthRate / 100, i);
      const expenses = turnover * (expenseRatio / 100);
      
      // Determine company status
      let status: YearProjection['status'];
      let citRate: number;
      
      if (turnover < 25000000) {
        status = 'exempt';
        citRate = 0;
      } else if (turnover < 50000000) {
        status = 'small';
        citRate = 0; // 2026 rules
      } else if (turnover < 500000000) {
        status = 'medium';
        citRate = 20;
      } else {
        status = 'large';
        citRate = 30;
      }

      const taxInputs: TaxInputs = {
        entityType: 'company',
        turnover,
        expenses,
        rentPaid: 0,
        vatableSales: 0,
        vatablePurchases: 0,
        rentalIncome: 0,
        consultancyIncome: 0,
        dividendIncome: 0,
        capitalGains: 0,
        foreignIncome: 0,
        fixedAssets: turnover * 0.2, // Assume 20% in fixed assets
        use2026Rules: true,
      };

      const result = calculateTax(taxInputs);

      projections.push({
        year,
        turnover,
        expenses,
        taxPayable: result.totalTaxPayable,
        effectiveRate: result.effectiveRate,
        status,
        citRate,
      });
    }

    return projections;
  };

  const projections = calculateProjections();
  
  // Find transition points
  const transitions = projections.reduce<{ year: number; from: string; to: string }[]>((acc, proj, idx) => {
    if (idx > 0 && projections[idx - 1].status !== proj.status) {
      acc.push({
        year: proj.year,
        from: STATUS_INFO[projections[idx - 1].status].label,
        to: STATUS_INFO[proj.status].label,
      });
    }
    return acc;
  }, []);

  // Calculate totals
  const totalTax = projections.reduce((sum, p) => sum + p.taxPayable, 0);
  const totalTurnover = projections.reduce((sum, p) => sum + p.turnover, 0);
  const avgEffectiveRate = totalTax / totalTurnover * 100;

  // Chart data
  const chartData = projections.map(p => ({
    year: p.year.toString(),
    turnover: p.turnover / 1000000, // In millions
    tax: p.taxPayable / 1000000,
    rate: p.effectiveRate,
  }));

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>Starting Turnover</Label>
          <Input
            type="number"
            value={startingTurnover}
            onChange={(e) => setStartingTurnover(Number(e.target.value) || 0)}
            placeholder="20000000"
          />
          <p className="text-xs text-muted-foreground">{formatCurrency(startingTurnover)}</p>
        </div>

        <div className="space-y-2">
          <Label>Annual Growth Rate: {growthRate}%</Label>
          <Slider
            value={[growthRate]}
            onValueChange={([v]) => setGrowthRate(v)}
            min={0}
            max={100}
            step={5}
          />
        </div>

        <div className="space-y-2">
          <Label>Expense Ratio: {expenseRatio}%</Label>
          <Slider
            value={[expenseRatio]}
            onValueChange={([v]) => setExpenseRatio(v)}
            min={10}
            max={80}
            step={5}
          />
        </div>

        <div className="space-y-2">
          <Label>Projection Years: {projectionYears}</Label>
          <Slider
            value={[projectionYears]}
            onValueChange={([v]) => setProjectionYears(v)}
            min={3}
            max={10}
            step={1}
          />
        </div>
      </div>

      {/* Transition Alerts */}
      {transitions.length > 0 && (
        <div className="space-y-2">
          {transitions.map((t, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20"
            >
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
              <p className="text-sm">
                <strong>Year {t.year}:</strong> Your business transitions from{' '}
                <span className="font-semibold">{t.from}</span> to{' '}
                <span className="font-semibold">{t.to}</span> status
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Turnover vs Tax Projection (₦ Millions)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="year" className="text-muted-foreground" fontSize={12} />
              <YAxis className="text-muted-foreground" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => [
                  `₦${value.toFixed(2)}M`,
                  name === 'turnover' ? 'Turnover' : 'Tax'
                ]}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="turnover" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary) / 0.2)"
                name="Turnover (₦M)"
              />
              <Area 
                type="monotone" 
                dataKey="tax" 
                stroke="hsl(var(--destructive))" 
                fill="hsl(var(--destructive) / 0.2)"
                name="Tax (₦M)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Year-by-Year Breakdown */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-3 font-semibold">Year</th>
                <th className="text-right p-3 font-semibold">Turnover</th>
                <th className="text-right p-3 font-semibold">Expenses</th>
                <th className="text-right p-3 font-semibold">Tax</th>
                <th className="text-right p-3 font-semibold">Rate</th>
                <th className="text-left p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-background' : 'bg-secondary/10'}>
                  <td className="p-3 font-medium">{p.year}</td>
                  <td className="p-3 text-right">{formatCurrency(p.turnover)}</td>
                  <td className="p-3 text-right text-muted-foreground">{formatCurrency(p.expenses)}</td>
                  <td className="p-3 text-right font-medium text-destructive">{formatCurrency(p.taxPayable)}</td>
                  <td className="p-3 text-right">{p.effectiveRate.toFixed(1)}%</td>
                  <td className="p-3">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${STATUS_INFO[p.status].color}20`,
                        color: STATUS_INFO[p.status].color,
                      }}
                    >
                      {STATUS_INFO[p.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-secondary/30 font-semibold">
                <td className="p-3">Total</td>
                <td className="p-3 text-right">{formatCurrency(totalTurnover)}</td>
                <td className="p-3 text-right text-muted-foreground">-</td>
                <td className="p-3 text-right text-destructive">{formatCurrency(totalTax)}</td>
                <td className="p-3 text-right">{avgEffectiveRate.toFixed(1)}%</td>
                <td className="p-3">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          Key Insights
        </h3>
        <div className="space-y-2">
          {projections[0].status === 'exempt' && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
              <Check className="h-4 w-4 text-success mt-0.5" />
              <p className="text-sm text-success">
                Starting below ₦25M threshold means 0% CIT in year one - maximize this period!
              </p>
            </div>
          )}
          {transitions.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-info/10 border border-info/20">
              <AlertTriangle className="h-4 w-4 text-info mt-0.5" />
              <p className="text-sm text-info">
                You'll cross {transitions.length} tax threshold{transitions.length > 1 ? 's' : ''} during this period. 
                Plan deductible expenses accordingly.
              </p>
            </div>
          )}
          {avgEffectiveRate > 15 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <TrendingUp className="h-4 w-4 text-warning mt-0.5" />
              <p className="text-sm text-warning">
                Average effective rate of {avgEffectiveRate.toFixed(1)}% is significant. 
                Consider tax-efficient structures like holding companies or export incentives.
              </p>
            </div>
          )}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Over {projectionYears} years at {growthRate}% growth, you'll pay approximately{' '}
              <strong className="text-foreground">{formatCurrency(totalTax)}</strong> in total taxes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiYearProjection;
