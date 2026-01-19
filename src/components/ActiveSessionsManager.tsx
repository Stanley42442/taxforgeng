import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSessionSecurity } from '@/hooks/useSessionSecurity';
import { Smartphone, Monitor, Tablet, Loader2, XCircle, LogOut } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

function getDeviceIcon(os: string) {
  const osLower = os.toLowerCase();
  if (osLower.includes('android') || osLower.includes('ios')) {
    return <Smartphone className="h-5 w-5" />;
  }
  if (osLower.includes('ipad') || osLower.includes('tablet')) {
    return <Tablet className="h-5 w-5" />;
  }
  return <Monitor className="h-5 w-5" />;
}

export function ActiveSessionsManager() {
  const { 
    sessions, 
    loading, 
    revoking, 
    fetchSessions,
    revokeSession, 
    revokeAllOtherSessions 
  } = useSessionSecurity();

  const otherSessions = sessions.filter(s => !s.isCurrent);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-frosted hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Smartphone className="h-4 w-4 text-primary" />
            </div>
            Active Sessions
          </div>
          {otherSessions.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => revokeAllOtherSessions()}
              disabled={revoking === 'all'}
            >
              {revoking === 'all' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Log Out All Other Devices
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Manage devices where you're currently logged in
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No active sessions found
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div 
                key={session.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-colors",
                  session.isCurrent && "border-primary bg-primary/5"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {getDeviceIcon(session.os)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.deviceName}</p>
                      {session.isCurrent && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {session.browser} on {session.os}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.location?.city && `${session.location.city}, `}
                      {session.location?.country || 'Unknown location'} · {session.ipAddress}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last active {formatDistanceToNow(new Date(session.lastActiveAt))} ago
                    </p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeSession(session.id)}
                    disabled={revoking === session.id}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {revoking === session.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
