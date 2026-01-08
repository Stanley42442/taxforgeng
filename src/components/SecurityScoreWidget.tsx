import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Smartphone,
  Key,
  Mail,
  Lock,
  Globe
} from "lucide-react";

interface SecurityFactor {
  name: string;
  description: string;
  points: number;
  maxPoints: number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
}

interface SecurityScoreWidgetProps {
  isEmailVerified: boolean;
  hasMfaEnabled: boolean;
  hasBackupCodes: boolean;
  remainingBackupCodes: number;
  recentLoginCount: number;
  hasKnownDevices?: boolean;
  passwordLastChanged?: Date | null;
}

export const SecurityScoreWidget = ({
  isEmailVerified,
  hasMfaEnabled,
  hasBackupCodes,
  remainingBackupCodes,
  recentLoginCount,
  hasKnownDevices = true,
  passwordLastChanged
}: SecurityScoreWidgetProps) => {
  const { t } = useLanguage();
  
  const factors = useMemo<SecurityFactor[]>(() => {
    const result: SecurityFactor[] = [];
    
    // Email verification (20 points)
    result.push({
      name: t('security.score.emailVerified'),
      description: isEmailVerified ? t('security.score.emailVerifiedDesc') : t('security.score.emailNotVerifiedDesc'),
      points: isEmailVerified ? 20 : 0,
      maxPoints: 20,
      status: isEmailVerified ? 'good' : 'critical',
      icon: <Mail className="h-4 w-4" />
    });
    
    // 2FA enabled (30 points)
    result.push({
      name: t('security.score.twoFactor'),
      description: hasMfaEnabled ? t('security.score.twoFactorEnabledDesc') : t('security.score.twoFactorDisabledDesc'),
      points: hasMfaEnabled ? 30 : 0,
      maxPoints: 30,
      status: hasMfaEnabled ? 'good' : 'critical',
      icon: <Smartphone className="h-4 w-4" />
    });
    
    // Backup codes (15 points)
    let backupStatus: 'good' | 'warning' | 'critical' = 'critical';
    let backupPoints = 0;
    if (remainingBackupCodes >= 5) {
      backupStatus = 'good';
      backupPoints = 15;
    } else if (remainingBackupCodes >= 2) {
      backupStatus = 'warning';
      backupPoints = 10;
    } else if (remainingBackupCodes > 0) {
      backupStatus = 'warning';
      backupPoints = 5;
    }
    
    result.push({
      name: t('security.score.backupCodes'),
      description: hasBackupCodes 
        ? t('security.score.backupCodesRemaining').replace('{count}', String(remainingBackupCodes))
        : t('security.score.generateBackupCodes'),
      points: backupPoints,
      maxPoints: 15,
      status: backupStatus,
      icon: <Key className="h-4 w-4" />
    });
    
    // Password age (20 points) - newer is better
    let passwordPoints = 10; // Base points if we don't know
    let passwordStatus: 'good' | 'warning' | 'critical' = 'warning';
    let passwordDesc = t('security.score.passwordGeneral');
    
    if (passwordLastChanged) {
      const daysSinceChange = Math.floor((Date.now() - passwordLastChanged.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceChange < 90) {
        passwordPoints = 20;
        passwordStatus = 'good';
        passwordDesc = t('security.score.passwordRecent');
      } else if (daysSinceChange < 180) {
        passwordPoints = 15;
        passwordStatus = 'good';
        passwordDesc = t('security.score.passwordUpToDate');
      } else if (daysSinceChange < 365) {
        passwordPoints = 10;
        passwordStatus = 'warning';
        passwordDesc = t('security.score.passwordOldWarning');
      } else {
        passwordPoints = 5;
        passwordStatus = 'critical';
        passwordDesc = t('security.score.passwordVeryOld');
      }
    }
    
    result.push({
      name: t('security.score.passwordHealth'),
      description: passwordDesc,
      points: passwordPoints,
      maxPoints: 20,
      status: passwordStatus,
      icon: <Lock className="h-4 w-4" />
    });
    
    // Known devices (15 points)
    result.push({
      name: t('security.score.deviceRecognition'),
      description: hasKnownDevices ? t('security.score.deviceTrackingEnabled') : t('security.score.deviceTrackingDisabled'),
      points: hasKnownDevices ? 15 : 0,
      maxPoints: 15,
      status: hasKnownDevices ? 'good' : 'warning',
      icon: <Globe className="h-4 w-4" />
    });
    
    return result;
  }, [isEmailVerified, hasMfaEnabled, hasBackupCodes, remainingBackupCodes, hasKnownDevices, passwordLastChanged, t]);
  
  const totalScore = useMemo(() => 
    factors.reduce((sum, f) => sum + f.points, 0), 
    [factors]
  );
  
  const maxScore = useMemo(() => 
    factors.reduce((sum, f) => sum + f.maxPoints, 0), 
    [factors]
  );
  
  const scorePercentage = Math.round((totalScore / maxScore) * 100);
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-destructive';
  };
  
  const getScoreLabel = (percentage: number) => {
    if (percentage >= 90) return t('security.score.excellent');
    if (percentage >= 80) return t('security.score.veryGood');
    if (percentage >= 60) return t('security.score.good');
    if (percentage >= 40) return t('security.score.fair');
    return t('security.score.needsImprovement');
  };
  
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-amber-500';
    return 'bg-destructive';
  };
  
  const getStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t('security.score.title')}
            </CardTitle>
            <CardDescription>{t('security.score.description')}</CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(scorePercentage)}`}>
              {scorePercentage}%
            </div>
            <Badge 
              variant="outline" 
              className={`${getScoreColor(scorePercentage)} border-current`}
            >
              {getScoreLabel(scorePercentage)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall progress bar */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${getProgressColor(scorePercentage)}`}
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {totalScore} / {maxScore} {t('security.score.points')}
          </p>
        </div>
        
        {/* Individual factors */}
        <div className="space-y-3 pt-2">
          {factors.map((factor) => (
            <div 
              key={factor.name}
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
            >
              <div className={`p-2 rounded-full ${
                factor.status === 'good' 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : factor.status === 'warning'
                    ? 'bg-amber-100 dark:bg-amber-900/30'
                    : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {factor.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{factor.name}</span>
                  {getStatusIcon(factor.status)}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {factor.description}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-sm font-semibold ${
                  factor.status === 'good' 
                    ? 'text-green-600' 
                    : factor.status === 'warning'
                      ? 'text-amber-600'
                      : 'text-destructive'
                }`}>
                  +{factor.points}
                </span>
                <span className="text-xs text-muted-foreground">/{factor.maxPoints}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Recommendations */}
        {scorePercentage < 100 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">{t('security.score.quickImprovements')}</p>
            <div className="space-y-1">
              {factors
                .filter(f => f.points < f.maxPoints)
                .slice(0, 2)
                .map((f) => (
                  <div key={f.name} className="flex items-center gap-2 text-xs">
                    <AlertCircle className="h-3 w-3 text-amber-600 shrink-0" />
                    <span>{f.description}</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
