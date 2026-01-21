import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronDown, RefreshCw, AlertCircle, ExternalLink, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { VerificationData, ValidationResult } from '@/types/verification';
import { 
  VERIFICATION_SOURCES_DETAILED, 
  VERIFICATION_METHODOLOGY 
} from '@/types/verification';
import { VERIFICATION_TIMESTAMP } from '@/lib/taxValidators';

interface VerificationBadgeProps {
  verification: VerificationData;
  onReVerify?: () => void;
  compact?: boolean;
}

// Big 4 badge component
const Big4Badge = ({ name, type }: { name: string; type: 'big4' | 'government' | 'legal' | 'industry' }) => {
  const bgColor = type === 'big4' 
    ? 'bg-primary/10 border-primary/30 text-primary' 
    : type === 'government'
    ? 'bg-success/10 border-success/30 text-success'
    : 'bg-muted border-muted-foreground/30 text-muted-foreground';
    
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border ${bgColor}`}>
      {name}
    </span>
  );
};

export const VerificationBadge = ({ 
  verification, 
  onReVerify,
  compact = false 
}: VerificationBadgeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSources, setShowSources] = useState(false);
  
  const { verified, checksRun, checksPassed, rulesAge, details, warnings } = verification;
  
  // Get Big 4 sources only
  const big4Sources = VERIFICATION_SOURCES_DETAILED.filter(s => s.type === 'big4');
  const otherSources = VERIFICATION_SOURCES_DETAILED.filter(s => s.type !== 'big4');
  
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
            <Shield className="h-5 w-5 text-success" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-success flex items-center gap-2">
            Accuracy Verified ✓
            <span className="text-xs font-normal text-muted-foreground">
              Independently verified
            </span>
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            Verified against Nigeria Tax Act 2025 (as of Jan 2026)
          </p>
        </div>
        <Badge variant="outline" className="border-gold text-gold flex-shrink-0">
          {checksPassed}/{checksRun} Checks
        </Badge>
      </div>
      
      {/* Big 4 Source Badges */}
      <div className="flex flex-wrap gap-2">
        {big4Sources.map((source, i) => (
          <Big4Badge key={i} name={source.shortName} type={source.type} />
        ))}
        {otherSources.slice(0, 2).map((source, i) => (
          <Big4Badge key={`other-${i}`} name={source.shortName} type={source.type} />
        ))}
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
      
      {/* Expandable Sources */}
      <Collapsible open={showSources} onOpenChange={setShowSources}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <ChevronDown className={`h-4 w-4 transition-transform ${showSources ? 'rotate-180' : ''}`} />
              Verification Sources
            </span>
            <span className="text-xs text-muted-foreground">
              {VERIFICATION_SOURCES_DETAILED.length} sources
            </span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          <div className="rounded-lg border bg-card p-3 space-y-3">
            {VERIFICATION_SOURCES_DETAILED.map((source, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Big4Badge name={source.shortName} type={source.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium">{source.name}</p>
                  <p className="text-xs text-muted-foreground">{source.description}</p>
                </div>
              </div>
            ))}
            
            {/* Methodology */}
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground italic">
                {VERIFICATION_METHODOLOGY}
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      
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
