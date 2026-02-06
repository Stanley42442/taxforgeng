import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, XCircle, Building2, HelpCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/taxCalculations';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Small Company Tax Exemption Eligibility Checker
 * Two inputs: turnover + fixed assets → YES/NO result
 */
export const EligibilityChecker = () => {
  const [turnover, setTurnover] = useState<string>('');
  const [fixedAssets, setFixedAssets] = useState<string>('');

  const eligibility = useMemo(() => {
    const turnoverNum = parseFloat(turnover.replace(/,/g, '')) || 0;
    const assetsNum = parseFloat(fixedAssets.replace(/,/g, '')) || 0;

    if (turnoverNum <= 0 && assetsNum <= 0) return null;

    const turnoverOk = turnoverNum <= 50_000_000;
    const assetsOk = assetsNum <= 250_000_000;
    const isEligible = turnoverOk && assetsOk;

    // Calculate potential savings (30% CIT on estimated profit ~10% of turnover)
    const estimatedProfit = turnoverNum * 0.1;
    const potentialTax = estimatedProfit * 0.30;

    return {
      isEligible,
      turnoverOk,
      assetsOk,
      turnover: turnoverNum,
      assets: assetsNum,
      potentialSavings: isEligible ? potentialTax : 0,
    };
  }, [turnover, fixedAssets]);

  const formatInput = (value: string) => {
    const num = value.replace(/[^\d]/g, '');
    return num ? parseInt(num, 10).toLocaleString() : '';
  };

  return (
    <Card className="glass-frosted border-primary/20 shadow-futuristic overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg glow-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Eligibility Checker</h3>
            <p className="text-sm text-muted-foreground">Check if you qualify for 0% CIT</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="turnover" className="text-sm font-medium flex items-center gap-2">
                Annual Turnover (₦)
                <span className="text-xs text-muted-foreground">Must be ≤ ₦50M</span>
              </Label>
              <Input
                id="turnover"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 45,000,000"
                value={turnover}
                onChange={(e) => setTurnover(formatInput(e.target.value))}
                className="text-lg h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assets" className="text-sm font-medium flex items-center gap-2">
                Total Fixed Assets (₦)
                <span className="text-xs text-muted-foreground">Must be ≤ ₦250M</span>
              </Label>
              <Input
                id="assets"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 120,000,000"
                value={fixedAssets}
                onChange={(e) => setFixedAssets(formatInput(e.target.value))}
                className="text-lg h-12"
              />
            </div>

            <div className="glass-subtle rounded-lg p-4">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Fixed assets include land, buildings, machinery, vehicles, and equipment.
                  Both conditions must be met for exemption.
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            <AnimatePresence mode="wait">
              {eligibility ? (
                <motion.div
                  key={eligibility.isEligible ? 'eligible' : 'not-eligible'}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <div
                    className={`rounded-xl p-6 h-full flex flex-col ${
                      eligibility.isEligible
                        ? 'bg-success/10 border-2 border-success/30'
                        : 'bg-destructive/10 border-2 border-destructive/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {eligibility.isEligible ? (
                        <CheckCircle2 className="h-10 w-10 text-success" />
                      ) : (
                        <XCircle className="h-10 w-10 text-destructive" />
                      )}
                      <div>
                        <h4 className={`text-xl font-bold ${
                          eligibility.isEligible ? 'text-success' : 'text-destructive'
                        }`}>
                          {eligibility.isEligible ? 'You Qualify!' : 'Not Eligible'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {eligibility.isEligible
                            ? '0% Company Income Tax under 2026 rules'
                            : 'Standard CIT rates apply'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 flex-grow">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Turnover ≤ ₦50M:</span>
                        <span className={eligibility.turnoverOk ? 'text-success' : 'text-destructive'}>
                          {eligibility.turnoverOk ? '✓ Pass' : '✗ Exceeds'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Assets ≤ ₦250M:</span>
                        <span className={eligibility.assetsOk ? 'text-success' : 'text-destructive'}>
                          {eligibility.assetsOk ? '✓ Pass' : '✗ Exceeds'}
                        </span>
                      </div>
                    </div>

                    {eligibility.isEligible && eligibility.potentialSavings > 0 && (
                      <div className="glass rounded-lg p-3 text-center mb-4">
                        <p className="text-xs text-muted-foreground">Estimated Annual Savings</p>
                        <p className="text-2xl font-bold text-success">
                          {formatCurrency(eligibility.potentialSavings)}
                        </p>
                      </div>
                    )}

                    <Link to="/calculator">
                      <Button
                        variant={eligibility.isEligible ? 'glow' : 'outline'}
                        className="w-full group"
                      >
                        <span>
                          {eligibility.isEligible ? 'Generate ₦0 Report' : 'Calculate Your Tax'}
                        </span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass rounded-xl p-8 text-center h-full flex flex-col items-center justify-center"
                >
                  <Building2 className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">
                    Enter your turnover and assets to check eligibility
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
