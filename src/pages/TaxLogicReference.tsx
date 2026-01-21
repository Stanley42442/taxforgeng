import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calculator, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  User,
  Percent,
  Receipt,
  Briefcase,
  Shield
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { CurrencyInput } from "@/components/ui/currency-input";
import { 
  PIT_BANDS_2026, 
  PIT_BANDS_PRE2026, 
  KEY_CHANGES, 
  CIT_RULES, 
  VAT_RULES, 
  DEDUCTION_RULES,
  WHT_RATES,
  PAYROLL_RATES,
  calculateProgressiveTax,
  formatCurrencyCompact
} from "@/lib/taxRulesData";
import { VERIFICATION_SOURCES_DETAILED, VERIFICATION_METHODOLOGY } from "@/types/verification";
import { downloadTaxLogicDocumentPDF } from "@/lib/taxLogicDocumentPdf";
import { formatCurrency } from "@/lib/taxCalculations";

// Component for side-by-side comparison card
const ComparisonCard = ({ 
  title, 
  rule2026, 
  rulePre2026, 
  change,
  source
}: { 
  title: string; 
  rule2026: string; 
  rulePre2026: string; 
  change: 'better' | 'same' | 'different';
  source: string;
}) => {
  const changeIcon = change === 'better' 
    ? <TrendingUp className="h-4 w-4 text-success" />
    : change === 'same'
    ? <Minus className="h-4 w-4 text-muted-foreground" />
    : <ArrowRight className="h-4 w-4 text-primary" />;
    
  const changeBadge = change === 'better'
    ? <Badge className="bg-success/10 text-success border-success/30">Better</Badge>
    : change === 'same'
    ? <Badge variant="outline">Same</Badge>
    : <Badge className="bg-primary/10 text-primary border-primary/30">Changed</Badge>;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {changeIcon}
            {title}
          </CardTitle>
          {changeBadge}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg ${change === 'better' ? 'bg-success/5 border border-success/20' : 'bg-primary/5 border border-primary/20'}`}>
            <p className="text-xs font-medium text-muted-foreground mb-1">2026 Rules</p>
            <p className="text-sm font-medium">{rule2026}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="text-xs font-medium text-muted-foreground mb-1">Pre-2026</p>
            <p className="text-sm">{rulePre2026}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Source: {source}
        </p>
      </CardContent>
    </Card>
  );
};

// Interactive tax calculator component
const InteractiveTaxCalculator = () => {
  const [income, setIncome] = useState(3000000);
  
  const result2026 = calculateProgressiveTax(income, PIT_BANDS_2026);
  const resultPre2026 = calculateProgressiveTax(income, PIT_BANDS_PRE2026);
  
  const savings = resultPre2026.totalTax - result2026.totalTax;
  const savingsPercent = resultPre2026.totalTax > 0 
    ? ((savings / resultPre2026.totalTax) * 100).toFixed(0) 
    : 0;

  return (
    <Card className="border-gold/30">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Interactive Tax Comparison
        </CardTitle>
        <CardDescription>
          See how much you'd save under 2026 rules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="income">Annual Taxable Income</Label>
          <CurrencyInput
            id="income"
            value={income}
            onChange={setIncome}
            className="mt-1"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-success/5 border border-success/20">
            <p className="text-sm text-muted-foreground">2026 Tax</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(result2026.totalTax)}</p>
            <p className="text-xs text-muted-foreground">Effective: {result2026.effectiveRate.toFixed(1)}%</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm text-muted-foreground">Pre-2026 Tax</p>
            <p className="text-2xl font-bold">{formatCurrency(resultPre2026.totalTax)}</p>
            <p className="text-xs text-muted-foreground">Effective: {resultPre2026.effectiveRate.toFixed(1)}%</p>
          </div>
        </div>
        
        {savings > 0 && (
          <Alert className="border-gold/50 bg-gold/5">
            <TrendingUp className="h-4 w-4 text-gold" />
            <AlertDescription className="text-gold">
              <strong>You save {formatCurrency(savings)}</strong> ({savingsPercent}% less) under 2026 rules!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

// PIT Bands Table Component
const PITBandsTable = ({ bands, title, highlight }: { bands: typeof PIT_BANDS_2026; title: string; highlight?: boolean }) => (
  <Card className={highlight ? "border-success/30 bg-success/5" : ""}>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        {highlight && <CheckCircle2 className="h-4 w-4 text-success" />}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-1">
        {bands.map((band, i) => (
          <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0">
            <span className="text-muted-foreground">{band.label}</span>
            <span className="font-medium">{band.rate}%</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Source Badge Component
const SourceBadge = ({ source }: { source: typeof VERIFICATION_SOURCES_DETAILED[0] }) => {
  const bgColor = source.type === 'big4' 
    ? 'bg-primary/10 border-primary/30 text-primary' 
    : source.type === 'government'
    ? 'bg-success/10 border-success/30 text-success'
    : 'bg-muted border-muted-foreground/30 text-muted-foreground';
    
  return (
    <div className={`p-3 rounded-lg border ${bgColor}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-sm">{source.shortName}</span>
        <Badge variant="outline" className="text-xs capitalize">{source.type}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{source.description}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {source.rulesVerified.slice(0, 3).map((rule, i) => (
          <Badge key={i} variant="secondary" className="text-xs">{rule}</Badge>
        ))}
      </div>
    </div>
  );
};

