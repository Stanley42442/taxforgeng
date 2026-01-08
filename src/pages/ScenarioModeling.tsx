import { useState } from "react";
import { NavMenu } from "@/components/NavMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import { calculateTax, formatCurrency, type TaxInputs } from "@/lib/taxCalculations";
import { useLanguage } from "@/contexts/LanguageContext";
import { MultiYearProjection } from "@/components/MultiYearProjection";
import { PenaltyEstimator } from "@/components/PenaltyEstimator";
import { ForeignIncomeCalculator } from "@/components/ForeignIncomeCalculator";
import {
  ArrowRight,
  ArrowDown,
  ArrowUp,
  TrendingUp,
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
  const { tier, canAccessScenarioModeling } = useSubscription();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const hasAccess = canAccessScenarioModeling();

  // Base scenario values
  const [baseValues, setBaseValues] = useState({
    turnover: 15000000,
    expenses: 3000000,
    rentPaid: 1200000,
    foreignIncome: 0,
    capitalGains: 0,
  });

  // Scenario adjustments (as percentages or absolute changes)
  const [adjustments, setAdjustments] = useState({
    turnoverChange: 0, // percentage
    expenseChange: 0, // percentage
    bonusIncome: 0, // absolute
    newRent: 0, // absolute
    foreignIncome: 0, // absolute
    cryptoGains: 0, // absolute
  });

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-warning/10">
              <Crown className="h-10 w-10 text-warning" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">{t('scenario.title')}</h1>
            <p className="text-muted-foreground mb-6">
              {t('scenario.availableFreelancer')}
            </p>
            <Button variant="hero" onClick={() => navigate('/pricing')}>
              <Crown className="h-4 w-4" />
              {t('scenario.upgradeToFreelancer')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate current scenario
  const calculateScenarioTax = (adj: { turnoverChange: number; expenseChange: number; bonusIncome: number; newRent: number; foreignIncome: number; cryptoGains: number }) => {
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

  const baseTax = calculateScenarioTax({ 
    turnoverChange: 0, 
    expenseChange: 0, 
    bonusIncome: 0, 
    newRent: 0, 
    foreignIncome: 0, 
    cryptoGains: 0 
  });
  const scenarioTax = calculateScenarioTax(adjustments);
  const taxDifference = scenarioTax.totalTaxPayable - baseTax.totalTaxPayable;

  const formatChange = (value: number) => {
    if (value === 0) return '';
    return value > 0 ? `+${value}%` : `${value}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      <NavMenu />

      <main className="container mx-auto px-4 py-6 pb-8 flex-1">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
              <BarChart3 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('scenario.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('scenario.subtitle')}
            </p>
          </div>

          {/* Tabs for What-If vs Multi-Year */}
          <Tabs defaultValue="what-if" className="animate-slide-up-delay-1">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="what-if" className="gap-2">
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">{t('scenario.tabWhatIf')}</span>
              </TabsTrigger>
              <TabsTrigger value="multi-year" className="gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">{t('scenario.tabMultiYear')}</span>
              </TabsTrigger>
              <TabsTrigger value="penalties" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">{t('scenario.tabPenalties')}</span>
              </TabsTrigger>
              <TabsTrigger value="foreign" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Foreign</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="what-if">
              <div className="grid gap-6 lg:grid-cols-2">
            {/* Adjustments Panel */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card animate-slide-up">
              <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                {t('scenario.adjustVariables')}
              </h2>

              <div className="space-y-6">
                {/* Base Turnover */}
                <div>
                  <Label className="text-sm mb-2 block">
                    {t('scenario.baseTurnover')}: {formatCurrency(baseValues.turnover)}
                  </Label>
                  <Input
                    type="number"
                    value={baseValues.turnover}
                    onChange={(e) => setBaseValues(prev => ({ 
                      ...prev, 
                      turnover: Number(e.target.value) 
                    }))}
                    className="mb-2"
                  />
                </div>

                {/* Turnover Change */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm">{t('scenario.turnoverChange')}</Label>
                    <span className={`text-sm font-medium ${adjustments.turnoverChange > 0 ? 'text-success' : adjustments.turnoverChange < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {formatChange(adjustments.turnoverChange)}
                    </span>
                  </div>
                  <Slider
                    value={[adjustments.turnoverChange]}
                    onValueChange={([value]) => setAdjustments(prev => ({ 
                      ...prev, 
                      turnoverChange: value 
                    }))}
                    min={-50}
                    max={100}
                    step={5}
                    className="mb-1"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-50%</span>
                    <span>0%</span>
                    <span>+100%</span>
                  </div>
                </div>

                {/* Expense Change */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm">{t('scenario.expenseChange')}</Label>
                    <span className={`text-sm font-medium ${adjustments.expenseChange > 0 ? 'text-destructive' : adjustments.expenseChange < 0 ? 'text-success' : 'text-muted-foreground'}`}>
                      {formatChange(adjustments.expenseChange)}
                    </span>
                  </div>
                  <Slider
                    value={[adjustments.expenseChange]}
                    onValueChange={([value]) => setAdjustments(prev => ({ 
                      ...prev, 
                      expenseChange: value 
                    }))}
                    min={-50}
                    max={100}
                    step={5}
                    className="mb-1"
                  />
                </div>

                {/* Bonus Income */}
                <div>
                  <Label className="text-sm mb-2 block">{t('scenario.bonusIncome')}</Label>
                  <Input
                    type="number"
                    value={adjustments.bonusIncome || ''}
                    onChange={(e) => setAdjustments(prev => ({ 
                      ...prev, 
                      bonusIncome: Number(e.target.value) || 0 
                    }))}
                    placeholder="0"
                  />
                </div>

                {/* Additional Rent */}
                <div>
                  <Label className="text-sm mb-2 block">{t('scenario.additionalRent')}</Label>
                  <Input
                    type="number"
                    value={adjustments.newRent || ''}
                    onChange={(e) => setAdjustments(prev => ({ 
                      ...prev, 
                      newRent: Number(e.target.value) || 0 
                    }))}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t('scenario.increasesRentRelief')}</p>
                </div>

                {/* Foreign Income */}
                <div>
                  <Label className="text-sm mb-2 block">{t('scenario.foreignIncome')}</Label>
                  <Input
                    type="number"
                    value={adjustments.foreignIncome || ''}
                    onChange={(e) => setAdjustments(prev => ({ 
                      ...prev, 
                      foreignIncome: Number(e.target.value) || 0 
                    }))}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t('scenario.convertCBN')}</p>
                </div>

                {/* Crypto Gains */}
                <div>
                  <Label className="text-sm mb-2 block">{t('scenario.cryptoGains')}</Label>
                  <Input
                    type="number"
                    value={adjustments.cryptoGains || ''}
                    onChange={(e) => setAdjustments(prev => ({ 
                      ...prev, 
                      cryptoGains: Number(e.target.value) || 0 
                    }))}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t('scenario.cgtApplies')}</p>
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
                  {t('scenario.resetAll')}
                </Button>
              </div>
            </div>

            {/* Comparison Panel */}
            <div className="space-y-6 animate-slide-up">
              {/* Side by Side */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-card overflow-hidden">
                  <p className="text-sm text-muted-foreground mb-2">{t('scenario.currentTax')}</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground truncate">
                    {formatCurrency(baseTax.totalTaxPayable)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('scenario.rate')}: {baseTax.effectiveRate.toFixed(2)}%
                  </p>
                </div>
                <div className={`rounded-2xl border p-4 sm:p-5 shadow-card overflow-hidden ${
                  taxDifference > 0 
                    ? 'border-destructive/20 bg-destructive/5' 
                    : taxDifference < 0 
                    ? 'border-success/20 bg-success/5' 
                    : 'border-border bg-card'
                }`}>
                  <p className="text-sm text-muted-foreground mb-2">{t('scenario.scenarioTax')}</p>
                  <p className={`text-lg sm:text-2xl font-bold truncate ${
                    taxDifference > 0 ? 'text-destructive' : taxDifference < 0 ? 'text-success' : 'text-foreground'
                  }`}>
                    {formatCurrency(scenarioTax.totalTaxPayable)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('scenario.rate')}: {scenarioTax.effectiveRate.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Difference Indicator */}
              <div className={`rounded-2xl p-6 text-center ${
                taxDifference > 0 
                  ? 'bg-destructive/10 border border-destructive/20' 
                  : taxDifference < 0 
                  ? 'bg-success/10 border border-success/20' 
                  : 'bg-secondary/50 border border-border'
              }`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {taxDifference > 0 ? (
                    <ArrowUp className="h-6 w-6 text-destructive" />
                  ) : taxDifference < 0 ? (
                    <ArrowDown className="h-6 w-6 text-success" />
                  ) : (
                    <Minus className="h-6 w-6 text-muted-foreground" />
                  )}
                  <span className={`text-3xl font-bold ${
                    taxDifference > 0 ? 'text-destructive' : taxDifference < 0 ? 'text-success' : 'text-muted-foreground'
                  }`}>
                    {taxDifference > 0 ? '+' : ''}{formatCurrency(Math.abs(taxDifference))}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {taxDifference > 0 
                    ? t('scenario.payMore')
                    : taxDifference < 0 
                    ? t('scenario.saveMore')
                    : t('scenario.noChange')}
                </p>
              </div>

              {/* Insights */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-warning" />
                  {t('scenario.insights')}
                </h3>
                <div className="space-y-3">
                  {adjustments.turnoverChange > 20 && (
                    <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                      <p className="text-sm text-info">
                        📊 {t('scenario.insightVAT').replace('{percent}', adjustments.turnoverChange.toString())}
                      </p>
                    </div>
                  )}
                  {adjustments.newRent > 0 && (
                    <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                      <p className="text-sm text-success">
                        🏠 {t('scenario.insightRent').replace('{amount}', formatCurrency(adjustments.newRent))}
                      </p>
                    </div>
                  )}
                  {adjustments.cryptoGains > 0 && (
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                      <p className="text-sm text-warning">
                        💰 {t('scenario.insightCrypto').replace('{gains}', formatCurrency(adjustments.cryptoGains)).replace('{tax}', formatCurrency(adjustments.cryptoGains * 0.1))}
                      </p>
                    </div>
                  )}
                  {adjustments.foreignIncome > 0 && (
                    <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                      <p className="text-sm text-info">
                        🌍 {t('scenario.insightForeign')}
                      </p>
                    </div>
                  )}
                  {Object.values(adjustments).every(v => v === 0) && (
                    <div className="p-3 rounded-lg bg-secondary">
                      <p className="text-sm text-muted-foreground">
                        {t('scenario.adjustSliders')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Use in Calculator */}
              <Button 
                variant="hero" 
                className="w-full"
                onClick={() => navigate('/calculator', { 
                  state: { 
                    prefill: {
                      turnover: baseValues.turnover * (1 + adjustments.turnoverChange / 100) + adjustments.bonusIncome,
                      expenses: baseValues.expenses * (1 + adjustments.expenseChange / 100),
                      rentPaid: baseValues.rentPaid + adjustments.newRent,
                      foreignIncome: adjustments.foreignIncome,
                      capitalGains: adjustments.cryptoGains,
                    }
                  } 
                })}
              >
                <Calculator className="h-4 w-4" />
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
              <div className="max-w-xl mx-auto">
                <PenaltyEstimator />
              </div>
            </TabsContent>

            <TabsContent value="foreign">
              <div className="max-w-xl mx-auto">
                <ForeignIncomeCalculator />
              </div>
            </TabsContent>
          </Tabs>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center mt-8">
            Scenarios are estimates only. Actual tax may vary based on full circumstances.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ScenarioModeling;