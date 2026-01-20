import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/taxCalculations";
import { CurrencyInput } from "@/components/ui/currency-input";

// 2026 PIT Bands - Nigeria Tax Act 2025
const PIT_BANDS_2026 = [
  { threshold: 800000, rate: 0 },
  { threshold: 3000000, rate: 0.15 },
  { threshold: 12000000, rate: 0.18 },
  { threshold: 25000000, rate: 0.21 },
  { threshold: 50000000, rate: 0.23 },
  { threshold: Infinity, rate: 0.25 },
];

// Pre-2026 PIT Bands
const PIT_BANDS_PRE2026 = [
  { threshold: 300000, rate: 0.07 },
  { threshold: 600000, rate: 0.11 },
  { threshold: 1100000, rate: 0.15 },
  { threshold: 1600000, rate: 0.19 },
  { threshold: 3200000, rate: 0.21 },
  { threshold: Infinity, rate: 0.24 },
];

interface PayrollResult {
  grossSalary: number;
  pensionEmployee: number;
  pensionEmployer: number;
  nhf: number;
  rentRelief: number; // 2026: Replaces CRA
  taxableIncome: number;
  paye: number;
  netSalary: number;
  totalCostToCompany: number;
  breakdown: { label: string; amount: number; type: 'deduction' | 'contribution' | 'tax' | 'relief' }[];
}

