import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Ban, 
  Clock, 
  MapPin, 
  Globe, 
  Loader2, 
  RefreshCw,
  AlertTriangle,
  Monitor
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format } from "date-fns";

interface BlockedAttempt {
  id: string;
  alert_type: string;
  created_at: string;
  message_preview: string | null;
  delivery_method: string;
  status: string;
  ip_address?: string;
  location?: {
    city?: string;
    country?: string;
  };
  device_info?: {
    browser?: string;
    os?: string;
    deviceName?: string;
  };
  time_info?: {
    hour?: number;
    timezone?: string;
  };
}

interface BlockedLoginAttemptsLogProps {
  userId: string;
}

export const BlockedLoginAttemptsLog = ({ userId }: BlockedLoginAttemptsLogProps) => {
  const [attempts, setAttempts] = useState<BlockedAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBlockedAttempts = async () => {
    try {
      // Fetch blocked login attempts from notification_deliveries
      const { data, error } = await supabase
        .from('notification_deliveries')
        .select('*')
        .eq('user_id', userId)
        .in('alert_type', ['ip_blocked', 'time_restricted'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Parse the message preview to extract details
      const parsedAttempts: BlockedAttempt[] = (data || []).map(item => {
        const attempt: BlockedAttempt = {
          id: item.id,
          alert_type: item.alert_type,
          created_at: item.created_at,
          message_preview: item.message_preview,
          delivery_method: item.delivery_method,
          status: item.status
        };

        // Try to extract IP address from message preview
        if (item.message_preview) {
          const ipMatch = item.message_preview.match(/from\s+([\d.]+)/i);
          if (ipMatch) {
            attempt.ip_address = ipMatch[1];
          }
          
          // Extract location
          const locationMatch = item.message_preview.match(/Location:\s*([^.]+)/i);
          if (locationMatch) {
            const parts = locationMatch[1].split(',').map((s: string) => s.trim());
            attempt.location = {
              city: parts[0],
              country: parts[1]
            };
          }

          // Extract time info for time_restricted
          if (item.alert_type === 'time_restricted') {
            const hourMatch = item.message_preview.match(/(\d{1,2}):00/);
            const tzMatch = item.message_preview.match(/\(([^)]+)\)/);
            if (hourMatch) {
              attempt.time_info = {
                hour: parseInt(hourMatch[1]),
                timezone: tzMatch?.[1] || undefined
              };
            }
          }
        }

        return attempt;
      });

      setAttempts(parsedAttempts);
    } catch (error) {
      console.error("Error loading blocked attempts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBlockedAttempts();
  }, [userId]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('blocked-attempts-log')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_deliveries',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newItem = payload.new as any;
          if (newItem.alert_type === 'ip_blocked' || newItem.alert_type === 'time_restricted') {
            loadBlockedAttempts();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBlockedAttempts();
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'ip_blocked':
        return <Ban className="h-4 w-4 text-destructive" />;
      case 'time_restricted':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertLabel = (alertType: string) => {
    switch (alertType) {
      case 'ip_blocked':
        return 'IP Not Whitelisted';
      case 'time_restricted':
        return 'Outside Allowed Hours';
      default:
        return 'Blocked';
    }
  };

  const getAlertBadgeVariant = (alertType: string): 'destructive' | 'secondary' => {
    return alertType === 'ip_blocked' ? 'destructive' : 'secondary';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Blocked Login Attempts
            </CardTitle>
            <CardDescription>
              Recent login attempts that were blocked by your security rules
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {attempts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No blocked attempts</p>
            <p className="text-sm">When login attempts are blocked, they'll appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className={`p-4 rounded-lg border ${
                    attempt.alert_type === 'ip_blocked'
                      ? 'bg-destructive/5 border-destructive/20'
                      : 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/50 dark:border-amber-800/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getAlertIcon(attempt.alert_type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getAlertBadgeVariant(attempt.alert_type)} className="text-xs">
                          {getAlertLabel(attempt.alert_type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(attempt.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {/* IP Address */}
                        {attempt.ip_address && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="h-3.5 w-3.5 shrink-0" />
                            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded truncate">
                              {attempt.ip_address}
                            </code>
                          </div>
                        )}

                        {/* Location */}
                        {attempt.location && (attempt.location.city || attempt.location.country) && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-xs truncate">
                              {[attempt.location.city, attempt.location.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}

                        {/* Time info for time_restricted */}
                        {attempt.time_info && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-xs">
                              {attempt.time_info.hour !== undefined && `${attempt.time_info.hour}:00`}
                              {attempt.time_info.timezone && ` (${attempt.time_info.timezone})`}
                            </span>
                          </div>
                        )}

                        {/* Delivery method */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Monitor className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-xs capitalize">
                            Alert via {attempt.delivery_method}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {format(new Date(attempt.created_at), 'PPpp')}
                      </p>
                    </div>
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
