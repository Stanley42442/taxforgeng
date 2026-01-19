import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { useOfflineData } from '@/contexts/OfflineDataContext';
import { IntegrityStatus } from '@/hooks/useDataIntegrity';

const statusConfig: Record<IntegrityStatus, { icon: typeof CheckCircle; color: string; label: string }> = {
  healthy: { icon: CheckCircle, color: 'text-success', label: 'Healthy' },
  issues: { icon: AlertTriangle, color: 'text-yellow-500', label: 'Minor Issues' },
  critical: { icon: XCircle, color: 'text-destructive', label: 'Critical' },
  unknown: { icon: Shield, color: 'text-muted-foreground', label: 'Unknown' },
};

export const IntegrityStatusCard: React.FC = () => {
  const { 
    integrityStatus, 
    lastIntegrityCheck,
    quarantinedCount,
    isVerifyingIntegrity,
    runIntegrityCheck,
  } = useOfflineData();

  const config = statusConfig[integrityStatus];
  const StatusIcon = config.icon;

  const formatLastCheck = (date: Date | null) => {
    if (!date) return 'Never';
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          Data Integrity
          <Badge 
            variant={integrityStatus === 'healthy' ? 'default' : 'destructive'}
            className="ml-auto"
          >
            <StatusIcon className={`h-3 w-3 mr-1 ${config.color}`} />
            {config.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold text-success">✓</p>
            <p className="text-xs text-muted-foreground">Verified</p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold text-yellow-500">
              {integrityStatus === 'issues' ? '!' : '0'}
            </p>
            <p className="text-xs text-muted-foreground">Repaired</p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold text-destructive">{quarantinedCount}</p>
            <p className="text-xs text-muted-foreground">Quarantined</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last check:</span>
          <span>{formatLastCheck(lastIntegrityCheck)}</span>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => runIntegrityCheck()}
          disabled={isVerifyingIntegrity}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isVerifyingIntegrity ? 'animate-spin' : ''}`} />
          {isVerifyingIntegrity ? 'Verifying...' : 'Run Integrity Check'}
        </Button>
      </CardContent>
    </Card>
  );
};
