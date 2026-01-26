import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Webhook, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Copy,
  ExternalLink,
  Loader2,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import logger from "@/lib/logger";

interface WebhookLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  new_values: any;
  created_at: string;
}

interface TestResult {
  success: boolean;
  message: string;
  responseTime: number;
  statusCode?: number;
}

const WEBHOOK_EVENTS = [
  { value: 'charge.success', label: 'Charge Success', description: 'Triggered when a payment is successful' },
  { value: 'subscription.create', label: 'Subscription Create', description: 'Triggered when a subscription is created' },
  { value: 'subscription.disable', label: 'Subscription Disable', description: 'Triggered when a subscription is cancelled' },
  { value: 'invoice.payment_failed', label: 'Invoice Payment Failed', description: 'Triggered when a subscription payment fails' },
];

const WebhookTesting = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  
  // Test form state
  const [selectedEvent, setSelectedEvent] = useState('charge.success');
  const [testReference, setTestReference] = useState(`TEST-${Date.now()}`);
  const [testAmount, setTestAmount] = useState('50000');
  const [testEmail, setTestEmail] = useState('');

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paystack-webhook`;

  useEffect(() => {
    if (user?.email) {
      setTestEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (!adminLoading && user) {
      fetchWebhookLogs();
    }
  }, [adminLoading, user]);

  const fetchWebhookLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_audit_log')
        .select('*')
        .like('action', 'webhook_%')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setWebhookLogs(data || []);
    } catch (error) {
      logger.error('Error fetching webhook logs:', error);
      toast.error('Failed to fetch webhook logs');
    } finally {
      setLoading(false);
    }
  };

  const generateTestPayload = () => {
    const basePayload = {
      event: selectedEvent,
      data: {
        reference: testReference,
        amount: parseInt(testAmount, 10) || 0,
        customer: {
          email: testEmail,
          customer_code: `CUS_test_${Date.now()}`
        }
      }
    };

    switch (selectedEvent) {
      case 'charge.success':
        return {
          ...basePayload,
          data: {
            ...basePayload.data,
            status: 'success',
            gateway_response: 'Successful',
            channel: 'card',
            currency: 'NGN',
            ip_address: '127.0.0.1',
            paid_at: new Date().toISOString()
          }
        };
      case 'subscription.create':
        return {
          ...basePayload,
          data: {
            ...basePayload.data,
            subscription_code: `SUB_test_${Date.now()}`,
            plan: {
              plan_code: 'PLN_test',
              name: 'Test Plan'
            },
            next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            authorization: {
              authorization_code: `AUTH_test_${Date.now()}`
            }
          }
        };
      case 'subscription.disable':
        return {
          ...basePayload,
          data: {
            ...basePayload.data,
            subscription_code: `SUB_test_${Date.now()}`,
            status: 'cancelled'
          }
        };
      case 'invoice.payment_failed':
        return {
          ...basePayload,
          data: {
            ...basePayload.data,
            subscription: {
              subscription_code: `SUB_test_${Date.now()}`
            },
            status: 'failed',
            gateway_response: 'Insufficient Funds'
          }
        };
      default:
        return basePayload;
    }
  };

  const runWebhookTest = async () => {
    setTesting(true);
    setTestResult(null);
    const startTime = Date.now();

    try {
      // Note: This is a simulated test since we can't actually send webhook requests
      // In production, you'd use Paystack's webhook testing feature or ngrok
      
      const payload = generateTestPayload();
      
      // Log the test attempt
      await supabase.from('payment_audit_log').insert({
        action: 'webhook_test_simulated',
        entity_type: 'test',
        entity_id: testReference,
        new_values: {
          event: selectedEvent,
          payload,
          tester_id: user?.id
        }
      });

      const responseTime = Date.now() - startTime;

      setTestResult({
        success: true,
        message: `Webhook test for "${selectedEvent}" logged successfully. In production, use Paystack's test webhook feature.`,
        responseTime,
        statusCode: 200
      });

      toast.success('Test logged successfully');
      fetchWebhookLogs();

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Test failed';
      setTestResult({
        success: false,
        message,
        responseTime
      });
      toast.error('Test failed');
    } finally {
      setTesting(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success('Webhook URL copied to clipboard');
  };

  const getEventBadgeColor = (action: string) => {
    if (action.includes('success')) return 'bg-success text-success-foreground';
    if (action.includes('failed')) return 'bg-destructive text-destructive-foreground';
    if (action.includes('create')) return 'bg-info text-info-foreground';
    if (action.includes('disable') || action.includes('cancel')) return 'bg-warning text-warning-foreground';
    return 'bg-secondary';
  };

  if (adminLoading || loading) {
    return (
      <PageLayout title="Webhook Testing" icon={Webhook} maxWidth="6xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!isAdmin) {
    return (
      <PageLayout title="Webhook Testing" icon={Webhook} maxWidth="6xl">
        <div className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Webhook Testing" description="Test and monitor Paystack webhook integrations" icon={Webhook} maxWidth="6xl">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Webhook Configuration */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Configuration
            </CardTitle>
            <CardDescription>
              Configure this URL in your Paystack dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Webhook URL</Label>
              <div className="flex gap-2 mt-1">
                <Input 
                  value={webhookUrl} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="icon" onClick={copyWebhookUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-info/10 border border-info/20">
              <h4 className="font-medium text-info mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Setup Instructions
              </h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Log in to your Paystack Dashboard</li>
                <li>Go to Settings → API Keys & Webhooks</li>
                <li>Paste the webhook URL above</li>
                <li>Save and test using Paystack's built-in tester</li>
              </ol>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open('https://dashboard.paystack.com/#/settings/developer', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Paystack Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* Test Webhook */}
        <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Simulate Webhook Event
            </CardTitle>
            <CardDescription>
              Test webhook handling locally (simulated)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Event Type</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEBHOOK_EVENTS.map(event => (
                    <SelectItem key={event.value} value={event.value}>
                      <div>
                        <div className="font-medium">{event.label}</div>
                        <div className="text-xs text-muted-foreground">{event.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Reference</Label>
                <Input 
                  value={testReference}
                  onChange={(e) => setTestReference(e.target.value)}
                  className="mt-1"
                  placeholder="TFN-TEST-001"
                />
              </div>
              <div>
                <Label>Amount (kobo)</Label>
                <Input 
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  className="mt-1"
                  placeholder="50000"
                />
              </div>
            </div>

            <div>
              <Label>Customer Email</Label>
              <Input 
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="mt-1"
                placeholder="test@example.com"
              />
            </div>

            <div>
              <Label>Test Payload Preview</Label>
              <Textarea 
                value={JSON.stringify(generateTestPayload(), null, 2)}
                readOnly
                className="mt-1 font-mono text-xs h-32"
              />
            </div>

            <Button 
              onClick={runWebhookTest} 
              disabled={testing}
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Test
                </>
              )}
            </Button>

            {testResult && (
              <div className={`p-4 rounded-lg ${testResult.success ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className="font-medium">{testResult.success ? 'Test Passed' : 'Test Failed'}</span>
                  <Badge variant="outline" className="ml-auto">
                    {testResult.responseTime}ms
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{testResult.message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Webhook Logs */}
      <Card className="mt-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Webhook Event Log
            </CardTitle>
            <CardDescription>Recent webhook events received</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchWebhookLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {webhookLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Webhook className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No webhook events recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {webhookLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge className={getEventBadgeColor(log.action)}>
                      {log.action.replace('webhook_', '')}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">
                        {log.entity_id || 'No reference'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, yyyy h:mm:ss a')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {log.new_values?.processed ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <Clock className="h-5 w-5 text-warning" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default WebhookTesting;