const TaxLogicReference = () => {
  return (
    <PageLayout title="Tax Logic Reference">
      <p className="text-muted-foreground mb-6">Nigeria Tax Act 2025 vs Pre-2026 Rules - Side-by-Side Comparison</p>
      <div className="space-y-6">
        {/* Header with Actions */}
        <Card className="bg-gradient-to-r from-primary/10 to-gold/10 border-gold/30">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Shield className="h-6 w-6 text-success" />
                  Accuracy Verified
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  All rules verified against Big 4 advisories and official NRS guidelines
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => downloadTaxLogicDocumentPDF()}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" asChild>
                  <a href="/documentation">
                    <FileText className="h-4 w-4 mr-2" />
                    Full Documentation
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="pit" className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
            <TabsTrigger value="pit" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">PIT</span>
            </TabsTrigger>
            <TabsTrigger value="cit" className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              <span className="hidden md:inline">CIT</span>
            </TabsTrigger>
            <TabsTrigger value="vat" className="flex items-center gap-1">
              <Percent className="h-4 w-4" />
              <span className="hidden md:inline">VAT/WHT</span>
            </TabsTrigger>
            <TabsTrigger value="deductions" className="flex items-center gap-1">
              <Receipt className="h-4 w-4" />
              <span className="hidden md:inline">Deductions</span>
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span className="hidden md:inline">Payroll</span>
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span className="hidden md:inline">Sources</span>
            </TabsTrigger>
          </TabsList>

          {/* PIT Tab */}
          <TabsContent value="pit" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Income Tax Bands</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PITBandsTable bands={PIT_BANDS_2026} title="2026 Rates (New)" highlight />
                  <PITBandsTable bands={PIT_BANDS_PRE2026} title="Pre-2026 Rates (Legacy)" />
                </div>
                
                <Alert className="border-success/50 bg-success/5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertDescription>
                    <strong>Key Change:</strong> 2026 introduces ₦800,000 tax-free threshold and caps maximum rate at 25%.
                  </AlertDescription>
                </Alert>
              </div>
              
              <InteractiveTaxCalculator />
            </div>
          </TabsContent>

          {/* CIT Tab */}
          <TabsContent value="cit" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-success/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    2026 CIT Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                    <h4 className="font-medium mb-2">Small Company Exemption</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Turnover ≤ {formatCurrencyCompact(CIT_RULES.rule2026.smallCompany.turnoverLimit)}</li>
                      <li>• Fixed Assets ≤ {formatCurrencyCompact(CIT_RULES.rule2026.smallCompany.assetLimit)}</li>
                      <li>• <strong className="text-success">0% CIT + 0% Dev Levy</strong></li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <h4 className="font-medium mb-2">Large Company</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• CIT Rate: <strong>{CIT_RULES.rule2026.largeCompany.citRate}%</strong></li>
                      <li>• Development Levy: <strong>{CIT_RULES.rule2026.largeCompany.devLevy}%</strong></li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Pre-2026 CIT Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <h4 className="font-medium mb-2">All Companies</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• CIT Rate: <strong>{CIT_RULES.rulePre2026.allCompanies.citRate}%</strong></li>
                      <li>• TET (Education Tax): <strong>{CIT_RULES.rulePre2026.allCompanies.tertiaryEducationTax}%</strong></li>
                      <li className="text-amber-600">• No small company exemption</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* VAT/WHT Tab */}
          <TabsContent value="vat" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>VAT Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Standard Rate</span>
                    <span className="font-medium">{VAT_RULES.standardRate}%</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Registration Threshold</span>
                    <span className="font-medium">{formatCurrencyCompact(VAT_RULES.registrationThreshold)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Filing</span>
                    <span className="font-medium">{VAT_RULES.filingFrequency}</span>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Input VAT Recovery</h4>
                    <div className="p-2 rounded bg-success/5 border border-success/20 text-sm">
                      <strong>2026:</strong> {VAT_RULES.inputRecovery2026}
                    </div>
                    <div className="p-2 rounded bg-muted/50 border text-sm">
                      <strong>Pre-2026:</strong> {VAT_RULES.inputRecoveryPre2026}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Withholding Tax Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {WHT_RATES.map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium">{item.incomeType}</p>
                          <p className="text-xs text-muted-foreground">{item.treatment}</p>
                        </div>
                        <Badge variant="outline">{item.rate}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deductions Tab */}
          <TabsContent value="deductions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-success/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    2026 Deductions (CRA Abolished)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {DEDUCTION_RULES.rule2026.map((item, i) => (
                      <div key={i} className="p-2 rounded border flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.calculation}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs">{item.cap}</p>
                          {item.requiresProof && (
                            <Badge variant="outline" className="text-xs">Proof Required</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Pre-2026 Deductions (CRA System)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {DEDUCTION_RULES.rulePre2026.map((item, i) => (
                      <div key={i} className="p-2 rounded border bg-muted/30 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.calculation}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs">{item.cap}</p>
                          {item.requiresProof && (
                            <Badge variant="outline" className="text-xs">Proof Required</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Loss of Office Highlight */}
            <Card className="border-gold/30 bg-gold/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gold" />
                  Loss of Office Exemption (Enhanced in 2026)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                    <p className="text-sm text-muted-foreground">2026 Exemption</p>
                    <p className="text-2xl font-bold text-success">₦50,000,000</p>
                    <p className="text-xs text-muted-foreground mt-1">Excess taxed at progressive PIT rates</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground">Pre-2026 Exemption</p>
                    <p className="text-2xl font-bold">₦10,000,000</p>
                    <p className="text-xs text-muted-foreground mt-1">Excess taxed at CGT/PIT rates</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Covers: Severance, gratuity, redundancy payments, termination benefits, wrongful dismissal awards.
                  <br />
                  <strong>Source:</strong> EY, PwC, KPMG, Baker Tilly, Aluko & Oyebode (Jan 2026)
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Pension Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employee</span>
                      <span className="font-medium">{PAYROLL_RATES.pensionEmployee}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employer</span>
                      <span className="font-medium">{PAYROLL_RATES.pensionEmployer}%</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-bold">{PAYROLL_RATES.pensionEmployee + PAYROLL_RATES.pensionEmployer}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Other Deductions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NHF</span>
                      <span className="font-medium">{PAYROLL_RATES.nhf}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NHIS</span>
                      <span className="font-medium">Actual</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Life Insurance</span>
                      <span className="font-medium">Actual</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Overtime Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Standard OT</span>
                      <span className="font-medium">{PAYROLL_RATES.defaultOvertimeMultiplier}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weekend/Holiday</span>
                      <span className="font-medium">{PAYROLL_RATES.weekendOvertimeMultiplier}x</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* PAYE Reference */}
            <Card>
              <CardHeader>
                <CardTitle>2026 PAYE Quick Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  {PIT_BANDS_2026.map((band, i) => (
                    <div key={i} className="p-2 rounded bg-muted/50 text-center">
                      <p className="text-lg font-bold text-primary">{band.rate}%</p>
                      <p className="text-xs text-muted-foreground">{band.label.split(' ')[0]}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification Sources</CardTitle>
                <CardDescription>
                  All tax rules are cross-referenced from authoritative sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {VERIFICATION_SOURCES_DETAILED.map((source, i) => (
                    <SourceBadge key={i} source={source} />
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <h4 className="font-medium mb-2">Verification Methodology</h4>
                  <p className="text-sm text-muted-foreground">
                    {VERIFICATION_METHODOLOGY}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Key Changes Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Key Changes Summary</CardTitle>
            <CardDescription>
              Most impactful differences between 2026 and pre-2026 tax rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {KEY_CHANGES.map((change) => (
                <ComparisonCard
                  key={change.id}
                  title={change.title}
                  rule2026={change.rule2026}
                  rulePre2026={change.rulePre2026}
                  change={change.change}
                  source={change.source}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default TaxLogicReference;
