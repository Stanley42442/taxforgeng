import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Sparkles
} from "lucide-react";
import { useSubscription, SavedBusiness } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/taxCalculations";
import { NavMenu } from "@/components/NavMenu";
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

  const limit = getBusinessLimit();
  const limitText = limit === 'unlimited' ? 'Unlimited' : `${businessCount}/${limit}`;

  const handleDelete = (id: string, name: string) => {
    removeBusiness(id);
    toast.success(`Removed "${name}" from saved businesses`);
  };

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

  if (tier === 'free') {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Saved Businesses</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Upgrade to Basic or higher to save businesses.
            </p>
            <Link to="/pricing">
              <Button variant="hero" size="lg">
                <Crown className="h-4 w-4" />
                Upgrade Now
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
        <NavMenu />

        <main className="container mx-auto px-4 py-6 pb-8 flex-1">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Saved Businesses</h1>
                <p className="text-muted-foreground">{limitText} businesses</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {savedBusinesses.length === 0 && canSaveBusiness() && (
                  <Button variant="outline" onClick={handleAddSamples}>
                    <Sparkles className="h-4 w-4" />
                    Add Samples
                  </Button>
                )}
                {tier === 'corporate' && (
                  <Button variant="outline" onClick={() => setShowBulkDialog(true)}>
                    <Upload className="h-4 w-4" />
                    Bulk Verify
                  </Button>
                )}
                <Link to="/calculator">
                  <Button variant="hero" disabled={!canSaveBusiness()}>
                    <Plus className="h-4 w-4" />
                    Add Business
                  </Button>
                </Link>
              </div>
            </div>

            {savedBusinesses.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">No Saved Businesses</h2>
                <p className="text-muted-foreground mb-6">Use the calculator and save your results.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/calculator">
                    <Button variant="hero">Go to Calculator</Button>
                  </Link>
                  {canSaveBusiness() && (
                    <Button variant="outline" onClick={handleAddSamples}>
                      <Sparkles className="h-4 w-4" />
                      Add Sample Businesses
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {sortedBusinesses.map((business) => (
                  <div 
                    key={business.id}
                    className={`rounded-xl border bg-card p-5 shadow-card ${
                      business.verificationStatus === 'verified' ? 'border-success/30' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          business.entityType === 'company' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                        }`}>
                          {business.entityType === 'company' ? <Building2 className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{business.name}</h3>
                            {business.verificationStatus === 'verified' && (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {business.entityType === 'company' ? 'Limited Company' : 'Business Name'}
                            {business.rcBnNumber && ` • ${business.rcBnNumber}`}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(business.id, business.name)}>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

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
      </div>
    </TooltipProvider>
  );
};

export default SavedBusinesses;