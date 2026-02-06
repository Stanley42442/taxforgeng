import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingDown, Calculator } from 'lucide-react';
import { calculatePersonalIncomeTax, IndividualTaxInputs } from '@/lib/individualTaxCalculations';
import { formatCurrency } from '@/lib/taxCalculations';

interface QuickTaxCalculatorProps {
  showComparison?: boolean;
}

/**
 * Quick Tax Calculator for SEO Landing Pages
 * Simplified 3-field calculator with instant results
 */
export const QuickTaxCalculator = ({ showComparison = true }: QuickTaxCalculatorProps) => {
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [pensionRate, setPensionRate] = useState<string>('8');
  const [annualRent, setAnnualRent] = useState<string>('');

  const results = useMemo(() => {
    const income = parseFloat(monthlyIncome.replace(/,/g, '')) || 0;
    const annual = income * 12;
    const pension = annual * (parseFloat(pensionRate) / 100 || 0);
    const rent = parseFloat(annualRent.replace(/,/g, '')) || 0;

    if (annual <= 0) return null;

    const inputs2026: IndividualTaxInputs = {
      calculationType: 'pit',
      use2026Rules: true,
      employmentIncome: annual,
      pensionContribution: pension,
      annualRentPaid: rent,
    };

    const inputsPre2026: IndividualTaxInputs = {
      calculationType: 'pit',
      use2026Rules: false,
      employmentIncome: annual,
      pensionContribution: pension,
    };

    const result2026 = calculatePersonalIncomeTax(inputs2026);
    const resultPre2026 = calculatePersonalIncomeTax(inputsPre2026);

    return {
      tax2026: result2026.taxPayable,
      taxPre2026: resultPre2026.taxPayable,
      effectiveRate2026: result2026.effectiveRate,
      netPay2026: annual - result2026.taxPayable,
      savings: resultPre2026.taxPayable - result2026.taxPayable,
      grossIncome: annual,
    };
  }, [monthlyIncome, pensionRate, annualRent]);

  const formatInput = (value: string) => {
    const num = value.replace(/[^\d]/g, '');
    return num ? parseInt(num, 10).toLocaleString() : '';
  };

  return (
    <Card className="glass-frosted border-primary/20 shadow-futuristic overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Input Side */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                <Calculator className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Quick Calculator</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly-income" className="text-sm font-medium">
                Monthly Gross Salary (₦)
              </Label>
              <Input
                id="monthly-income"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 500,000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(formatInput(e.target.value))}
                className="text-lg h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pension" className="text-sm font-medium">
                Pension Contribution (%)
              </Label>
              <Input
                id="pension"
                type="number"
                min="0"
                max="8"
                step="0.5"
                value={pensionRate}
                onChange={(e) => setPensionRate(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rent" className="text-sm font-medium">
                Annual Rent Paid (₦) <span className="text-accent text-xs">NEW 2026</span>
              </Label>
              <Input
                id="rent"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 1,200,000"
                value={annualRent}
                onChange={(e) => setAnnualRent(formatInput(e.target.value))}
                className="h-12"
              />
            </div>
          </div>

          {/* Results Side */}
          <div className="flex flex-col justify-between">
            {results ? (
              <div className="space-y-4">
                <div className="glass rounded-xl p-5 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Annual Tax (2026 Rules)</p>
                  <p className="text-3xl font-bold text-foreground">
                    {formatCurrency(results.tax2026)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Effective Rate: {results.effectiveRate2026.toFixed(1)}%
                  </p>
                </div>

                {showComparison && results.savings > 0 && (
                  <div className="glass rounded-xl p-4 border-l-4 border-success bg-success/5">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-success" />
                      <div>
                        <p className="text-sm font-medium text-success">
                          You save {formatCurrency(results.savings)} under 2026 rules
                        </p>
                        <p className="text-xs text-muted-foreground">
                          vs {formatCurrency(results.taxPre2026)} under old rules
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="glass-subtle rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Net Annual Pay</p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatCurrency(results.netPay2026)}
                    </p>
                  </div>
                  <div className="glass-subtle rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Monthly Net</p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatCurrency(results.netPay2026 / 12)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass rounded-xl p-8 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Enter your salary to see instant results
                </p>
              </div>
            )}

            <Link to="/individual-calculator" className="mt-6">
              <Button variant="glow" className="w-full group" size="lg">
                <span>Get Full Breakdown</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
