import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import { calculateTax, formatCurrency, type TaxInputs } from "@/lib/taxCalculations";
import { MultiYearProjection } from "@/components/MultiYearProjection";
import { PenaltyEstimator } from "@/components/PenaltyEstimator";
import { ForeignIncomeCalculator } from "@/components/ForeignIncomeCalculator";
import {
  ArrowRight,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calculator,
  Crown,
  Lightbulb,
  Minus,
  Calendar,
  AlertTriangle,
  Globe
} from "lucide-react";

const ScenarioModeling = () => {
  const { canAccessScenarioModeling } = useSubscription();
  const navigate = useNavigate();

  const hasAccess = canAccessScenarioModeling();

  const [baseValues, setBaseValues] = useState({
    turnover: 15000000,
    expenses: 3000000,
    rentPaid: 1200000,
    foreignIncome: 0,
    capitalGains: 0,
  });

  const [adjustments, setAdjustments] = useState({
    turnoverChange: 0,
    expenseChange: 0,
    bonusIncome: 0,
    newRent: 0,
    foreignIncome: 0,
    cryptoGains: 0,
  });

  if (!hasAccess) {
    return (
      <PageLayout title="Scenario Modeling" description="Model different scenarios and see tax impact" icon={BarChart3} maxWidth="lg">
        <div className="text-center py-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-warning/10">
            <Crown className="h-10 w-10 text-warning" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Scenario Modeling</h2>
          <p className="text-muted-foreground mb-6">Available on Freelancer plan and above</p>
          <Button variant="hero" onClick={() => navigate('/pricing')}>
            <Crown className="h-4 w-4" />
            Upgrade to Freelancer
          </Button>
        </div>
      </PageLayout>
    );
  }

  const calculateScenarioTax = (adj: typeof adjustments) => {
    const inputs: TaxInputs = {
      entityType: 'business_name',
      turnover: baseValues.turnover * (1 + adj.turnoverChange / 100) + adj.bonusIncome,
      expenses: baseValues.expenses * (1 + adj.expenseChange / 100),
      rentPaid: baseValues.rentPaid + adj.newRent,
      vatableSales: 0,
      vatablePurchases: 0,
      rentalIncome: 0,
      consultancyIncome: 0,
      dividendIncome: 0,
      capitalGains: adj.cryptoGains,
      foreignIncome: adj.foreignIncome,
      fixedAssets: 0,
      use2026Rules: true,
    };
    return calculateTax(inputs);
  };

  const baseTax = calculateScenarioTax({ turnoverChange: 0, expenseChange: 0, bonusIncome: 0, newRent: 0, foreignIncome: 0, cryptoGains: 0 });
  const scenarioTax = calculateScenarioTax(adjustments);
  const taxDifference = scenarioTax.totalTaxPayable - baseTax.totalTaxPayable;

  const formatChange = (value: number) => {
    if (value === 0) return '';
    return value > 0 ? `+${value}%` : `${value}%`;
  };

  return (
    <PageLayout title="Scenario Modeling" description="Model different scenarios and see tax impact" icon={BarChart3} maxWidth="6xl">
      <Tabs defaultValue="what-if">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="what-if" className="gap-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">What-If</span>
          </TabsTrigger>
          <TabsTrigger value="multi-year" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Multi-Year</span>
          </TabsTrigger>
          <TabsTrigger value="penalties" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Penalties</span>
          </TabsTrigger>
          <TabsTrigger value="foreign" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Foreign</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="what-if">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Adjustments Panel */}
            <div className="rounded-2xl border border-border glass-frosted p-6 shadow-card animate-slide-up">
              <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 glow-sm">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                Adjust Variables
              </h2>

              <div className="space-y-6">
                <div>
                  <Label className="text-sm mb-2 block">Base Turnover: {formatCurrency(baseValues.turnover)}</Label>
                  <Input
                    type="number"
                    value={baseValues.turnover}
                    onChange={(e) => setBaseValues(prev => ({ ...prev, turnover: Number(e.target.value) }))}
                    className="mb-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm">Turnover Change</Label>
                    <span className={`text-sm font-medium ${adjustments.turnoverChange > 0 ? 'text-success' : adjustments.turnoverChange < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {formatChange(adjustments.turnoverChange)}
                    </span>
                  </div>
                  <Slider
                    value={[adjustments.turnoverChange]}
                    onValueChange={([value]) => setAdjustments(prev => ({ ...prev, turnoverChange: value }))}
                    min={-50}
                    max={100}
                    step={5}
                    className="mb-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm">Expense Change</Label>
                    <span className={`text-sm font-medium ${adjustments.expenseChange > 0 ? 'text-destructive' : adjustments.expenseChange < 0 ? 'text-success' : 'text-muted-foreground'}`}>
                      {formatChange(adjustments.expenseChange)}
                    </span>
                  </div>
                  <Slider
                    value={[adjustments.expenseChange]}
                    onValueChange={([value]) => setAdjustments(prev => ({ ...prev, expenseChange: value }))}
                    min={-50}
                    max={100}
                    step={5}
                  />
                </div>

                <div>
                  <Label className="text-sm mb-2 block">Bonus/Additional Income</Label>
                  <Input
                    type="number"
                    value={adjustments.bonusIncome || ''}
                    onChange={(e) => setAdjustments(prev => ({ ...prev, bonusIncome: Number(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label className="text-sm mb-2 block">Crypto/Capital Gains</Label>
                  <Input
                    type="number"
                    value={adjustments.cryptoGains || ''}
                    onChange={(e) => setAdjustments(prev => ({ ...prev, cryptoGains: Number(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">10% CGT applies</p>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setAdjustments({
                    turnoverChange: 0,
                    expenseChange: 0,
                    bonusIncome: 0,
                    newRent: 0,
                    foreignIncome: 0,
                    cryptoGains: 0,
                  })}
                >
                  Reset All
                </Button>
              </div>
            </div>

            {/* Comparison Panel */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-border glass-frosted p-3 sm:p-5 shadow-card overflow-hidden card-interactive">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">Current Tax</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground break-all">{formatCurrency(baseTax.totalTaxPayable)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Rate: {baseTax.effectiveRate.toFixed(2)}%</p>
                </div>
                <div className={`rounded-2xl border p-3 sm:p-5 shadow-card overflow-hidden card-interactive ${
                  taxDifference > 0 ? 'border-destructive/20 bg-destructive/5' : taxDifference < 0 ? 'border-success/20 bg-success/5 glow-sm' : 'border-border glass-frosted'
                }`}>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">Scenario Tax</p>
                  <p className={`text-lg sm:text-2xl font-bold break-all ${taxDifference > 0 ? 'text-destructive' : taxDifference < 0 ? 'text-success' : 'text-foreground'}`}>
                    {formatCurrency(scenarioTax.totalTaxPayable)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Rate: {scenarioTax.effectiveRate.toFixed(2)}%</p>
                </div>
              </div>

              <div className={`rounded-2xl p-4 sm:p-6 text-center overflow-hidden ${
                taxDifference > 0 ? 'bg-destructive/10 border border-destructive/20' : taxDifference < 0 ? 'bg-success/10 border border-success/20' : 'bg-secondary/50 border border-border'
              }`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {taxDifference > 0 ? <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6 text-destructive flex-shrink-0" /> : taxDifference < 0 ? <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6 text-success flex-shrink-0" /> : <Minus className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground flex-shrink-0" />}
                  <span className={`text-xl sm:text-3xl font-bold break-all ${taxDifference > 0 ? 'text-destructive' : taxDifference < 0 ? 'text-success' : 'text-muted-foreground'}`}>
                    {taxDifference > 0 ? '+' : ''}{formatCurrency(Math.abs(taxDifference))}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {taxDifference > 0 ? "You'll pay more in this scenario" : taxDifference < 0 ? "You'll save money in this scenario" : 'No change from current tax'}
                </p>
              </div>

              {/* Insights */}
              <div className="rounded-2xl border border-border glass-frosted p-6 shadow-card animate-slide-up stagger-2">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Lightbulb className="h-5 w-5 text-warning" />
                  </div>
                  Insights
                </h3>
                <div className="space-y-3">
                  {adjustments.turnoverChange > 20 && (
                    <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                      <p className="text-sm text-info">📊 A {adjustments.turnoverChange}% turnover increase may require VAT registration if crossing ₦25M threshold</p>
                    </div>
                  )}
                  {adjustments.cryptoGains > 0 && (
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                      <p className="text-sm text-warning">💰 Crypto gains of {formatCurrency(adjustments.cryptoGains)} attract {formatCurrency(adjustments.cryptoGains * 0.1)} CGT</p>
                    </div>
                  )}
                  {Object.values(adjustments).every(v => v === 0) && (
                    <div className="p-3 rounded-lg bg-secondary">
                      <p className="text-sm text-muted-foreground">Adjust the sliders to see how changes affect your tax</p>
                    </div>
                  )}
                </div>
              </div>

              <Button 
                variant="hero" 
                className="w-full"
                onClick={() => navigate('/calculator', { 
                  state: { 
                    prefill: {
                      turnover: baseValues.turnover * (1 + adjustments.turnoverChange / 100) + adjustments.bonusIncome,
                      expenses: baseValues.expenses * (1 + adjustments.expenseChange / 100),
                      capitalGains: adjustments.cryptoGains,
                    } 
                  } 
                })}
              >
                Use This Scenario in Calculator
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="multi-year">
          <MultiYearProjection />
        </TabsContent>

        <TabsContent value="penalties">
          <PenaltyEstimator />
        </TabsContent>

        <TabsContent value="foreign">
          <ForeignIncomeCalculator />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default ScenarioModeling;
