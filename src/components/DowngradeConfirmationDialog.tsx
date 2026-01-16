import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, Database, ArrowDown, Check, Info } from "lucide-react";
import { SubscriptionTier } from "@/contexts/SubscriptionContext";
import { motion } from "framer-motion";

interface DowngradeConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: SubscriptionTier;
  targetTier: SubscriptionTier;
  onConfirm: () => void;
}

const TIER_DISPLAY_NAMES: Record<SubscriptionTier, string> = {
  free: 'Individual',
  starter: 'Starter',
  basic: 'Basic',
  professional: 'Professional',
  business: 'Business',
  corporate: 'Corporate',
};

const TIER_ORDER: SubscriptionTier[] = ['free', 'starter', 'basic', 'professional', 'business', 'corporate'];

// Features that will be restricted (but data preserved)
const TIER_RESTRICTIONS: Record<SubscriptionTier, string[]> = {
  free: [
    'Business tax calculator access',
    'PDF/CSV exports',
    'Saved businesses',
    'Email reminders',
    'All premium features',
  ],
  starter: [
    'Multiple saved businesses (limited to 1)',
    'Invoices & P&L statements',
    'OCR receipt scanning',
    'Sector presets',
  ],
  basic: [
    'Payroll calculator',
    'Compliance tracker',
    'Digital VAT calculator',
    'Scenario modeling',
  ],
  professional: [
    'CAC verification',
    'Tax filing preparation',
    'Multi-year projections',
    'Team member seats',
  ],
  business: [
    'Unlimited businesses',
    'API access',
    'Audit log',
    'IP whitelist',
  ],
  corporate: [],
};

export const DowngradeConfirmationDialog = ({
  open,
  onOpenChange,
  currentTier,
  targetTier,
  onConfirm,
}: DowngradeConfirmationDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const currentTierIndex = TIER_ORDER.indexOf(currentTier);
  const targetTierIndex = TIER_ORDER.indexOf(targetTier);
  
  // Get all restrictions from tiers above target
  const restrictions: string[] = [];
  for (let i = targetTierIndex + 1; i <= currentTierIndex; i++) {
    restrictions.push(...TIER_RESTRICTIONS[TIER_ORDER[i]]);
  }

  const handleConfirm = async () => {
    setIsProcessing(true);
    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    onConfirm();
    setIsProcessing(false);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <ArrowDown className="h-6 w-6 text-warning" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl">
                Downgrade to {TIER_DISPLAY_NAMES[targetTier]}?
              </AlertDialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                From {TIER_DISPLAY_NAMES[currentTier]}
              </p>
            </div>
          </div>
          
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-left">
              {/* Data Preservation Notice */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-success/30 bg-success/5 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                    <Database className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-success text-sm mb-1">
                      Your Data is Safe
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      All your businesses, invoices, expenses, calculations, and settings will be securely preserved. 
                      If you upgrade again, everything will be exactly as you left it.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Restrictions Notice */}
              {restrictions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-lg border border-border bg-muted/30 p-4"
                >
                  <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    Features you'll lose access to:
                  </h4>
                  <ul className="space-y-2">
                    {restrictions.slice(0, 5).map((restriction, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.05 }}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                        {restriction}
                      </motion.li>
                    ))}
                    {restrictions.length > 5 && (
                      <li className="text-xs text-muted-foreground italic">
                        +{restrictions.length - 5} more features
                      </li>
                    )}
                  </ul>
                </motion.div>
              )}

              {/* Security Badge */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>You can upgrade back anytime with full data restoration</span>
              </motion.div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isProcessing}>
            Keep {TIER_DISPLAY_NAMES[currentTier]}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isProcessing}
            className="bg-warning text-warning-foreground hover:bg-warning/90"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 border-2 border-warning-foreground/30 border-t-warning-foreground rounded-full"
                />
                Processing...
              </span>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                Confirm Downgrade
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
