import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Globe, Calculator, Info, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/taxCalculations";
import { useLanguage } from "@/contexts/LanguageContext";

interface TreatyCountry {
  name: string;
  code: string;
  withholdingRate: number; // WHT rate under treaty
  dividendRate: number;
  interestRate: number;
  royaltyRate: number;
}

const TREATY_COUNTRIES: TreatyCountry[] = [
  { name: 'United Kingdom', code: 'UK', withholdingRate: 12.5, dividendRate: 12.5, interestRate: 12.5, royaltyRate: 12.5 },
  { name: 'United States', code: 'US', withholdingRate: 10, dividendRate: 12.5, interestRate: 10, royaltyRate: 10 },
  { name: 'Canada', code: 'CA', withholdingRate: 12.5, dividendRate: 12.5, interestRate: 12.5, royaltyRate: 12.5 },
  { name: 'China', code: 'CN', withholdingRate: 7.5, dividendRate: 7.5, interestRate: 7.5, royaltyRate: 7.5 },
  { name: 'South Africa', code: 'ZA', withholdingRate: 7.5, dividendRate: 7.5, interestRate: 7.5, royaltyRate: 7.5 },
  { name: 'France', code: 'FR', withholdingRate: 12.5, dividendRate: 12.5, interestRate: 12.5, royaltyRate: 12.5 },
  { name: 'Netherlands', code: 'NL', withholdingRate: 12.5, dividendRate: 12.5, interestRate: 12.5, royaltyRate: 12.5 },
  { name: 'Belgium', code: 'BE', withholdingRate: 12.5, dividendRate: 12.5, interestRate: 12.5, royaltyRate: 12.5 },
  { name: 'Italy', code: 'IT', withholdingRate: 12.5, dividendRate: 12.5, interestRate: 12.5, royaltyRate: 12.5 },
  { name: 'Spain', code: 'ES', withholdingRate: 10, dividendRate: 10, interestRate: 10, royaltyRate: 10 },
  { name: 'Other (No Treaty)', code: 'OTHER', withholdingRate: 10, dividendRate: 10, interestRate: 10, royaltyRate: 10 },
];

type IncomeType = 'employment' | 'dividend' | 'interest' | 'royalty' | 'business';

