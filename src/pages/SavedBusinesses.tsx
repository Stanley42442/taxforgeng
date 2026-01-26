import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  Briefcase,
  Trash2,
  Plus,
  Crown,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  HelpCircle,
  Shield,
  Upload,
  Sparkles,
  FileText,
  Users,
  PieChart,
  ClipboardCheck,
  Receipt,
  Calculator,
  Bell
} from "lucide-react";
import { useSubscription, SavedBusiness } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/taxCalculations";
import { PageLayout } from "@/components/PageLayout";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { SharedElement } from "@/components/PageTransition";
import { motion } from "framer-motion";
import { useDeleteWithUndo } from "@/hooks/useDeleteWithUndo";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";

const SavedBusinesses = () => {
  const navigate = useNavigate();
  const { 
    tier, 
    savedBusinesses, 
    removeBusiness, 
    updateBusiness,
    canSaveBusiness, 
    canVerifyCAC,
    getBusinessLimit,
    businessCount,
    verifyRCBN,
    bulkVerifyRCBN,
    addSampleBusinesses
  } = useSubscription();

  const [rcBnInput, setRcBnInput] = useState("");
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<SavedBusiness | null>(null);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkResults, setBulkResults] = useState<Array<{ rcBnNumber: string; isValid: boolean; details?: any }>>([]);

  // Use centralized delete with undo hook
  const deleteWithUndo = useDeleteWithUndo<SavedBusiness>({
    onDelete: (business) => {
      removeBusiness(business.id);
    },
    getSuccessMessage: (business) => `Removed "${business.name}" from saved businesses`,
    getItemName: (business) => business.name,
  });

  const limit = getBusinessLimit();
  const limitText = limit === 'unlimited' ? 'Unlimited' : `${businessCount}/${limit}`;

  const handleVerify = (business: SavedBusiness) => {
    setSelectedBusiness(business);
    setRcBnInput(business.rcBnNumber || "");
    setShowVerifyDialog(true);
  };

  const submitVerification = () => {
    if (!selectedBusiness || !rcBnInput.trim()) return;

    if (canVerifyCAC()) {
      const result = verifyRCBN(rcBnInput);
      if (result.isValid && result.details) {
        updateBusiness(selectedBusiness.id, {
          rcBnNumber: rcBnInput.toUpperCase(),
          verificationStatus: 'verified',
          cacDetails: result.details
        });
        toast.success("CAC Verification Successful!");
      } else {
        updateBusiness(selectedBusiness.id, {
          rcBnNumber: rcBnInput.toUpperCase(),
          verificationStatus: 'not_verified'
        });
        toast.error("Verification Failed");
      }
    } else {
      updateBusiness(selectedBusiness.id, {
        rcBnNumber: rcBnInput.toUpperCase(),
        verificationStatus: 'manual'
      });
      toast.info("Manual Verification Recommended");
    }
    setShowVerifyDialog(false);
    setSelectedBusiness(null);
    setRcBnInput("");
  };

  const handleBulkVerify = () => {
    const numbers = bulkInput.split(/[\n,]/).map(n => n.trim()).filter(n => n);
    if (numbers.length === 0) return;
    const results = bulkVerifyRCBN(numbers);
    setBulkResults(results);
    toast.success(`Verified ${results.filter(r => r.isValid).length}/${results.length} numbers`);
  };

  const handleAddSamples = () => {
    addSampleBusinesses();
    toast.success("Sample businesses added!");
  };

  const sortedBusinesses = [...savedBusinesses].sort((a, b) => {
    if (a.verificationStatus === 'verified' && b.verificationStatus !== 'verified') return -1;
    if (b.verificationStatus === 'verified' && a.verificationStatus !== 'verified') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Business tools configuration
  const businessTools = [
    { to: "/invoices", label: "Invoices", icon: FileText, description: "Create & manage invoices", minTier: 'basic' },
    { to: "/payroll", label: "Payroll", icon: Users, description: "Calculate salaries & PAYE", minTier: 'basic' },
    { to: "/profit-loss", label: "P&L Statement", icon: PieChart, description: "View financial performance", minTier: 'basic' },
    { to: "/compliance", label: "Compliance", icon: ClipboardCheck, description: "Track tax deadlines", minTier: 'professional' },
    { to: "/expenses", label: "Expenses", icon: Receipt, description: "Track business expenses", minTier: 'starter' },
    { to: "/reminders", label: "Reminders", icon: Bell, description: "Set tax reminders", minTier: 'starter' },
  ];

  const tierOrder = ['free', 'starter', 'basic', 'professional', 'business', 'corporate'];
  const userTierIndex = tierOrder.indexOf(tier);

  const accessibleTools = businessTools.filter(tool => {
    const toolTierIndex = tierOrder.indexOf(tool.minTier);
    return toolTierIndex <= userTierIndex;
  });

  if (tier === 'free') {
    return (
      <PageLayout title="My Businesses" description="Manage your saved businesses" icon={Building2}>
        <div className="max-w-2xl mx-auto text-center">
          <Card className="p-8 glass-frosted text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 animate-float">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Saved Businesses</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Upgrade to Starter or higher to save businesses.
            </p>
            <Link to="/pricing">
              <Button variant="hero" size="lg">
                <Crown className="h-4 w-4" />
                Upgrade Now
              </Button>
            </Link>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <TooltipProvider>
      <PageLayout 
        title="Business Hub" 
        description={`${limitText} businesses saved`} 
        icon={Building2}
        headerActions={
          <div className="flex flex-wrap items-center gap-2">
            {savedBusinesses.length === 0 && canSaveBusiness() && (
              <Button variant="outline" size="sm" onClick={handleAddSamples}>
                <Sparkles className="h-4 w-4" />
                Add Samples
              </Button>
            )}
            {tier === 'corporate' && (
              <Button variant="outline" size="sm" onClick={() => setShowBulkDialog(true)}>
                <Upload className="h-4 w-4" />
                Bulk Verify
              </Button>
            )}
            <Link to="/calculator">
              <Button variant="hero" size="sm" disabled={!canSaveBusiness()}>
                <Plus className="h-4 w-4" />
                Add Business
              </Button>
            </Link>
          </div>
        }
      >
        {/* Business Tools Section */}
        {accessibleTools.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Business Tools
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {accessibleTools.map((tool) => (
                <Link key={tool.to} to={tool.to}>
                  <Card className="h-full glass-frosted hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group card-interactive">
                    <CardContent className="p-4 text-center">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mx-auto mb-2 group-hover:glow-sm transition-all">
                        <tool.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium text-sm">{tool.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tool.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Saved Businesses Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Saved Businesses
          </h2>

          {savedBusinesses.length === 0 ? (
            <Card className="p-12 text-center glass-frosted">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 animate-float">
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Saved Businesses</h3>
              <p className="text-muted-foreground mb-6">Use the calculator and save your results.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/calculator">
                  <Button variant="hero" className="hover-lift">Go to Calculator</Button>
                </Link>
                {canSaveBusiness() && (
                  <Button variant="outline" onClick={handleAddSamples} className="hover-scale">
                    <Sparkles className="h-4 w-4" />
                    Add Sample Businesses
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedBusinesses.map((business, index) => (
                <SharedElement key={business.id} id={`business-card-${business.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card 
                      className={`shadow-card glass-frosted card-interactive h-full ${
                        business.verificationStatus === 'verified' ? 'border-success/30 glow-sm' : ''
                      }`}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <SharedElement id={`business-icon-${business.id}`}>
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                                business.entityType === 'company' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                              }`}>
                                {business.entityType === 'company' ? <Building2 className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
                              </div>
                            </SharedElement>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <SharedElement id={`business-name-${business.id}`}>
                                  <h3 className="font-semibold text-foreground truncate">{business.name}</h3>
                                </SharedElement>
                                {business.verificationStatus === 'verified' && (
                                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {business.entityType === 'company' ? 'Limited Company' : 'Business Name'}
                                {business.rcBnNumber && ` • ${business.rcBnNumber}`}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => deleteWithUndo.requestDelete(business)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">
                          Turnover: <span className="font-medium text-foreground">{formatCurrency(business.turnover)}</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => handleVerify(business)}>
                          <Shield className="h-4 w-4" />
                          {business.verificationStatus === 'verified' ? 'View Verification' : 'Verify CAC'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </SharedElement>
              ))}
            </div>
          )}
        </div>

        {/* Verify Dialog */}
        <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>CAC Verification</DialogTitle>
              <DialogDescription>Enter RC/BN number to verify</DialogDescription>
            </DialogHeader>
            <Input
              placeholder="e.g., RC1234567 or BN111111"
              value={rcBnInput}
              onChange={(e) => setRcBnInput(e.target.value.toUpperCase())}
            />
            <DialogFooter>
              <Button variant="outline" asChild>
                <a href="https://search.cac.gov.ng" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  CAC Portal
                </a>
              </Button>
              <Button onClick={submitVerification} disabled={!rcBnInput.trim()}>
                {canVerifyCAC() ? 'Verify' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Verify Dialog (Corporate) */}
        <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bulk CAC Verification</DialogTitle>
              <DialogDescription>Enter RC/BN numbers (one per line or comma-separated)</DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="RC1234567&#10;RC987654&#10;BN111111"
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              rows={5}
            />
            {bulkResults.length > 0 && (
              <div className="max-h-48 overflow-auto border rounded-lg p-3">
                {bulkResults.map((r, i) => (
                  <div key={i} className={`flex justify-between py-1 text-sm ${r.isValid ? 'text-success' : 'text-destructive'}`}>
                    <span>{r.rcBnNumber}</span>
                    <span>{r.isValid ? '✓ Verified' : '✗ Invalid'}</span>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleBulkVerify}>Verify All</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteWithUndo.showDialog}
          onOpenChange={(open) => !open && deleteWithUndo.cancelDelete()}
          onConfirm={deleteWithUndo.confirmDelete}
          title="Delete Business"
          itemName={deleteWithUndo.itemToDelete?.name}
        />
      </PageLayout>
    </TooltipProvider>
  );
};

export default SavedBusinesses;