export const PayrollCalculator = () => {
  const [grossSalary, setGrossSalary] = useState<number>(0);
  const [annualRent, setAnnualRent] = useState<number>(0);
  const [use2026Rules, setUse2026Rules] = useState(true);
  const [includeNHF, setIncludeNHF] = useState(true);
  const [result, setResult] = useState<PayrollResult | null>(null);

  const calculatePAYE = (taxableIncome: number): number => {
    const annualTaxable = taxableIncome * 12;
    const bands = use2026Rules ? PIT_BANDS_2026 : PIT_BANDS_PRE2026;
    
    let remainingIncome = annualTaxable;
    let totalTax = 0;
    let previousThreshold = 0;

    for (const band of bands) {
      if (remainingIncome <= 0) break;
      
      const bandAmount = band.threshold - previousThreshold;
      const taxableInBand = Math.min(remainingIncome, bandAmount);
      totalTax += taxableInBand * band.rate;
      
      remainingIncome -= taxableInBand;
      previousThreshold = band.threshold;
    }

    return totalTax / 12; // Return monthly PAYE
  };

  const calculate = () => {
    if (grossSalary <= 0) return;

    // Monthly calculations
    const pensionEmployee = grossSalary * 0.08; // 8% employee contribution
    const pensionEmployer = grossSalary * 0.10; // 10% employer contribution
    const nhf = includeNHF ? grossSalary * 0.025 : 0; // 2.5% NHF

    // Annual gross for relief calculation
    const annualGross = grossSalary * 12;
    
    // 2026 Rules: CRA is ABOLISHED - use Rent Relief instead
    // Pre-2026: Old CRA applies
    let totalAnnualReliefs = 0;
    let rentReliefAmount = 0;
    
    if (use2026Rules) {
      // Rent Relief: 20% of annual rent, max ₦500,000
      rentReliefAmount = Math.min(annualRent * 0.20, 500000);
      totalAnnualReliefs = rentReliefAmount;
    } else {
      // Pre-2026: Old CRA
      const cra = Math.max(200000, annualGross * 0.01) + (annualGross * 0.20);
      totalAnnualReliefs = cra;
    }
    
    const monthlyRelief = totalAnnualReliefs / 12;

    // Annual reliefs (pension + NHF)
    const annualPension = pensionEmployee * 12;
    const annualNHF = nhf * 12;

    // Taxable income
    const annualTaxableIncome = Math.max(0, annualGross - totalAnnualReliefs - annualPension - annualNHF);
    const monthlyTaxableIncome = annualTaxableIncome / 12;

    // Calculate PAYE
    const paye = calculatePAYE(monthlyTaxableIncome);

    // Net salary
    const netSalary = grossSalary - pensionEmployee - nhf - paye;

    // Total cost to company
    const totalCostToCompany = grossSalary + pensionEmployer;

    const breakdown: PayrollResult['breakdown'] = [
      { label: 'Pension (Employee 8%)', amount: pensionEmployee, type: 'deduction' },
      { label: 'Pension (Employer 10%)', amount: pensionEmployer, type: 'contribution' },
    ];

    if (includeNHF) {
      breakdown.push({ label: 'NHF (2.5%)', amount: nhf, type: 'deduction' });
    }

    breakdown.push(
      { label: use2026Rules ? 'Rent Relief (Monthly)' : 'CRA (Monthly)', amount: monthlyRelief, type: 'relief' },
      { label: 'PAYE', amount: paye, type: 'tax' }
    );

    setResult({
      grossSalary,
      pensionEmployee,
      pensionEmployer,
      nhf,
      rentRelief: monthlyRelief,
      taxableIncome: monthlyTaxableIncome,
      paye,
      netSalary,
      totalCostToCompany,
      breakdown,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Payroll Calculator
          </CardTitle>
          <CardDescription>
            Calculate PAYE, pension contributions, and net salary for employees
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="grossSalary">Monthly Gross Salary (₦)</Label>
                <CurrencyInput
                  id="grossSalary"
                  value={grossSalary}
                  onChange={setGrossSalary}
                  placeholder="Enter gross salary"
                  className="mt-1"
                />
              </div>

              {use2026Rules && (
                <div>
                  <Label htmlFor="annualRent">Annual Rent Paid (₦)</Label>
                  <CurrencyInput
                    id="annualRent"
                    value={annualRent}
                    onChange={setAnnualRent}
                    placeholder="Enter annual rent for Rent Relief"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    2026 Rule: 20% of rent (max ₦500k) replaces old CRA
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Use 2026 Tax Rules</Label>
                  <p className="text-sm text-muted-foreground">Rent Relief replaces old CRA</p>
                </div>
                <Switch checked={use2026Rules} onCheckedChange={setUse2026Rules} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Include NHF</Label>
                  <p className="text-sm text-muted-foreground">2.5% National Housing Fund</p>
                </div>
                <Switch checked={includeNHF} onCheckedChange={setIncludeNHF} />
              </div>

              <Button onClick={calculate} className="w-full" size="lg">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Payroll
              </Button>
            </div>

            {result && (
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Gross Salary</span>
                    <span className="font-medium">{formatCurrency(result.grossSalary)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Reliefs</h4>
                    {result.breakdown.filter(b => b.type === 'relief').map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="text-green-600">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Deductions</h4>
                    {result.breakdown.filter(b => b.type === 'deduction').map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="text-red-600">-{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Tax</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">PAYE</span>
                      <span className="text-red-600">-{formatCurrency(result.paye)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="font-bold">Net Salary</span>
                    <span className="font-bold text-xl text-green-600">{formatCurrency(result.netSalary)}</span>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxable Income (Monthly)</span>
                      <span>{formatCurrency(result.taxableIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employer Pension Contribution</span>
                      <span className="text-blue-600">+{formatCurrency(result.pensionEmployer)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Cost to Company</span>
                      <span className="font-medium">{formatCurrency(result.totalCostToCompany)}</span>
                    </div>
                  </div>

                  {use2026Rules && result.grossSalary * 12 <= 800000 && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 w-full justify-center">
                      Below ₦800k annual exemption - No PAYE!
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Pension Rates</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Employee: 8% of gross</li>
                <li>• Employer: 10% of gross</li>
                <li>• Total: 18% contribution</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">2026 PIT Rates</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• ₦0 - ₦800k: 0%</li>
                <li>• ₦800k - ₦3m: 15%</li>
                <li>• ₦3m - ₦12m: 18%</li>
                <li>• ₦12m - ₦25m: 21%</li>
                <li>• ₦25m - ₦50m: 23%</li>
                <li>• Above ₦50m: 25%</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">2026 Allowable Deductions</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Rent Relief:</strong> 20% of rent (max ₦500k) - requires proof</li>
                <li>• Pension: Up to 8% of gross</li>
                <li>• NHF: 2.5% of basic salary</li>
                <li>• NHIS: Actual premiums paid</li>
                <li>• Life Insurance: Actual premiums</li>
                <li className="text-amber-600">• Old CRA: <strong>ABOLISHED</strong></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollCalculator;
