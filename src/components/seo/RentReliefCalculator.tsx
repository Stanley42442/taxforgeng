import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, TrendingDown, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/taxCalculations';

/**
 * Rent Relief Calculator for SEO Landing Page
 * Single input: Annual rent → Relief amount (20% capped at ₦500k)
 */
export const RentReliefCalculator = () => {
  const [annualRent, setAnnualRent] = useState<string>('');

  const result = useMemo(() => {
    const rent = parseFloat(annualRent.replace(/,/g, '')) || 0;
    if (rent <= 0) return null;

    const relief = Math.min(rent * 0.20, 500_000);
    const isCapped = rent * 0.20 > 500_000;

    // Estimate tax savings (assuming 20% average tax rate)
    const estimatedTaxSavings = relief * 0.20;

    return {
      annualRent: rent,
      relief,
      isCapped,
      estimatedTaxSavings,
      uncappedRelief: rent * 0.20,
    };
  }, [annualRent]);

  const formatInput = (value: string) => {
    const num = value.replace(/[^\d]/g, '');
    return num ? parseInt(num, 10).toLocaleString() : '';
  };

  return (
    <Card className="glass-frosted border-primary/20 shadow-futuristic overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg glow-primary">
            <Home className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Rent Relief Calculator</h3>
            <p className="text-sm text-muted-foreground">2026 Tax Rules • Replaces CRA</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Input */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="annual-rent" className="text-sm font-medium">
                Annual Rent Paid (₦)
              </Label>
              <Input
                id="annual-rent"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 1,200,000"
                value={annualRent}
                onChange={(e) => setAnnualRent(formatInput(e.target.value))}
                className="text-lg h-14"
              />
              <p className="text-xs text-muted-foreground">
                Enter the total rent you pay per year
              </p>
            </div>

            <div className="glass-subtle rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-foreground">How it works:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• You can claim 20% of your annual rent as a deduction</li>
                <li>• Maximum relief is capped at ₦500,000</li>
                <li>• This replaces the old CRA (Consolidated Relief Allowance)</li>
                <li>• Must have proof of rent payment (receipts/agreement)</li>
              </ul>
            </div>
          </div>

          {/* Result */}
          <div>
            {result ? (
              <div className="space-y-4">
                <div className="glass rounded-xl p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Your Rent Relief</p>
                  <p className="text-4xl font-bold text-success">
                    {formatCurrency(result.relief)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tax deduction from your income
                  </p>
                </div>

                {result.isCapped && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
                    <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-warning">Cap Applied</p>
                      <p className="text-muted-foreground">
                        20% of your rent is {formatCurrency(result.uncappedRelief)}, 
                        but the maximum relief is ₦500,000.
                      </p>
                    </div>
                  </div>
                )}

                <div className="glass-subtle rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-foreground">Estimated Tax Savings</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(result.estimatedTaxSavings)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on an estimated 20% average tax rate
                  </p>
                </div>

                <Link to="/individual-calculator">
                  <Button variant="glow" className="w-full group" size="lg">
                    <span>Calculate Full Tax</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="glass rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
                <Home className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">
                  Enter your annual rent to see your relief
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
