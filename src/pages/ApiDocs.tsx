import { useState } from "react";
import { NavMenu } from "@/components/NavMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/taxCalculations";
import {
  Code,
  Copy,
  Play,
  Key,
  CheckCircle2,
  Terminal,
  BookOpen,
  Zap
} from "lucide-react";

const ApiDocs = () => {
  const { tier } = useSubscription();
  const [apiKey, setApiKey] = useState<string>("");
  const [demoInput, setDemoInput] = useState({
    turnover: "15000000",
    expenses: "3000000",
    entityType: "business_name"
  });
  const [demoResult, setDemoResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isCorporate = tier === 'corporate';

  const generateApiKey = () => {
    const key = `ntxp_${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`;
    setApiKey(key);
    toast.success("API key generated (mock)");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const runDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      const turnover = Number(demoInput.turnover);
      const expenses = Number(demoInput.expenses);
      const taxableIncome = Math.max(0, turnover - expenses);
      
      // Simplified tax calculation
      let tax = 0;
      if (demoInput.entityType === 'company') {
        tax = taxableIncome <= 50000000 ? 0 : taxableIncome * 0.25;
      } else {
        // PIT bands
        if (taxableIncome > 800000) {
          tax = (taxableIncome - 800000) * 0.18; // Simplified
        }
      }

      setDemoResult({
        success: true,
        data: {
          grossIncome: turnover,
          taxableIncome,
          totalTaxPayable: Math.round(tax),
          effectiveRate: turnover > 0 ? ((tax / turnover) * 100).toFixed(2) : "0.00",
          entityType: demoInput.entityType === 'company' ? 'Limited Company' : 'Business Name',
          calculatedAt: new Date().toISOString()
        }
      });
      setIsLoading(false);
    }, 1000);
  };

  const sampleCode = `// Node.js Example
const response = await fetch('https://api.naijataxpro.com/v1/calculate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey || 'YOUR_API_KEY'}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    entityType: 'business_name',
    turnover: 15000000,
    expenses: 3000000,
    vatableSales: 0,
    use2026Rules: true
  })
});

const data = await response.json();
console.log(data.totalTaxPayable);`;

  const curlExample = `curl -X POST https://api.naijataxpro.com/v1/calculate \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "entityType": "company",
    "turnover": 50000000,
    "expenses": 10000000,
    "fixedAssets": 100000000,
    "use2026Rules": true
  }'`;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <NavMenu />

      <main className="container mx-auto px-4 py-8 pb-20">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
              <Code className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              For Developers
            </h1>
            <p className="text-muted-foreground">
              Integrate Nigerian tax calculations into your applications
            </p>
          </div>

          {/* API Key Section */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-6 animate-slide-up">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              API Key
            </h2>

            {!isCorporate ? (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm text-warning mb-3">
                  API access is available on Corporate plans. Contact us for enterprise pricing.
                </p>
                <Button variant="outline" size="sm">
                  Contact Sales
                </Button>
              </div>
            ) : apiKey ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input 
                    value={apiKey} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" onClick={() => copyToClipboard(apiKey)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Keep this key secret. Do not expose in client-side code.
                </p>
              </div>
            ) : (
              <Button variant="hero" onClick={generateApiKey}>
                <Key className="h-4 w-4" />
                Generate API Key
              </Button>
            )}
          </div>

          {/* Endpoints */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-6 animate-slide-up">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Endpoints
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-success/20 text-success text-xs font-mono">POST</span>
                  <code className="text-sm font-mono text-foreground">/v1/calculate</code>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Calculate tax based on income and entity type
                </p>
                <div className="text-xs">
                  <p className="font-medium text-foreground mb-1">Parameters:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li><code>entityType</code> - "business_name" | "company"</li>
                    <li><code>turnover</code> - Annual turnover in Naira</li>
                    <li><code>expenses</code> - Deductible expenses</li>
                    <li><code>vatableSales</code> - Vatable sales amount</li>
                    <li><code>use2026Rules</code> - Boolean for 2026 tax rules</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-info/20 text-info text-xs font-mono">GET</span>
                  <code className="text-sm font-mono text-foreground">/v1/rates</code>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get current tax rates and thresholds
                </p>
              </div>

              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-success/20 text-success text-xs font-mono">POST</span>
                  <code className="text-sm font-mono text-foreground">/v1/verify-cac</code>
                </div>
                <p className="text-sm text-muted-foreground">
                  Verify RC/BN number with CAC (Coming soon)
                </p>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-6 animate-slide-up">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              Code Examples
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm">Node.js / JavaScript</Label>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(sampleCode)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <pre className="p-4 rounded-lg bg-secondary/80 overflow-x-auto text-xs font-mono text-foreground">
                  {sampleCode}
                </pre>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm">cURL</Label>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(curlExample)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <pre className="p-4 rounded-lg bg-secondary/80 overflow-x-auto text-xs font-mono text-foreground">
                  {curlExample}
                </pre>
              </div>
            </div>
          </div>

          {/* Live Demo */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card animate-slide-up">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning" />
              Try It Live
            </h2>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Entity Type</Label>
                  <select
                    value={demoInput.entityType}
                    onChange={(e) => setDemoInput(prev => ({ ...prev, entityType: e.target.value }))}
                    className="w-full mt-1 p-2 rounded-md border border-border bg-background text-foreground"
                  >
                    <option value="business_name">Business Name</option>
                    <option value="company">Company (LTD)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm">Turnover (₦)</Label>
                  <Input
                    type="number"
                    value={demoInput.turnover}
                    onChange={(e) => setDemoInput(prev => ({ ...prev, turnover: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm">Expenses (₦)</Label>
                  <Input
                    type="number"
                    value={demoInput.expenses}
                    onChange={(e) => setDemoInput(prev => ({ ...prev, expenses: e.target.value }))}
                  />
                </div>
                <Button variant="hero" className="w-full" onClick={runDemo} disabled={isLoading}>
                  <Play className="h-4 w-4" />
                  {isLoading ? 'Calculating...' : 'Run Demo'}
                </Button>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Response</Label>
                <pre className="p-4 rounded-lg bg-secondary/80 h-[280px] overflow-auto text-xs font-mono text-foreground">
                  {demoResult 
                    ? JSON.stringify(demoResult, null, 2) 
                    : '// Response will appear here'
                  }
                </pre>
              </div>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
            <h3 className="font-medium text-foreground mb-2">Rate Limits</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 1,000 requests/day (Basic API)</li>
              <li>• 10,000 requests/day (Pro API)</li>
              <li>• Unlimited (Enterprise) - Contact sales</li>
            </ul>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            Mock API for demonstration. Production API coming soon.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ApiDocs;