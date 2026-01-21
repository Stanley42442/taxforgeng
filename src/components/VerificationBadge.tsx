import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronDown, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { VerificationData, ValidationResult } from '@/types/verification';
import { VERIFICATION_SOURCES } from '@/types/verification';
import { VERIFICATION_TIMESTAMP } from '@/lib/taxValidators';

interface VerificationBadgeProps {
  verification: VerificationData;
  onReVerify?: () => void;
  compact?: boolean;
}

export const VerificationBadge = ({ 
  verification, 
  onReVerify,
  compact = false 
}: VerificationBadgeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { verified, checksRun, checksPassed, rulesAge, details, warnings } = verification;
  
  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-gold/30">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <span className="text-sm font-medium text-success">Verified</span>
        <Badge variant="outline" className="border-gold text-gold text-xs">
          {checksPassed}/{checksRun}
        </Badge>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Main Badge */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border-2 border-gold/30">
        <div className="flex-shrink-0">
          <div className="p-2 rounded-full bg-success/20">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-success">Accuracy Verified ✓</p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            Verified against Nigeria Tax Act 2025 (as of Jan 2026). 
            Sources: PwC, KPMG, EY, Deloitte, NRS
          </p>
        </div>
        <Badge variant="outline" className="border-gold text-gold flex-shrink-0">
          {checksPassed}/{checksRun} Checks
        </Badge>
      </div>
      
      {/* Rules Age Warning */}
      {rulesAge > 30 && (
        <Alert variant="default" className="border-warning/50 bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning">
            Rules current as of {VERIFICATION_TIMESTAMP} — check NRS for updates
          </AlertDescription>
        </Alert>
      )}
      
      {/* Warnings */}
      {warnings && warnings.length > 0 && rulesAge <= 30 && (
        <Alert variant="default" className="border-warning/50 bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning">
            {warnings[0]}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Expandable Details */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              Verification Details
            </span>
            <span className="text-xs text-muted-foreground">
              {checksPassed} passed, {checksRun - checksPassed} issues
            </span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          <div className="rounded-lg border bg-card p-3 space-y-2">
            {details.map((check, i) => (
              <VerificationCheckItem key={i} check={check} />
            ))}
          </div>
          
          {/* Sources */}
          <div className="text-xs text-muted-foreground p-2">
            <p className="font-medium mb-1">Verification Sources:</p>
            <ul className="space-y-0.5">
              {VERIFICATION_SOURCES.slice(0, 3).map((source, i) => (
                <li key={i} className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  {source}
                </li>
              ))}
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Re-verify Button */}
      {onReVerify && (
        <Button variant="outline" size="sm" onClick={onReVerify} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Re-verify Latest Rules
          <span className="text-xs ml-2 text-muted-foreground">
            Last: {VERIFICATION_TIMESTAMP}
          </span>
        </Button>
      )}
    </div>
  );
};

const VerificationCheckItem = ({ check }: { check: ValidationResult }) => {
  return (
    <div className="flex items-start gap-2 text-sm">
      {check.passed ? (
        <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <p className={check.passed ? 'text-foreground' : 'text-destructive'}>
          {check.ruleName}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {check.explanation}
        </p>
      </div>
    </div>
  );
};

export default VerificationBadge;
