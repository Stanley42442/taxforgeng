import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Calculator, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/taxCalculations';

const VAT_RATE = 0.075; // 7.5%

interface SimpleVATCalculatorProps {
  showCTA?: boolean;
  ctaLink?: string;
  ctaText?: string;
}

/**
 * Simple VAT Calculator Widget
 * Preview calculator for SEO pages - shows VAT at 7.5%
 * Drives users to full business calculator for comprehensive tax breakdown
 */
export const SimpleVATCalculator = ({
  showCTA = true,
  ctaLink = '/calculator',
  ctaText = 'Full Business Calculator',
}: SimpleVATCalculatorProps) => {
  const [amount, setAmount] = useState<number>(0);

  const vatAmount = amount * VAT_RATE;
  const totalWithVAT = amount + vatAmount;

  return (
    <div className="glass-frosted rounded-2xl p-6 md:p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-primary text-primary-foreground mb-4 shadow-lg">
          <Calculator className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Quick VAT Calculator</h3>
        <p className="text-sm text-muted-foreground">Nigerian VAT at 7.5%</p>
      </div>

      <div className="space-y-6">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Enter Amount (before VAT)
          </label>
          <CurrencyInput
            value={amount}
            onChange={setAmount}
            placeholder="Enter amount"
            className="text-lg"
          />
        </div>

        {/* Results */}
        {amount > 0 && (
          <div className="grid gap-4 md:grid-cols-3 animate-slide-up">
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Amount</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(amount)}</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">VAT (7.5%)</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(vatAmount)}</p>
            </div>
            <div className="glass rounded-xl p-4 text-center border-2 border-success/30">
              <p className="text-xs text-muted-foreground mb-1">Total with VAT</p>
              <p className="text-lg font-bold text-success">{formatCurrency(totalWithVAT)}</p>
            </div>
          </div>
        )}

        {/* CTA */}
        {showCTA && (
          <div className="pt-4 text-center">
            <Link to={ctaLink}>
              <Button variant="glow" size="lg" className="group">
                <span>{ctaText}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-2">
              Calculate CIT, WHT, and Development Levy together
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
