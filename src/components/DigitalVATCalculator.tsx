import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Globe, Calculator, AlertCircle, CheckCircle, Info, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/taxCalculations";
import { DIGITAL_VAT_CONFIG } from "@/lib/sectorConfig";
import { CurrencyInput } from "@/components/ui/currency-input";

interface DigitalVATResult {
  annualRevenue: number;
  vatLiability: number;
  sepThresholdMet: boolean;
  registrationRequired: boolean;
  exemptions: string[];
  recommendations: string[];
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'CN', name: 'China' },
  { code: 'DE', name: 'Germany' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SG', name: 'Singapore' },
  { code: 'IN', name: 'India' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'OTHER', name: 'Other Country' },
];

const BUSINESS_TYPES = [
  { id: 'streaming', name: 'Streaming Services', description: 'Video, music, gaming platforms' },
  { id: 'saas', name: 'Software as a Service', description: 'Cloud software, productivity tools' },
  { id: 'ecommerce', name: 'Digital Marketplace', description: 'App stores, digital goods' },
  { id: 'advertising', name: 'Digital Advertising', description: 'Online ads, sponsored content' },
  { id: 'edtech', name: 'Online Education', description: 'E-learning, digital courses' },
  { id: 'fintech', name: 'Digital Financial Services', description: 'Payment platforms, crypto exchanges' },
];

export const DigitalVATCalculator = () => {
  const [country, setCountry] = useState('US');
  const [businessType, setBusinessType] = useState('saas');
  const [nigerianRevenue, setNigerianRevenue] = useState<number>(0);
  const [hasLocalEntity, setHasLocalEntity] = useState(false);
  const [isB2B, setIsB2B] = useState(false);
  const [result, setResult] = useState<DigitalVATResult | null>(null);

  const calculateVAT = () => {
    const revenue = nigerianRevenue;
    const sepThresholdMet = revenue >= DIGITAL_VAT_CONFIG.sepThreshold;
    const exemptions: string[] = [];
    const recommendations: string[] = [];
    let vatLiability = 0;
    let registrationRequired = false;

    // Check for exemptions
    if (hasLocalEntity) {
      exemptions.push('Local entity exemption - standard VAT rules apply to your Nigerian subsidiary');
    }

    if (isB2B && revenue < 100000000) {
      exemptions.push('B2B transactions may qualify for reverse charge mechanism');
    }

    if (businessType === 'edtech') {
      exemptions.push('Educational content may be VAT-exempt under education provisions');
    }

    // Calculate VAT liability
    if (sepThresholdMet && !hasLocalEntity) {
      registrationRequired = true;
      vatLiability = revenue * (DIGITAL_VAT_CONFIG.vatRate / 100);
      recommendations.push('Register for VAT with NRS as a Non-Resident Person (NRP)');
      recommendations.push('Appoint a tax representative in Nigeria');
      recommendations.push('File monthly VAT returns electronically');
    } else if (revenue > 0 && !sepThresholdMet) {
      recommendations.push(`SEP threshold not met (current: ${formatCurrency(revenue)}, threshold: ${formatCurrency(DIGITAL_VAT_CONFIG.sepThreshold)})`);
      recommendations.push('Monitor Nigerian revenue - registration required if threshold is exceeded');
    }

    if (hasLocalEntity) {
      recommendations.push('Your Nigerian entity should handle VAT compliance locally');
      registrationRequired = false;
    }

    setResult({
      annualRevenue: revenue,
      vatLiability,
      sepThresholdMet,
      registrationRequired,
      exemptions,
      recommendations
    });
  };

  return (
    <Card className="glass-frosted">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-primary" />
          Digital Services VAT Calculator
        </CardTitle>
        <CardDescription>
          Calculate VAT obligations for non-resident digital service providers (NRP/SEP rules)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Country */}
        <div className="space-y-2">
          <Label>Company Country of Registration</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(c => (
                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Business Type */}
        <div className="space-y-2">
          <Label>Type of Digital Service</Label>
          <Select value={businessType} onValueChange={setBusinessType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_TYPES.map(b => (
                <SelectItem key={b.id} value={b.id}>
                  <div>
                    <span className="font-medium">{b.name}</span>
                    <span className="text-muted-foreground ml-2 text-xs">- {b.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nigerian Revenue */}
        <div className="space-y-2">
          <Label>Annual Revenue from Nigerian Customers</Label>
          <CurrencyInput
            value={nigerianRevenue}
            onChange={setNigerianRevenue}
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">
            SEP threshold: {formatCurrency(DIGITAL_VAT_CONFIG.sepThreshold)}/year
          </p>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
            <div>
              <Label>Nigerian Subsidiary/Entity</Label>
              <p className="text-xs text-muted-foreground">Do you have a registered entity in Nigeria?</p>
            </div>
            <Switch checked={hasLocalEntity} onCheckedChange={setHasLocalEntity} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
            <div>
              <Label>B2B Only</Label>
              <p className="text-xs text-muted-foreground">Services provided only to businesses?</p>
            </div>
            <Switch checked={isB2B} onCheckedChange={setIsB2B} />
          </div>
        </div>

        <Button onClick={calculateVAT} className="w-full gap-2">
          <Calculator className="h-4 w-4" />
          Calculate VAT Obligation
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t">
            {/* Summary */}
            <div className={`p-5 rounded-xl text-center ${
              result.registrationRequired 
                ? 'bg-warning/10 border border-warning/20' 
                : 'bg-success/10 border border-success/20'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {result.registrationRequired ? (
                  <AlertCircle className="h-5 w-5 text-warning" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-success" />
                )}
                <span className={`font-semibold ${
                  result.registrationRequired ? 'text-warning' : 'text-success'
                }`}>
                  {result.registrationRequired ? 'VAT Registration Required' : 'No VAT Registration Required'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {result.registrationRequired 
                  ? `You exceed the SEP threshold of ${formatCurrency(DIGITAL_VAT_CONFIG.sepThreshold)}`
                  : 'You are below the Significant Economic Presence threshold'}
              </p>
            </div>

            {/* VAT Liability */}
            {result.vatLiability > 0 && (
              <div className="p-4 sm:p-5 rounded-xl bg-primary/10 border border-primary/20 text-center overflow-hidden">
                <p className="text-sm text-muted-foreground mb-1">Estimated Annual VAT Liability</p>
                <p className="text-xl sm:text-3xl font-bold text-primary break-all">{formatCurrency(result.vatLiability)}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {DIGITAL_VAT_CONFIG.vatRate}% on {formatCurrency(result.annualRevenue)}
                </p>
              </div>
            )}

            {/* SEP Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">SEP Status</p>
                <Badge variant={result.sepThresholdMet ? 'default' : 'secondary'}>
                  {result.sepThresholdMet ? 'Threshold Met' : 'Below Threshold'}
                </Badge>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">VAT Rate</p>
                <p className="font-semibold">{DIGITAL_VAT_CONFIG.vatRate}%</p>
              </div>
            </div>

            {/* Exemptions */}
            {result.exemptions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Applicable Exemptions
                </h4>
                {result.exemptions.map((ex, i) => (
                  <div key={i} className="p-3 rounded-lg bg-success/10 text-sm">
                    {ex}
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Info className="h-4 w-4 text-info" />
                  Recommendations
                </h4>
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-info/10 text-sm">
                    <ArrowRight className="h-4 w-4 text-info mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
