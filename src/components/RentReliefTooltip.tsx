import { Info, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RentReliefTooltipProps {
  showWarning?: boolean;
  warningMessage?: string;
  className?: string;
}

export const RentReliefTooltip = ({ className }: RentReliefTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={className}>
          <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4" side="right">
          <p className="font-semibold mb-2">Annual Rent Paid (Optional)</p>
          <p className="text-sm mb-2">
            Under 2026 rules, employees can claim Rent Relief (20% of actual rent, max ₦500,000) 
            to reduce PAYE.
          </p>
          <p className="text-sm mb-2">
            This requires proof (tenancy agreement/receipts) submitted to your employer for 
            verification and monthly adjustment.
          </p>
          <p className="text-sm mb-2">
            <strong>Self-employed:</strong> Claim via annual NRS return.
          </p>
          <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
            Source: Nigeria Tax Act 2025 – targeted relief replacing old CRA.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface RentReliefWarningsProps {
  annualRent: number;
  annualGross: number;
}

export const RentReliefWarnings = ({ annualRent, annualGross }: RentReliefWarningsProps) => {
  const reliefCap = 500000;
  const maxRentForFullRelief = reliefCap / 0.20; // ₦2,500,000
  
  const showCapWarning = annualRent > maxRentForFullRelief;
  const showHighRentWarning = annualGross > 0 && annualRent > (annualGross * 0.5);
  
  if (!showCapWarning && !showHighRentWarning) return null;
  
  return (
    <div className="space-y-2">
      {showCapWarning && (
        <Alert variant="default" className="py-2 border-info/50 bg-info/10">
          <Info className="h-4 w-4 text-info" />
          <AlertDescription className="text-xs text-info">
            Relief capped at ₦500,000 (20% of ₦2.5M rent maximum)
          </AlertDescription>
        </Alert>
      )}
      
      {showHighRentWarning && (
        <Alert variant="default" className="py-2 border-warning/50 bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-xs text-warning">
            High rent? Rent exceeds 50% of annual gross. Ensure proof ready for employer verification.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export const RentReliefBanner = () => {
  return (
    <div className="rounded-lg border border-info/30 bg-info/5 p-4 text-sm">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p className="font-medium text-foreground">Annual Rent Paid (Optional)</p>
          <p className="text-muted-foreground">
            Under 2026 rules, employees can claim Rent Relief (20% of actual rent, max ₦500,000) 
            to reduce PAYE.
          </p>
          <p className="text-muted-foreground">
            This requires proof (tenancy agreement/receipts) submitted to your employer for 
            verification and monthly adjustment.
          </p>
          <p className="text-muted-foreground">
            <strong>Self-employed:</strong> Claim via annual NRS return.
          </p>
          <p className="text-xs text-muted-foreground border-t border-info/20 pt-2 mt-2">
            Source: Nigeria Tax Act 2025 – targeted relief replacing old CRA.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RentReliefTooltip;