export const ForeignIncomeCalculator = () => {
  const { t } = useLanguage();
  const [incomeType, setIncomeType] = useState<IncomeType>('employment');
  const [country, setCountry] = useState<string>('OTHER');
  const [foreignCurrency, setForeignCurrency] = useState<string>('USD');
  const [foreignAmount, setForeignAmount] = useState<number>(10000);
  const [exchangeRate, setExchangeRate] = useState<number>(1500);
  const [foreignTaxPaid, setForeignTaxPaid] = useState<number>(0);
  const [isResident, setIsResident] = useState<boolean>(true);
  const [calculated, setCalculated] = useState<boolean>(false);

  const selectedCountry = TREATY_COUNTRIES.find(c => c.code === country);
  const nairaAmount = foreignAmount * exchangeRate;

  // Get applicable rate based on income type and treaty
  const getApplicableRate = (): number => {
    if (!selectedCountry) return 10;
    switch (incomeType) {
      case 'dividend': return selectedCountry.dividendRate;
      case 'interest': return selectedCountry.interestRate;
      case 'royalty': return selectedCountry.royaltyRate;
      case 'employment': return isResident ? 25 : 10; // Max PIT rate or flat rate
      case 'business': return isResident ? 25 : selectedCountry.withholdingRate;
      default: return 10;
    }
  };

  // Calculate tax
  const calculateTax = () => {
    const rate = getApplicableRate();
    const grossTax = nairaAmount * (rate / 100);
    const foreignTaxCredit = Math.min(foreignTaxPaid * exchangeRate, grossTax);
    const netTax = Math.max(0, grossTax - foreignTaxCredit);
    return { grossTax, foreignTaxCredit, netTax, rate };
  };

  const { grossTax, foreignTaxCredit, netTax, rate } = calculateTax();

  const handleCalculate = () => {
    setCalculated(true);
  };

  return (
    <Card className="glass-frosted">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-primary" />
          {t('foreignIncome.title')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('foreignIncome.description')}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Residency Status */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
          <div>
            <Label>{t('foreignIncome.nigerianResident')}</Label>
            <p className="text-xs text-muted-foreground">{t('foreignIncome.residencyNote')}</p>
          </div>
          <Switch checked={isResident} onCheckedChange={setIsResident} />
        </div>

        {/* Income Type */}
        <div className="space-y-2">
          <Label>{t('form.incomeType')}</Label>
          <Select value={incomeType} onValueChange={(v) => setIncomeType(v as IncomeType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employment">{t('foreignIncome.employmentIncome')}</SelectItem>
              <SelectItem value="dividend">{t('foreignIncome.dividendIncome')}</SelectItem>
              <SelectItem value="interest">{t('foreignIncome.interestIncome')}</SelectItem>
              <SelectItem value="royalty">{t('foreignIncome.royaltyIncome')}</SelectItem>
              <SelectItem value="business">{t('foreignIncome.businessIncome')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Source Country */}
        <div className="space-y-2">
          <Label>{t('form.sourceCountry')}</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TREATY_COUNTRIES.map(c => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name} {c.code !== 'OTHER' && `(Treaty Rate: ${c.dividendRate}%)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('form.foreignCurrency')}</Label>
            <Select value={foreignCurrency} onValueChange={setForeignCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="CAD">CAD (C$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('form.amount')}</Label>
            <Input
              type="number"
              value={foreignAmount}
              onChange={(e) => setForeignAmount(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Exchange Rate */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            {t('form.exchangeRate')} (₦/{foreignCurrency})
            <Info className="h-3 w-3 text-muted-foreground" />
          </Label>
          <Input
            type="number"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(Number(e.target.value) || 0)}
          />
          <p className="text-xs text-muted-foreground">{t('foreignIncome.useCBNRate')}</p>
        </div>

        {/* Foreign Tax Paid */}
        <div className="space-y-2">
          <Label>{t('form.foreignTaxPaid')} ({foreignCurrency})</Label>
          <Input
            type="number"
            value={foreignTaxPaid}
            onChange={(e) => setForeignTaxPaid(Number(e.target.value) || 0)}
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">{t('foreignIncome.foreignTaxCredit')}</p>
        </div>

        <Button onClick={handleCalculate} className="w-full gap-2">
          <Calculator className="h-4 w-4" />
          {t('btn.calculateTax')}
        </Button>

        {/* Results */}
        {calculated && (
          <div className="space-y-4 pt-4 border-t">
            <div className="p-4 rounded-xl bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-1">{t('foreignIncome.nairaEquivalent')}</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(nairaAmount)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">{t('foreignIncome.applicableRate')}</p>
                <p className="text-xl font-bold text-primary">{rate}%</p>
                {country !== 'OTHER' && (
                  <p className="text-xs text-muted-foreground">{t('foreignIncome.treatyRate')}</p>
                )}
              </div>
              <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                <p className="text-xs text-muted-foreground mb-1">{t('foreignIncome.foreignTaxCredit')}</p>
                <p className="text-xl font-bold text-success">{formatCurrency(foreignTaxCredit)}</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-primary/20 border border-primary/30 text-center">
              <p className="text-sm text-muted-foreground mb-2">{t('foreignIncome.netNigerianTax')}</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(netTax)}</p>
            </div>

            {!isResident && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-info/10 border border-info/20">
                <AlertCircle className="h-4 w-4 text-info mt-0.5" />
                <p className="text-sm text-info">
                  {t('foreignIncome.nonResidentNote')}
                </p>
              </div>
            )}

            {selectedCountry && country !== 'OTHER' && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                <Info className="h-4 w-4 text-success mt-0.5" />
                <p className="text-sm text-success">
                  {t('foreignIncome.treatyNote').replace('{country}', selectedCountry.name)}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
