import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Shield, CreditCard, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TermsAcceptanceGateProps {
  open: boolean;
  onAccept: () => void;
}

export const TermsAcceptanceGate = ({ open, onAccept }: TermsAcceptanceGateProps) => {
  const [allPoliciesChecked, setAllPoliciesChecked] = useState(false);

  const handleContinue = () => {
    if (allPoliciesChecked) {
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg sm:max-w-xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Before You Continue
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Please review and accept our policies to create your account
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Terms of Service */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold">Terms & Conditions</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>Tax calculations are estimates for planning purposes only</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>This is not professional tax advice</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>You are responsible for verifying all calculations</span>
                    </li>
                  </ul>
                  <Link 
                    to="/terms-and-conditions" 
                    target="_blank" 
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Read full Terms & Conditions <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-success/10 p-2">
                  <Shield className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold">Privacy Policy</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-success shrink-0" />
                      <span>NDPA 2023 compliant data handling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-success shrink-0" />
                      <span>AES-256 encryption for your data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-success shrink-0" />
                      <span>We never sell your data to third parties</span>
                    </li>
                  </ul>
                  <Link 
                    to="/privacy-policy" 
                    target="_blank" 
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Read full Privacy Policy <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Refund Policy */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-accent/10 p-2">
                  <CreditCard className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold">Refund Policy</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                      <span>7-day free trial, cancel anytime</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                      <span>Pro-rated refunds available within 30 days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                      <span>No refunds after 30 days of subscription</span>
                    </li>
                  </ul>
                  <Link 
                    to="/refund-policy" 
                    target="_blank" 
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Read full Refund Policy <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Single Acceptance Checkbox */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="all-policies"
                  checked={allPoliciesChecked}
                  onCheckedChange={(checked) => setAllPoliciesChecked(checked === true)}
                  className="mt-0.5"
                />
                <label htmlFor="all-policies" className="text-sm cursor-pointer leading-relaxed">
                  I have read and agree to the{' '}
                  <Link to="/terms-and-conditions" target="_blank" className="text-primary hover:underline font-medium">
                    Terms & Conditions
                  </Link>,{' '}
                  <Link to="/privacy-policy" target="_blank" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </Link>, and{' '}
                  <Link to="/refund-policy" target="_blank" className="text-primary hover:underline font-medium">
                    Refund Policy
                  </Link>
                </label>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t">
          <Button 
            onClick={handleContinue} 
            disabled={!allPoliciesChecked}
            className="w-full"
            size="lg"
          >
            Continue to Create Account
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-3">
            By continuing, you confirm that you are at least 18 years old
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
