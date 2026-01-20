import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, Gift, Plus, Trash2, Calculator, DollarSign,
  TrendingUp, AlertCircle, CheckCircle, HelpCircle
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { calculatePayrollWithExtras, type PayrollInput, type PayrollResult } from "@/lib/payrollCalculations";
import { formatCurrency } from "@/lib/taxCalculations";

interface OvertimeEntry {
  id: string;
  hours: number;
  multiplier: number;
  description: string;
}

interface BonusEntry {
  id: string;
  type: "performance" | "13th_month" | "holiday" | "other";
  amount: number;
  description: string;
  isTaxable: boolean;
}

const OVERTIME_PRESETS = [
  { name: "Regular Weekend (8 hrs)", hours: 8, multiplier: 1.5 },
  { name: "Public Holiday (8 hrs)", hours: 8, multiplier: 2.0 },
  { name: "Night Shift (4 hrs)", hours: 4, multiplier: 1.25 },
  { name: "Emergency Call-out", hours: 4, multiplier: 2.0 },
];

const BONUS_TYPES = [
  { value: "performance", label: "Performance Bonus", description: "Based on employee performance" },
  { value: "13th_month", label: "13th Month", description: "Annual bonus (typically December)" },
  { value: "holiday", label: "Holiday Bonus", description: "Seasonal/holiday bonus" },
  { value: "other", label: "Other", description: "Custom bonus type" },
];

const STANDARD_MONTHLY_HOURS = 176; // 44 hours/week × 4 weeks

