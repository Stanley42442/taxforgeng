import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { calculateTax, formatCurrency, type TaxInputs } from "@/lib/taxCalculations";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import {
  TrendingUp,
  Calendar,
  ArrowRight,
  Info,
  Lightbulb
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface YearProjection {
  year: number;
  turnover: number;
  expenses: number;
  taxableIncome: number;
  totalTax: number;
  effectiveRate: number;
  isExempt: boolean;
  companySize: 'small' | 'medium' | 'large';
}

export const MultiYearProjection = () => {
  const { t } = useLanguage();
  const [startingTurnover, setStartingTurnover] = useState(20000000);
  const [startingExpenses, setStartingExpenses] = useState(8000000);
  const [growthRate, setGrowthRate] = useState(25);
  const [expenseGrowthRate, setExpenseGrowthRate] = useState(15);
  const [projectionYears, setProjectionYears] = useState(5);
  const [use2026Rules, setUse2026Rules] = useState(true);
  const [entityType, setEntityType] = useState<'company' | 'business_name'>('company');

  // Calculate projections
  const calculateProjections = (): YearProjection[] => {
    const projections: YearProjection[] = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < projectionYears; i++) {
      const year = currentYear + i;
      const turnover = Math.round(startingTurnover * Math.pow(1 + growthRate / 100, i));
      const expenses = Math.round(startingExpenses * Math.pow(1 + expenseGrowthRate / 100, i));

      const inputs: TaxInputs = {
        entityType,
        turnover,
        expenses,
        rentPaid: 0,
        vatableSales: turnover,
        vatablePurchases: expenses * 0.5,
        rentalIncome: 0,
        consultancyIncome: 0,
        dividendIncome: 0,
        capitalGains: 0,
        foreignIncome: 0,
        fixedAssets: turnover * 0.3, // Estimate
        use2026Rules,
      };

      const result = calculateTax(inputs);

      // Determine company size and exemption status
      let companySize: 'small' | 'medium' | 'large' = 'small';
      let isExempt = false;

      if (entityType === 'company') {
        if (use2026Rules) {
          if (turnover < 50000000) {
            companySize = 'small';
            isExempt = true; // 0% CIT for small companies
          } else if (turnover < 200000000) {
            companySize = 'medium';
          } else {
            companySize = 'large';
          }
        } else {
          if (turnover < 25000000) {
            companySize = 'small';
          } else if (turnover < 100000000) {
            companySize = 'medium';
          } else {
            companySize = 'large';
          }
        }
      }

      projections.push({
        year,
        turnover,
        expenses,
        taxableIncome: result.taxableIncome,
        totalTax: result.totalTaxPayable,
        effectiveRate: result.effectiveRate,
        isExempt,
        companySize,
      });
    }

    return projections;
  };

  const projections = calculateProjections();

  // Find the year when company transitions from exempt to taxed
  const transitionYear = projections.find((p, i) => 
    i > 0 && projections[i - 1].isExempt && !p.isExempt
  );

  // Calculate cumulative tax savings from exemption period
  const exemptYearsSavings = projections
    .filter(p => p.isExempt)
    .reduce((sum, p) => {
      // Estimate what tax would have been without exemption
      const estimatedTax = p.taxableIncome * (use2026Rules ? 0.25 : 0.30);
      return sum + estimatedTax;
    }, 0);

  // Format chart data
  const chartData = projections.map(p => ({
    year: p.year.toString(),
    Turnover: p.turnover / 1000000,
    'Tax Payable': p.totalTax / 1000000,
    'Effective Rate': p.effectiveRate,
  }));

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label className="text-sm mb-2 block">{t('form.startingTurnover')}</Label>
          <Input
            type="number"
            value={startingTurnover}
            onChange={(e) => setStartingTurnover(Number(e.target.value))}
          />
        </div>
        <div>
          <Label className="text-sm mb-2 block">{t('form.startingExpenses')}</Label>
          <Input
            type="number"
            value={startingExpenses}
            onChange={(e) => setStartingExpenses(Number(e.target.value))}
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm">{t('form.growthRate')}</Label>
            <span className="text-sm font-medium text-success">{growthRate}%/yr</span>
          </div>
          <Slider
            value={[growthRate]}
            onValueChange={([value]) => setGrowthRate(value)}
            min={0}
            max={100}
            step={5}
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm">{t('form.expenseGrowthRate')}</Label>
            <span className="text-sm font-medium text-destructive">{expenseGrowthRate}%/yr</span>
          </div>
          <Slider
            value={[expenseGrowthRate]}
            onValueChange={([value]) => setExpenseGrowthRate(value)}
            min={0}
            max={50}
            step={5}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm">{t('form.projectionYears')}:</Label>
          <Input
            type="number"
            value={projectionYears}
            onChange={(e) => setProjectionYears(Math.min(10, Math.max(1, Number(e.target.value))))}
            className="w-20"
            min={1}
            max={10}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={use2026Rules}
            onCheckedChange={setUse2026Rules}
          />
          <Label className="text-sm">{use2026Rules ? t('projection.2026Rules') : t('projection.pre2026Rules')}</Label>
        </div>
        <div className="flex gap-2">
          <Button
            variant={entityType === 'company' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEntityType('company')}
          >
            {t('entityType.company')}
          </Button>
          <Button
            variant={entityType === 'business_name' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEntityType('business_name')}
          >
            {t('entityType.businessName')}
          </Button>
        </div>
      </div>

      {/* Transition Alert */}
      {transitionYear && use2026Rules && entityType === 'company' && (
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-warning">{t('projection.taxTransition')} {transitionYear.year}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('projection.transitionDescription')}
              </p>
              <p className="text-sm text-success mt-2">
                {t('projection.estimatedSavings')}: {formatCurrency(exemptYearsSavings)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {t('projection.revenueVsTax')}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="year" className="text-xs" />
              <YAxis 
                yAxisId="left"
                tickFormatter={(v) => `₦${v}M`}
                className="text-xs"
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(v) => `${v}%`}
                className="text-xs"
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'Effective Rate') return [`${value.toFixed(1)}%`, name];
                  return [`₦${value.toFixed(1)}M`, name];
                }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="Turnover"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="Tax Payable"
                stroke="hsl(var(--destructive))"
                fill="hsl(var(--destructive))"
                fillOpacity={0.2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Effective Rate"
                stroke="hsl(var(--warning))"
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Year-by-Year Breakdown */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {t('projection.yearByYear')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-3">{t('table.year')}</th>
                <th className="text-right p-3">{t('table.turnover')}</th>
                <th className="text-right p-3">{t('table.taxableIncome')}</th>
                <th className="text-right p-3">{t('table.totalTax')}</th>
                <th className="text-right p-3">{t('table.effectiveRate')}</th>
                <th className="text-center p-3">{t('table.status')}</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p, i) => (
                <tr key={p.year} className={`border-t border-border ${p.isExempt ? 'bg-success/5' : ''}`}>
                  <td className="p-3 font-medium">{p.year}</td>
                  <td className="p-3 text-right">{formatCurrency(p.turnover)}</td>
                  <td className="p-3 text-right">{formatCurrency(p.taxableIncome)}</td>
                  <td className="p-3 text-right font-medium text-destructive">
                    {formatCurrency(p.totalTax)}
                  </td>
                  <td className="p-3 text-right">{p.effectiveRate.toFixed(1)}%</td>
                  <td className="p-3 text-center">
                    {p.isExempt ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
                        {t('status.exempt')}
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.companySize === 'small' ? 'bg-primary/20 text-primary' :
                        p.companySize === 'medium' ? 'bg-warning/20 text-warning' :
                        'bg-destructive/20 text-destructive'
                      }`}>
                        {t(`companySize.${p.companySize}`)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-warning" />
          {t('projection.insights')}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs text-muted-foreground">{t('projection.totalTaxOverPeriod')}</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(projections.reduce((sum, p) => sum + p.totalTax, 0))}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-success/5 border border-success/10">
            <p className="text-xs text-muted-foreground">{t('projection.exemptYearsSavings')}</p>
            <p className="text-lg font-bold text-success">
              {formatCurrency(exemptYearsSavings)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-warning/5 border border-warning/10">
            <p className="text-xs text-muted-foreground">{t('projection.yearRevenue')} {projectionYears}</p>
            <p className="text-lg font-bold text-warning">
              {formatCurrency(projections[projections.length - 1]?.turnover || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
