import { useState, useEffect } from "react";
import { NavMenu } from "@/components/NavMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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
  Zap,
  Trash2,
  RefreshCw,
  BarChart3,
  Shield,
  Palette
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PartnerKey {
  id: string;
  name: string;
  api_key: string;
  tier: string;
  rate_limit_daily: number;
  requests_today: number;
  requests_total: number;
  is_active: boolean;
  created_at: string;
}

const ApiDocs = () => {
  const { tier } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [partnerKeys, setPartnerKeys] = useState<PartnerKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [demoInput, setDemoInput] = useState({
    turnover: "15000000",
    expenses: "3000000",
    entityType: "business_name"
  });
  const [demoResult, setDemoResult] = useState<any>(null);
  const [isRunningDemo, setIsRunningDemo] = useState(false);

  const isCorporate = tier === 'corporate' || tier === 'business';

  // Fetch existing API keys
  useEffect(() => {
    if (user && isCorporate) {
      fetchPartnerKeys();
    }
  }, [user, isCorporate]);

  const fetchPartnerKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartnerKeys(data || []);
    } catch (error) {
      console.error('Error fetching partner keys:', error);
    }
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for your API key");
      return;
    }

    setIsLoading(true);
    try {
      const apiKey = `txf_${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`;
      const apiSecretHash = crypto.randomUUID(); // In production, use proper hashing

      const { data, error } = await supabase
        .from('partners')
        .insert({
          user_id: user?.id,
          name: newKeyName,
          api_key: apiKey,
          api_secret_hash: apiSecretHash,
          tier: tier === 'corporate' ? 'pro' : 'basic',
          rate_limit_daily: tier === 'corporate' ? 10000 : 1000
        })
        .select()
        .single();

      if (error) throw error;

      setPartnerKeys(prev => [data, ...prev]);
      setNewKeyName("");
      setShowNewKeyForm(false);
      toast.success("API key created successfully! Copy it now - you won't see it again.");
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error("Failed to create API key");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      setPartnerKeys(prev => prev.filter(k => k.id !== keyId));
      toast.success("API key deleted");
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error("Failed to delete API key");
    }
  };

  const toggleKeyStatus = async (keyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('partners')
        .update({ is_active: !currentStatus })
        .eq('id', keyId);

      if (error) throw error;

      setPartnerKeys(prev => prev.map(k => 
        k.id === keyId ? { ...k, is_active: !currentStatus } : k
      ));
      toast.success(currentStatus ? "API key deactivated" : "API key activated");
    } catch (error) {
      console.error('Error toggling key status:', error);
      toast.error("Failed to update API key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const runDemo = async () => {
    setIsRunningDemo(true);
    try {
      // Use the first active API key for demo, or simulate
      const activeKey = partnerKeys.find(k => k.is_active);
      
      if (activeKey) {
        const response = await supabase.functions.invoke('partner-api', {
          body: {
            endpoint: 'calculate',
            entityType: demoInput.entityType,
            turnover: Number(demoInput.turnover),
            expenses: Number(demoInput.expenses),
            use2026Rules: true
          },
          headers: {
            'x-api-key': activeKey.api_key
          }
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        setDemoResult(response.data);
      } else {
        // Simulate response for users without API keys
        const turnover = Number(demoInput.turnover);
        const expenses = Number(demoInput.expenses);
        const taxableIncome = Math.max(0, turnover - expenses);
        
        let tax = 0;
        if (demoInput.entityType === 'company') {
          tax = taxableIncome <= 50000000 ? 0 : taxableIncome * 0.25;
        } else {
          if (taxableIncome > 800000) {
            tax = (taxableIncome - 800000) * 0.18;
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
      }
    } catch (error) {
      console.error('Demo error:', error);
      toast.error("Demo request failed");
    } finally {
      setIsRunningDemo(false);
    }
  };

  const activeKey = partnerKeys.find(k => k.is_active)?.api_key || 'YOUR_API_KEY';

  const sampleCode = `// Node.js Example
const response = await fetch('${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-api/calculate', {
  method: 'POST',
  headers: {
    'x-api-key': '${activeKey}',
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
console.log(data.data.totalTaxPayable);`;

  const curlExample = `curl -X POST ${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-api/calculate \\
  -H "x-api-key: ${activeKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "entityType": "company",
    "turnover": 50000000,
    "expenses": 10000000,
    "fixedAssets": 100000000,
    "use2026Rules": true
  }'`;

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      <NavMenu />

      <main className="container mx-auto px-4 py-6 pb-8 flex-1">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
              <Code className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Partnership API
            </h1>
            <p className="text-muted-foreground">
              Integrate Nigerian tax calculations into your fintech applications
            </p>
          </div>

          {/* API Key Management Section */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-6 animate-slide-up">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              API Keys
            </h2>

            {!isCorporate ? (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm text-warning mb-3">
                  API access is available on Business and Corporate plans. Upgrade to start integrating.
                </p>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/pricing'}>
                  View Plans
                </Button>
              </div>
            ) : !user ? (
              <div className="p-4 rounded-lg bg-muted border border-border">
                <p className="text-sm text-muted-foreground">
                  Please sign in to manage your API keys.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Existing Keys */}
                {partnerKeys.length > 0 && (
                  <div className="space-y-3">
                    {partnerKeys.map((key) => (
                      <div key={key.id} className="p-4 rounded-lg border border-border bg-secondary/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-foreground">{key.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${key.is_active ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                              {key.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {key.tier.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => toggleKeyStatus(key.id, key.is_active)}>
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteApiKey(key.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2 mb-3">
                          <Input 
                            value={key.api_key} 
                            readOnly 
                            className="font-mono text-sm"
                          />
                          <Button variant="outline" onClick={() => copyToClipboard(key.api_key)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            {key.requests_today}/{key.rate_limit_daily} today
                          </span>
                          <span>Total: {key.requests_total.toLocaleString()}</span>
                          <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Key Form */}
                {showNewKeyForm ? (
                  <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                    <Label className="text-sm mb-2 block">Key Name</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g., Production Key, Staging Key"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                      <Button onClick={generateApiKey} disabled={isLoading}>
                        {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Create'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowNewKeyForm(false)}>
                        Cancel
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Give your key a memorable name to identify it later.
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button variant="hero" onClick={() => setShowNewKeyForm(true)}>
                      <Key className="h-4 w-4" />
                      Create New API Key
                    </Button>
                    {partnerKeys.length > 0 && (
                      <Button variant="outline" onClick={() => navigate('/partner-branding')}>
                        <Palette className="h-4 w-4" />
                        Customize Branding
                      </Button>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Keep your keys secret. Do not expose them in client-side code.
                </p>
              </div>
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
                  <code className="text-sm font-mono text-foreground">/partner-api/calculate</code>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Calculate tax based on income and entity type using 2026 Nigeria Tax Act rules
                </p>
                <div className="text-xs">
                  <p className="font-medium text-foreground mb-1">Parameters:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li><code>entityType</code> - "business_name" | "company"</li>
                    <li><code>turnover</code> - Annual turnover in Naira</li>
                    <li><code>expenses</code> - Deductible expenses</li>
                    <li><code>vatableSales</code> - Vatable sales amount (optional)</li>
                    <li><code>fixedAssets</code> - Fixed assets value for small company check (optional)</li>
                    <li><code>use2026Rules</code> - Boolean for 2026 tax rules (default: true)</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-info/20 text-info text-xs font-mono">GET</span>
                  <code className="text-sm font-mono text-foreground">/partner-api/rates</code>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Get current tax rates, bands, and thresholds
                </p>
                <div className="text-xs">
                  <p className="font-medium text-foreground mb-1">Query Parameters:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li><code>use2026Rules</code> - Boolean (default: true)</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-info/20 text-info text-xs font-mono">GET</span>
                  <code className="text-sm font-mono text-foreground">/partner-api/health</code>
                </div>
                <p className="text-sm text-muted-foreground">
                  Health check endpoint for monitoring
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
                <Button variant="hero" className="w-full" onClick={runDemo} disabled={isRunningDemo}>
                  <Play className="h-4 w-4" />
                  {isRunningDemo ? 'Calculating...' : 'Run Demo'}
                </Button>
              </div>

              <div className="min-w-0">
                <Label className="text-sm mb-2 block">Response</Label>
                <pre className="p-4 rounded-lg bg-secondary/80 h-[280px] overflow-auto text-xs font-mono text-foreground whitespace-pre-wrap break-all">
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
              <li>• 1,000 requests/day (Basic tier)</li>
              <li>• 10,000 requests/day (Pro tier)</li>
              <li>• Custom limits (Enterprise) - Contact sales</li>
            </ul>
          </div>

          {/* Response Headers */}
          <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
            <h3 className="font-medium text-foreground mb-2">Response Headers</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><code>X-RateLimit-Limit</code> - Your daily limit</li>
              <li><code>X-RateLimit-Remaining</code> - Requests remaining today</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApiDocs;
