import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Smartphone, 
  Mail, 
  XCircle, 
  Loader2, 
  RefreshCw,
  Filter,
  CheckCircle2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface NotificationDelivery {
  id: string;
  alert_type: string;
  delivery_method: 'whatsapp' | 'sms' | 'email' | 'failed';
  recipient: string;
  message_preview: string | null;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  error_message: string | null;
  created_at: string;
}

const getMethodIcon = (method: string) => {
  switch (method) {
    case 'whatsapp':
      return <MessageCircle className="h-4 w-4 text-green-500" />;
    case 'sms':
      return <Smartphone className="h-4 w-4 text-blue-500" />;
    case 'email':
      return <Mail className="h-4 w-4 text-purple-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Mail className="h-4 w-4 text-muted-foreground" />;
  }
};

const getMethodLabel = (method: string) => {
  switch (method) {
    case 'whatsapp':
      return 'WhatsApp';
    case 'sms':
      return 'SMS';
    case 'email':
      return 'Email';
    case 'failed':
      return 'Failed';
    default:
      return method;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'sent':
      return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Sent</Badge>;
    case 'delivered':
      return <Badge variant="outline" className="text-blue-600 border-blue-600"><CheckCircle2 className="h-3 w-3 mr-1" />Delivered</Badge>;
    case 'failed':
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
    case 'pending':
      return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Pending</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getAlertTypeLabel = (alertType: string) => {
  const labels: Record<string, string> = {
    'failed_backup_codes': 'Failed Backup Codes',
    'account_locked': 'Account Locked',
    'new_device': 'New Device',
    'device_removed': 'Device Removed',
    'sessions_revoked': 'Sessions Revoked',
    'new_location': 'New Location',
    'device_blocked': 'Device Blocked',
    'password_changed': 'Password Changed',
    '2fa_enabled': '2FA Enabled',
    '2fa_disabled': '2FA Disabled',
    'backup_codes_generated': 'Backup Codes Generated',
    'email_changed': 'Email Changed',
    'unusual_time': 'Unusual Time',
    'ip_blocked': 'IP Blocked',
    'time_restricted': 'Time Restricted',
  };
  return labels[alertType] || alertType;
};

const maskRecipient = (recipient: string, method: string) => {
  if (method === 'email') {
    const [localPart, domain] = recipient.split('@');
    if (localPart.length <= 3) return `***@${domain}`;
    return `${localPart.slice(0, 3)}***@${domain}`;
  }
  // For phone numbers, show last 4 digits
  if (recipient.length > 4) {
    return `***${recipient.slice(-4)}`;
  }
  return '****';
};

export const NotificationDeliveryLog = () => {
  const [deliveries, setDeliveries] = useState<NotificationDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>('all');

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('notification_deliveries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (methodFilter !== 'all') {
        query = query.eq('delivery_method', methodFilter);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (alertTypeFilter !== 'all') {
        query = query.eq('alert_type', alertTypeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDeliveries((data || []) as NotificationDelivery[]);
    } catch (error) {
      console.error("Error fetching notification deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [methodFilter, statusFilter, alertTypeFilter]);

  // Get unique alert types from deliveries
  const uniqueAlertTypes = [...new Set(deliveries.map(d => d.alert_type))];

  // Calculate stats
  const stats = {
    total: deliveries.length,
    whatsapp: deliveries.filter(d => d.delivery_method === 'whatsapp').length,
    sms: deliveries.filter(d => d.delivery_method === 'sms').length,
    email: deliveries.filter(d => d.delivery_method === 'email').length,
    failed: deliveries.filter(d => d.delivery_method === 'failed' || d.status === 'failed').length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Notification Delivery Log
            </CardTitle>
            <CardDescription>
              Track which notifications were sent via WhatsApp, SMS, or Email
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDeliveries} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
            <p className="text-2xl font-bold text-green-600">{stats.whatsapp}</p>
            <p className="text-xs text-green-600">WhatsApp</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="text-2xl font-bold text-blue-600">{stats.sms}</p>
            <p className="text-xs text-blue-600">SMS</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <p className="text-2xl font-bold text-purple-600">{stats.email}</p>
            <p className="text-xs text-purple-600">Email</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            <p className="text-xs text-red-600">Failed</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={alertTypeFilter} onValueChange={setAlertTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Alert Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Alerts</SelectItem>
              <SelectItem value="account_locked">Account Locked</SelectItem>
              <SelectItem value="failed_backup_codes">Failed Backup Codes</SelectItem>
              <SelectItem value="new_device">New Device</SelectItem>
              <SelectItem value="password_changed">Password Changed</SelectItem>
              <SelectItem value="ip_blocked">IP Blocked</SelectItem>
              <SelectItem value="time_restricted">Time Restricted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Delivery List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : deliveries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No notification deliveries found</p>
            <p className="text-sm">Deliveries will appear here when security alerts are sent</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="shrink-0 mt-0.5">
                    {getMethodIcon(delivery.delivery_method)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {getAlertTypeLabel(delivery.alert_type)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {getMethodLabel(delivery.delivery_method)}
                      </Badge>
                      {getStatusBadge(delivery.status)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>To: {maskRecipient(delivery.recipient, delivery.delivery_method)}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(delivery.created_at), { addSuffix: true })}</span>
                    </div>
                    {delivery.message_preview && (
                      <p className="text-xs text-muted-foreground truncate max-w-md">
                        {delivery.message_preview}
                      </p>
                    )}
                    {delivery.error_message && (
                      <p className="text-xs text-destructive">
                        Error: {delivery.error_message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