export const OvertimeBonusCalculator = () => {
  const [baseSalary, setBaseSalary] = useState<number>(0);
  const [use2026Rules, setUse2026Rules] = useState(true);
  const [includeNhf, setIncludeNhf] = useState(true);
  const [annualRent, setAnnualRent] = useState<number>(0);
  
  const [overtimeEntries, setOvertimeEntries] = useState<OvertimeEntry[]>([]);
  const [bonusEntries, setBonusEntries] = useState<BonusEntry[]>([]);
  
  const [result, setResult] = useState<PayrollResult | null>(null);
  const [baseResult, setBaseResult] = useState<PayrollResult | null>(null);

  const hourlyRate = useMemo(() => {
    return baseSalary > 0 ? baseSalary / STANDARD_MONTHLY_HOURS : 0;
  }, [baseSalary]);

  // Add overtime entry
  const addOvertimeEntry = () => {
    setOvertimeEntries([...overtimeEntries, {
      id: crypto.randomUUID(),
      hours: 0,
      multiplier: 1.5,
      description: "",
    }]);
    setResult(null);
  };

  // Add overtime from preset
  const addFromPreset = (preset: typeof OVERTIME_PRESETS[0]) => {
    setOvertimeEntries([...overtimeEntries, {
      id: crypto.randomUUID(),
      hours: preset.hours,
      multiplier: preset.multiplier,
      description: preset.name,
    }]);
    setResult(null);
  };

  // Update overtime entry
  const updateOvertimeEntry = (id: string, field: keyof OvertimeEntry, value: any) => {
    setOvertimeEntries(overtimeEntries.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
    setResult(null);
  };

  // Remove overtime entry
  const removeOvertimeEntry = (id: string) => {
    setOvertimeEntries(overtimeEntries.filter(e => e.id !== id));
    setResult(null);
  };

  // Add bonus entry
  const addBonusEntry = () => {
    setBonusEntries([...bonusEntries, {
      id: crypto.randomUUID(),
      type: "performance",
      amount: 0,
      description: "",
      isTaxable: true,
    }]);
    setResult(null);
  };

  // Update bonus entry
  const updateBonusEntry = (id: string, field: keyof BonusEntry, value: any) => {
    setBonusEntries(bonusEntries.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
    setResult(null);
  };

  // Remove bonus entry
  const removeBonusEntry = (id: string) => {
    setBonusEntries(bonusEntries.filter(e => e.id !== id));
    setResult(null);
  };

  // Calculate overtime amount for an entry
  const calculateOTAmount = (entry: OvertimeEntry) => {
    return entry.hours * hourlyRate * entry.multiplier;
  };

  // Total overtime
  const totalOvertime = useMemo(() => {
    return overtimeEntries.reduce((sum, e) => sum + calculateOTAmount(e), 0);
  }, [overtimeEntries, hourlyRate]);

  // Total bonuses
  const totalBonuses = useMemo(() => {
    return bonusEntries.reduce((sum, e) => sum + e.amount, 0);
  }, [bonusEntries]);

  const taxableBonuses = useMemo(() => {
    return bonusEntries.filter(e => e.isTaxable).reduce((sum, e) => sum + e.amount, 0);
  }, [bonusEntries]);

  // Calculate payroll
  const handleCalculate = () => {
    if (baseSalary <= 0) return;

    // Calculate base payroll (without OT/bonus)
    const baseInput: PayrollInput = {
      grossSalary: baseSalary,
      includeNhf,
      use2026Rules,
      annualRent,
      overtimeHours: 0,
      overtimeMultiplier: 1,
      bonusAmount: 0,
      bonusIsTaxable: false,
      leaveDeductionDays: 0,
      dailyRate: 0,
    };
    const baseCalc = calculatePayrollWithExtras(baseInput);
    setBaseResult(baseCalc);

    // Calculate with OT and bonus
    const totalOTHours = overtimeEntries.reduce((sum, e) => sum + e.hours, 0);
    const avgMultiplier = totalOTHours > 0 
      ? overtimeEntries.reduce((sum, e) => sum + (e.hours * e.multiplier), 0) / totalOTHours 
      : 1.5;

    const input: PayrollInput = {
      grossSalary: baseSalary,
      includeNhf,
      use2026Rules,
      annualRent,
      overtimeHours: totalOTHours,
      overtimeMultiplier: avgMultiplier,
      bonusAmount: taxableBonuses,
      bonusIsTaxable: true,
      leaveDeductionDays: 0,
      dailyRate: 0,
    };

    const calcResult = calculatePayrollWithExtras(input);
    
    // Add non-taxable bonuses to net
    const nonTaxableBonuses = totalBonuses - taxableBonuses;
    calcResult.netSalary += nonTaxableBonuses;
    calcResult.bonusAmount = totalBonuses;
    
    setResult(calcResult);
  };

  return (
    <div className="space-y-6">
      {/* Base Salary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Base Salary
          </CardTitle>
          <CardDescription>Enter the employee's monthly gross salary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Monthly Gross Salary (₦)</Label>
              <Input
                type="number"
                value={baseSalary || ""}
                onChange={(e) => {
                  setBaseSalary(Number(e.target.value));
                  setResult(null);
                }}
                placeholder="500000"
              />
              {hourlyRate > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Hourly rate: {formatCurrency(hourlyRate)}
                </p>
              )}
            </div>
            {use2026Rules && (
              <div>
                <Label>Annual Rent Paid (₦)</Label>
                <Input
                  type="number"
                  value={annualRent || ""}
                  onChange={(e) => {
                    setAnnualRent(Number(e.target.value));
                    setResult(null);
                  }}
                  placeholder="For Rent Relief calculation"
                />
              </div>
            )}
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={use2026Rules} onCheckedChange={(v) => { setUse2026Rules(v); setResult(null); }} />
              <Label>2026 Tax Rules</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={includeNhf} onCheckedChange={(v) => { setIncludeNhf(v); setResult(null); }} />
              <Label>Include NHF</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overtime Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Overtime
              </CardTitle>
              <CardDescription>Add overtime hours with different rates</CardDescription>
            </div>
            {totalOvertime > 0 && (
              <Badge variant="secondary" className="text-lg">
                {formatCurrency(totalOvertime)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Add Presets */}
          <div className="flex flex-wrap gap-2">
            {OVERTIME_PRESETS.map((preset, i) => (
              <Button 
                key={i} 
                variant="outline" 
                size="sm"
                onClick={() => addFromPreset(preset)}
              >
                <Plus className="h-3 w-3 mr-1" />
                {preset.name}
              </Button>
            ))}
          </div>

          {overtimeEntries.length > 0 && <Separator />}

          {/* Overtime Entries */}
          {overtimeEntries.map((entry) => (
            <div key={entry.id} className="flex gap-3 items-end">
              <div className="flex-1">
                <Label>Hours</Label>
                <Input
                  type="number"
                  value={entry.hours || ""}
                  onChange={(e) => updateOvertimeEntry(entry.id, "hours", Number(e.target.value))}
                  placeholder="8"
                />
              </div>
              <div className="w-32">
                <Label>Rate</Label>
                <Select 
                  value={entry.multiplier.toString()} 
                  onValueChange={(v) => updateOvertimeEntry(entry.id, "multiplier", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.25">1.25x</SelectItem>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                    <SelectItem value="2.5">2.5x</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label>Description</Label>
                <Input
                  value={entry.description}
                  onChange={(e) => updateOvertimeEntry(entry.id, "description", e.target.value)}
                  placeholder="Weekend work"
                />
              </div>
              <div className="w-28 text-right">
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="font-medium">{formatCurrency(calculateOTAmount(entry))}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => removeOvertimeEntry(entry.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addOvertimeEntry}>
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Entry
          </Button>
        </CardContent>
      </Card>

      {/* Bonus Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Bonuses
              </CardTitle>
              <CardDescription>Add one-time or periodic bonuses</CardDescription>
            </div>
            {totalBonuses > 0 && (
              <Badge variant="secondary" className="text-lg">
                {formatCurrency(totalBonuses)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bonusEntries.map((entry) => (
            <div key={entry.id} className="flex gap-3 items-end">
              <div className="w-40">
                <Label>Type</Label>
                <Select 
                  value={entry.type} 
                  onValueChange={(v: any) => updateBonusEntry(entry.id, "type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BONUS_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label>Amount (₦)</Label>
                <Input
                  type="number"
                  value={entry.amount || ""}
                  onChange={(e) => updateBonusEntry(entry.id, "amount", Number(e.target.value))}
                  placeholder="100000"
                />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Switch 
                  checked={entry.isTaxable}
                  onCheckedChange={(v) => updateBonusEntry(entry.id, "isTaxable", v)}
                />
                <Label className="text-sm">Taxable</Label>
                <Popover>
                  <PopoverTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </PopoverTrigger>
                  <PopoverContent side="top" className="text-sm">
                    Taxable bonuses are added to annual income for PAYE calculation. 
                    Non-taxable bonuses are paid in full without deductions.
                  </PopoverContent>
                </Popover>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => removeBonusEntry(entry.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addBonusEntry}>
            <Plus className="h-4 w-4 mr-2" />
            Add Bonus
          </Button>
        </CardContent>
      </Card>

      {/* Calculate Button */}
      <Button 
        onClick={handleCalculate} 
        size="lg" 
        className="w-full"
        disabled={baseSalary <= 0}
      >
        <Calculator className="h-4 w-4 mr-2" />
        Calculate Payroll
      </Button>

      {/* Results */}
      {result && baseResult && (
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle>Payroll Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Comparison */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-background rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Without OT/Bonus</p>
                <p className="text-xl font-bold">{formatCurrency(baseResult.netSalary)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">With OT/Bonus</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(result.netSalary)}</p>
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Additional Take-Home</p>
              <p className="text-3xl font-bold text-green-600">
                +{formatCurrency(result.netSalary - baseResult.netSalary)}
              </p>
            </div>

            <Separator />

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Earnings</h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Salary</span>
                  <span>{formatCurrency(baseSalary)}</span>
                </div>
                {totalOvertime > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overtime</span>
                    <span className="text-green-600">+{formatCurrency(totalOvertime)}</span>
                  </div>
                )}
                {totalBonuses > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bonuses</span>
                    <span className="text-green-600">+{formatCurrency(totalBonuses)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Earnings</span>
                  <span>{formatCurrency(result.grossSalary + totalOvertime + totalBonuses)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Deductions</h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pension (8%)</span>
                  <span className="text-red-600">-{formatCurrency(result.pensionEmployee)}</span>
                </div>
                {result.nhf > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NHF (2.5%)</span>
                    <span className="text-red-600">-{formatCurrency(result.nhf)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PAYE</span>
                  <span className="text-red-600">-{formatCurrency(result.paye)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Net Salary</span>
                  <span className="text-green-600">{formatCurrency(result.netSalary)}</span>
                </div>
              </div>
            </div>

            {/* Tax Impact Note */}
            {taxableBonuses > 0 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-yellow-800 dark:text-yellow-200">
                  <strong>Tax Note:</strong> Taxable bonuses of {formatCurrency(taxableBonuses)} are added to 
                  your annual income, which may push you into a higher tax bracket. The additional PAYE is 
                  calculated at your marginal rate.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OvertimeBonusCalculator;
