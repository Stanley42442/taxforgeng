import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calculator, Info, TrendingUp } from "lucide-react";
import { calculatePenalty, type PenaltyEstimate } from "@/lib/taxMyths";
import { formatCurrency } from "@/lib/taxCalculations";
import { useLanguage } from "@/contexts/LanguageContext";

export const PenaltyEstimator = () => {
  const { t } = useLanguage();
  const [taxType, setTaxType] = useState<'cit' | 'vat' | 'pit' | 'paye'>('cit');
  const [taxDue, setTaxDue] = useState(1000000);
  const [monthsLate, setMonthsLate] = useState(3);
  const [cbnRate, setCbnRate] = useState(24);
  const [result, setResult] = useState<PenaltyEstimate | null>(null);

  const handleCalculate = () => {
    const estimate = calculatePenalty(taxType, taxDue, monthsLate, cbnRate);
    setResult(estimate);
  };

  return (
    <Card className="glass-frosted">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-warning" />
          {t('penalty.title')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('penalty.description')}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tax Type */}
        <div className="space-y-2">
          <Label>{t('form.taxType')}</Label>
          <Select value={taxType} onValueChange={(v) => setTaxType(v as typeof taxType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cit">{t('penalty.companyIncomeTax')}</SelectItem>
              <SelectItem value="vat">{t('penalty.valueAddedTax')}</SelectItem>
              <SelectItem value="pit">{t('penalty.personalIncomeTax')}</SelectItem>
              <SelectItem value="paye">{t('penalty.payAsYouEarn')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tax Due */}
        <div className="space-y-2">
          <Label>{t('form.taxDue')} (₦)</Label>
          <Input
            type="number"
            value={taxDue}
            onChange={(e) => setTaxDue(Number(e.target.value) || 0)}
            placeholder={t('placeholder.enterAmount')}
          />
        </div>

        {/* Months Late */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>{t('form.monthsLate')}</Label>
            <span className="text-sm font-medium text-primary">{monthsLate} {t('common.months')}</span>
          </div>
          <Slider
            value={[monthsLate]}
            onValueChange={([v]) => setMonthsLate(v)}
            min={1}
            max={24}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 {t('common.month')}</span>
            <span>24 {t('common.months')}</span>
          </div>
        </div>

        {/* CBN Rate */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label className="flex items-center gap-1">
              {t('penalty.cbnLendingRate')}
              <Info className="h-3 w-3 text-muted-foreground" />
            </Label>
            <span className="text-sm font-medium">{cbnRate}%</span>
          </div>
          <Slider
            value={[cbnRate]}
            onValueChange={([v]) => setCbnRate(v)}
            min={10}
            max={40}
            step={0.5}
          />
        </div>

        <Button onClick={handleCalculate} className="w-full gap-2">
          <Calculator className="h-4 w-4" />
          {t('btn.calculatePenalty')}
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                <p className="text-xs text-muted-foreground mb-1">{t('penalty.lateFilingPenalty')}</p>
                <p className="text-xl font-bold text-warning">{formatCurrency(result.lateFiling)}</p>
              </div>
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <p className="text-xs text-muted-foreground mb-1">{t('penalty.interestCharges')}</p>
                <p className="text-xl font-bold text-destructive">{formatCurrency(result.interest)}</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-destructive/20 border border-destructive/30 text-center">
              <p className="text-sm text-muted-foreground mb-2">{t('penalty.totalPenalty')}</p>
              <p className="text-3xl font-bold text-destructive">{formatCurrency(result.totalPenalty)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {((result.totalPenalty / taxDue) * 100).toFixed(1)}% {t('penalty.ofOriginalTax')}
              </p>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-info/10 border border-info/20">
              <TrendingUp className="h-4 w-4 text-info mt-0.5" />
              <p className="text-sm text-info">{result.description}</p>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              * {t('penalty.disclaimer')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
