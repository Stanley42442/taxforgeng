import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/taxCalculations";
import logger from "@/lib/logger";

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
  Palette,
  Globe,
  Users,
  Layout
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
  allowed_origins?: string[];
}

const ApiDocs = () => {
  const { tier } = useSubscription();
  const { user } = useAuth();
  const { isAdmin } = useAdminCheck();
  const navigate = useNavigate();
  const [partnerKeys, setPartnerKeys] = useState<PartnerKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyDomains, setNewKeyDomains] = useState("");
  const [newKeyRateLimit, setNewKeyRateLimit] = useState("1000");
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminPartnerName, setAdminPartnerName] = useState("");
  const [adminDomains, setAdminDomains] = useState("");
  const [adminRateLimit, setAdminRateLimit] = useState("10000");
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
      logger.error('Error fetching partner keys:', error);
    }
  };

  // HTML-escape helper for code snippet sanitization
  const escapeHtml = (str: string) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // Domain format validation
  const DOMAIN_REGEX = /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*(\.[a-zA-Z]{2,})(:\d{1,5})?(\/.*)?$/;

  const validateDomains = (domainsStr: string): string | null => {
    if (!domainsStr.trim()) return null;
    const domains = domainsStr.split(',').map(d => d.trim()).filter(Boolean);
    for (const d of domains) {
      if (!DOMAIN_REGEX.test(d)) return `Invalid domain: "${d}". Use format: https://example.com`;
    }
    return null;
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for your API key");
      return;
    }
    if (newKeyName.trim().length > 100) {
      toast.error("Key name must be 100 characters or less");
      return;
    }

    const domainError = validateDomains(newKeyDomains);
    if (domainError) {
      toast.error(domainError);
      return;
    }

    setIsLoading(true);
    try {
      const domains = newKeyDomains.trim()
        ? newKeyDomains.split(',').map(d => d.trim()).filter(Boolean)
        : [];

      const { data, error } = await supabase.functions.invoke('generate-api-key', {
        body: { name: newKeyName.trim(), domains: domains.length > 0 ? domains : undefined },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setPartnerKeys(prev => [data.data, ...prev]);
      setNewKeyName("");
      setNewKeyDomains("");
      setShowNewKeyForm(false);
      toast.success("API key created successfully! Copy it now - you won't see it again.");
    } catch (error: any) {
      logger.error('Error creating API key:', error);
      toast.error(error?.message || "Failed to create API key");
    } finally {
      setIsLoading(false);
    }
  };

  const generateAdminPartnerKey = async () => {
    if (!adminPartnerName.trim()) {
      toast.error("Please enter the partner's name");
      return;
    }
    if (adminPartnerName.trim().length > 100) {
      toast.error("Partner name must be 100 characters or less");
      return;
    }
    if (!adminDomains.trim()) {
      toast.error("Please enter at least one domain for the partner");
      return;
    }
    const domainError = validateDomains(adminDomains);
    if (domainError) {
      toast.error(domainError);
      return;
    }

    setIsLoading(true);
    try {
      const domains = adminDomains.split(',').map(d => d.trim()).filter(Boolean);
      const rateLimit = Math.min(Math.max(parseInt(adminRateLimit, 10) || 10000, 100), 100000);

      const { data, error } = await supabase.functions.invoke('create-partner-key', {
        body: {
          partnerName: adminPartnerName.trim(),
          domains,
          rateLimit,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setPartnerKeys(prev => [data.data, ...prev]);
      setAdminPartnerName("");
      setAdminDomains("");
      setAdminRateLimit("10000");
      setShowAdminForm(false);
      toast.success(`Partner key created for ${adminPartnerName}. Copy and send them the embed snippet.`);
    } catch (error: any) {
      logger.error('Error creating partner key:', error);
      toast.error(error?.message || "Failed to create partner key");
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
      logger.error('Error deleting API key:', error);
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
      logger.error('Error toggling key status:', error);
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
          tax = taxableIncome <= 50000000 ? 0 : taxableIncome * 0.30 + taxableIncome * 0.04;
        } else {
          const taxableAmount = Math.max(0, taxableIncome - 800000);
          if (taxableAmount <= 2200000) {
            tax = taxableAmount * 0.15;
          } else if (taxableAmount <= 11200000) {
            tax = 2200000 * 0.15 + (taxableAmount - 2200000) * 0.18;
          } else if (taxableAmount <= 24200000) {
            tax = 2200000 * 0.15 + 9000000 * 0.18 + (taxableAmount - 11200000) * 0.21;
          } else if (taxableAmount <= 49200000) {
            tax = 2200000 * 0.15 + 9000000 * 0.18 + 13000000 * 0.21 + (taxableAmount - 24200000) * 0.23;
          } else {
            tax = 2200000 * 0.15 + 9000000 * 0.18 + 13000000 * 0.21 + 25000000 * 0.23 + (taxableAmount - 49200000) * 0.25;
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
      logger.error('Demo error:', error);
      toast.error("Demo request failed");
    } finally {
      setIsRunningDemo(false);
    }
  };

  const rawActiveKey = partnerKeys.find(k => k.is_active)?.api_key || 'YOUR_API_KEY';
  const activeKey = escapeHtml(rawActiveKey);

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
    <PageLayout title="Partnership API" description="Integrate Nigerian tax calculations into your fintech applications" icon={Code} maxWidth="4xl">
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
                  <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
                    <div>
                      <Label className="text-sm mb-1 block">Key Name</Label>
                      <Input 
                        placeholder="e.g., Production Key, Staging Key"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Label className="text-sm mb-1 block">Allowed Domains <span className="text-muted-foreground">(optional, comma-separated)</span></Label>
                      <Input 
                        placeholder="e.g., https://example.com, https://app.example.com"
                        value={newKeyDomains}
                        onChange={(e) => setNewKeyDomains(e.target.value)}
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Restrict this key to specific domains. Leave empty to allow all origins.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={generateApiKey} disabled={isLoading}>
                        {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Create'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowNewKeyForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 flex-wrap">
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

          {/* Admin Partner Management - only visible to admins */}
          {isAdmin && (
            <div className="rounded-2xl border border-accent/30 bg-card p-6 shadow-card mb-6 animate-slide-up">
              <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Admin: Create Partner Keys
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Generate API keys for external sites. Partners don't need a TaxForge account — you create the key, set their domain, and hand them the embed snippet.
              </p>

              {showAdminForm ? (
                <div className="p-4 rounded-lg border border-accent/20 bg-accent/5 space-y-3">
                  <div>
                    <Label className="text-sm mb-1 block">Partner Name</Label>
                    <Input 
                      placeholder="e.g., Acme Financial Services"
                      value={adminPartnerName}
                      onChange={(e) => setAdminPartnerName(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-1 block">Partner Domains <span className="text-destructive">*</span></Label>
                    <Input 
                      placeholder="e.g., https://acme.com, https://app.acme.com"
                      value={adminDomains}
                      onChange={(e) => setAdminDomains(e.target.value)}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Comma-separated. The key will only work from these domains.
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm mb-1 block">Daily Rate Limit</Label>
                    <Input 
                      type="number"
                      placeholder="10000"
                      min="100"
                      max="100000"
                      value={adminRateLimit}
                      onChange={(e) => setAdminRateLimit(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={generateAdminPartnerKey} disabled={isLoading}>
                      {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Create Partner Key'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAdminForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="accent" onClick={() => setShowAdminForm(true)}>
                  <Globe className="h-4 w-4" />
                  Create Key for External Partner
                </Button>
              )}

              {/* Per-partner key cards */}
              {partnerKeys.filter(k => k.name.startsWith('[Partner]')).length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Key className="h-4 w-4 text-accent" />
                    Managed Partner Keys ({partnerKeys.filter(k => k.name.startsWith('[Partner]')).length})
                  </h3>
                  {partnerKeys.filter(k => k.name.startsWith('[Partner]')).map((key) => {
                    const displayName = key.name.replace(/^\[Partner\]\s*/, '');
                    const snippet = `<div id="taxforge-calculator"></div>\n<script src="https://taxforgeng.com/embed.js"></script>\n<script>\n  TaxForge.init({\n    container: '#taxforge-calculator',\n    apiKey: '${key.api_key}'\n  });\n</script>`;
                    return (
                      <div key={key.id} className="p-4 rounded-xl border border-accent/20 bg-accent/5 space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground">{displayName}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${key.is_active ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                              {key.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                              PARTNER
                            </span>
                          </div>
                        </div>

                        {/* Standalone API Key */}
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">API Key</Label>
                          <div className="flex gap-2">
                            <Input value={key.api_key} readOnly className="font-mono text-sm" />
                            <Button variant="outline" size="sm" onClick={() => copyToClipboard(key.api_key)}>
                              <Copy className="h-4 w-4" /> Copy Key
                            </Button>
                          </div>
                        </div>

                        {/* Domains */}
                        {key.allowed_origins && key.allowed_origins.length > 0 && (
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Allowed Domains</Label>
                            <div className="flex flex-wrap gap-1">
                              {key.allowed_origins.map((domain, i) => (
                                <span key={i} className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                                  {domain}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Embed Snippet */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <Label className="text-xs text-muted-foreground">Embed Snippet</Label>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(snippet)}>
                              <Copy className="h-4 w-4" /> Copy Snippet
                            </Button>
                          </div>
                          <pre className="p-3 rounded-lg bg-secondary text-xs font-mono overflow-x-auto text-foreground whitespace-pre-wrap">
{`<div id="taxforge-calculator"></div>
<script src="https://taxforgeng.com/embed.js"></script>
<script>
  TaxForge.init({
    container: '#taxforge-calculator',
    apiKey: '${key.api_key}'
  });
</script>`}
                          </pre>
                        </div>

                        {/* Stats + Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              {key.requests_today}/{key.rate_limit_daily} today
                            </span>
                            <span>Total: {key.requests_total.toLocaleString()}</span>
                            <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => toggleKeyStatus(key.id, key.is_active)}>
                              <Shield className="h-4 w-4" />
                              {key.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                if (window.confirm(`Delete partner key for "${displayName}"? This cannot be undone.`)) {
                                  deleteApiKey(key.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Embed Calculator Instructions */}
          {isCorporate && user && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-6 animate-slide-up">
              <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                Embed Calculator on Your Website
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Add a Nigerian tax calculator directly to your website. Users can calculate taxes without leaving your site.
              </p>

              <div className="space-y-5">
                {/* Step-by-step instructions */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h3 className="text-sm font-medium text-foreground mb-2">How it works</h3>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Create an API key above (if you haven't already)</li>
                    <li>Copy one of the embed snippets below</li>
                    <li>Paste it into your website's HTML where you want the calculator to appear</li>
                    <li>Optionally <button onClick={() => navigate('/partner-branding')} className="text-primary underline">customize the branding</button> to match your site</li>
                  </ol>
                </div>

                {/* Option 1: JavaScript SDK */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">Option 1: JavaScript SDK (Recommended)</Label>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`<div id="taxforge-calculator"></div>\n<script src="${window.location.origin}/embed.js"></script>\n<script>\n  TaxForge.init({\n    container: '#taxforge-calculator',\n    apiKey: '${activeKey}'\n  });\n</script>`)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="p-4 rounded-lg bg-secondary/80 overflow-x-auto text-xs font-mono text-foreground whitespace-pre-wrap break-all">
{`<div id="taxforge-calculator"></div>
<script src="${window.location.origin}/embed.js"></script>
<script>
  TaxForge.init({
    container: '#taxforge-calculator',
    apiKey: '${activeKey}'
  });
</script>`}
                  </pre>
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste this snippet in your HTML. The SDK auto-creates a responsive iframe.
                  </p>
                </div>

                {/* Option 2: iFrame */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">Option 2: Direct iFrame</Label>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`<iframe\n  src="${window.location.origin}/embed/calculator?key=${activeKey}"\n  width="100%"\n  height="600"\n  frameborder="0"\n  style="border-radius: 12px; max-width: 500px;"\n></iframe>`)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="p-4 rounded-lg bg-secondary/80 overflow-x-auto text-xs font-mono text-foreground whitespace-pre-wrap break-all">
{`<iframe
  src="${window.location.origin}/embed/calculator?key=${activeKey}"
  width="100%"
  height="600"
  frameborder="0"
  style="border-radius: 12px; max-width: 500px;"
></iframe>`}
                  </pre>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use this if you prefer a plain iframe without the SDK.
                  </p>
                </div>

                {/* Listening for results */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Listening for Calculation Results (Optional)</Label>
                  <pre className="p-4 rounded-lg bg-secondary/80 overflow-x-auto text-xs font-mono text-foreground whitespace-pre-wrap break-all">
{`window.addEventListener('message', (event) => {
  if (event.data?.type === 'taxforge-calculation') {
    console.log('Tax result:', event.data.data);
    // { totalTaxPayable, taxableIncome, effectiveRate, ... }
  }
});`}
                  </pre>
                  <p className="text-xs text-muted-foreground mt-1">
                    The embedded calculator posts results via <code>postMessage</code> so your page can react to calculations.
                  </p>
                </div>
              </div>
            </div>
          )}

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
              <li>• 10,000 requests/day (Business plan)</li>
              <li>• 100,000 requests/day (Corporate plan)</li>
              <li>• Custom limits (Partner keys, admin-created)</li>
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
    </PageLayout>
  );
};

export default ApiDocs;
