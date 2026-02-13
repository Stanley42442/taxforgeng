import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calculator, Info, TrendingUp } from "lucide-react";
import { calculatePenalty, type PenaltyEstimate } from "@/lib/taxMyths";
import { formatCurrency } from "@/lib/taxCalculations";
import { CurrencyInput } from "@/components/ui/currency-input";

export const PenaltyEstimator = () => {
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
          Penalty Estimator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Calculate potential penalties for late tax filing
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tax Type */}
        <div className="space-y-2">
          <Label>Tax Type</Label>
          <Select value={taxType} onValueChange={(v) => setTaxType(v as typeof taxType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cit">Company Income Tax (CIT)</SelectItem>
              <SelectItem value="vat">Value Added Tax (VAT)</SelectItem>
              <SelectItem value="pit">Personal Income Tax (PIT)</SelectItem>
              <SelectItem value="paye">Pay As You Earn (PAYE)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tax Due */}
        <div className="space-y-2">
          <Label>Tax Due</Label>
          <CurrencyInput
            value={taxDue}
            onChange={setTaxDue}
            placeholder="Enter amount"
          />
        </div>

        {/* Months Late */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Months Late</Label>
            <span className="text-sm font-medium text-primary">{monthsLate} months</span>
          </div>
          <Slider
            value={[monthsLate]}
            onValueChange={([v]) => setMonthsLate(v)}
            min={1}
            max={24}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 month</span>
            <span>24 months</span>
          </div>
        </div>

        {/* CBN Rate */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label className="flex items-center gap-1">
              CBN Lending Rate
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
          Calculate Penalty
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t overflow-hidden">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 sm:p-4 rounded-xl bg-warning/10 border border-warning/20 overflow-hidden">
                <p className="text-xs text-muted-foreground mb-1">Late Filing Penalty</p>
                <p className="text-base sm:text-xl font-bold text-warning break-all">{formatCurrency(result.lateFiling)}</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-destructive/10 border border-destructive/20 overflow-hidden">
                <p className="text-xs text-muted-foreground mb-1">Interest Charges</p>
                <p className="text-base sm:text-xl font-bold text-destructive break-all">{formatCurrency(result.interest)}</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-destructive/20 border border-destructive/30 text-center overflow-hidden">
              <p className="text-sm text-muted-foreground mb-2">Total Penalty</p>
              <p className="text-xl sm:text-3xl font-bold text-destructive break-all">{formatCurrency(result.totalPenalty)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {((result.totalPenalty / taxDue) * 100).toFixed(1)}% of original tax
              </p>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-info/10 border border-info/20">
              <TrendingUp className="h-4 w-4 text-info mt-0.5" />
              <p className="text-sm text-info">{result.description}</p>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              * Estimates only. Actual penalties may vary based on NRS assessment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};