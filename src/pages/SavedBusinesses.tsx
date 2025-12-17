import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calculator, 
  Building2, 
  Briefcase,
  Trash2,
  Plus,
  Crown,
  ArrowRight,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  HelpCircle,
  Shield,
  X
} from "lucide-react";
import { useSubscription, SavedBusiness } from "@/contexts/SubscriptionContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/taxCalculations";
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
  DialogTrigger,
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
    verifyRCBN
  } = useSubscription();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [rcBnInput, setRcBnInput] = useState("");
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<SavedBusiness | null>(null);

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
        toast.success("CAC Verification Successful!", {
          description: `${result.details.companyName} is verified as Active`
        });
      } else {
        updateBusiness(selectedBusiness.id, {
          rcBnNumber: rcBnInput.toUpperCase(),
          verificationStatus: 'not_verified'
        });
        toast.error("Verification Failed", {
          description: "Number not found or invalid format. Check manually at CAC portal."
        });
      }
    } else {
      // Free/Basic tier - manual verification only
      updateBusiness(selectedBusiness.id, {
        rcBnNumber: rcBnInput.toUpperCase(),
        verificationStatus: 'manual'
      });
      toast.info("Manual Verification Recommended", {
        description: "Upgrade to Business tier for automatic CAC checks!"
      });
    }
    setShowVerifyDialog(false);
    setSelectedBusiness(null);
    setRcBnInput("");
  };

  // Sort businesses: verified first
  const sortedBusinesses = [...savedBusinesses].sort((a, b) => {
    if (a.verificationStatus === 'verified' && b.verificationStatus !== 'verified') return -1;
    if (b.verificationStatus === 'verified' && a.verificationStatus !== 'verified') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Free tier - no access
  if (tier === 'free') {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Saved Businesses
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Upgrade to Basic or higher to save businesses and access your calculation history.
            </p>
            
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-8">
              <Crown className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Basic Tier Benefits</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✓ Save up to 2 business profiles</li>
                <li>✓ Persistent data storage</li>
                <li>✓ PDF/CSV export</li>
                <li>✓ Email reminders</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="font-medium text-foreground mb-2 flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4 text-accent" />
                  Business Tier Adds
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Automatic CAC verification</li>
                  <li>✓ Verified business badges</li>
                  <li>✓ Tax filing preparation</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing">
                <Button variant="hero" size="lg">
                  <Crown className="h-4 w-4" />
                  Upgrade Now
                </Button>
              </Link>
              <Link to="/calculator">
                <Button variant="outline" size="lg">
                  Use Calculator
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-hero">
        <Header />

        <main className="container mx-auto px-4 py-8 pb-20">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Saved Businesses
                </h1>
                <p className="text-muted-foreground">
                  Manage your saved business profiles and CAC verification
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                  {limitText} businesses
                </span>
                <Link to="/calculator">
                  <Button variant="hero" disabled={!canSaveBusiness()}>
                    <Plus className="h-4 w-4" />
                    Add Business
                  </Button>
                </Link>
              </div>
            </div>

            {/* CAC Verification Banner */}
            {!canVerifyCAC() && (
              <div className="rounded-xl border border-accent/30 bg-accent/10 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-accent mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-1">
                      CAC Verification Available on Business Tier
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Upgrade to automatically verify RC/BN numbers and display verified badges on your business profiles.
                    </p>
                    <Link to="/pricing">
                      <Button variant="outline" size="sm">
                        Upgrade for CAC Verification
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade Nudge */}
            {!canSaveBusiness() && (
              <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="h-5 w-5 text-warning" />
                  <p className="text-sm text-foreground">
                    You've reached your business limit. Upgrade for more!
                  </p>
                </div>
                <Link to="/pricing">
                  <Button variant="outline" size="sm">
                    Upgrade
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Empty State */}
            {savedBusinesses.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">No Saved Businesses</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Save your first business from the tax calculator to track calculations and access filing tools.
                </p>
                <Link to="/calculator">
                  <Button variant="hero">
                    <Calculator className="h-4 w-4" />
                    Go to Calculator
                  </Button>
                </Link>
              </div>
            ) : (
              /* Business Cards Grid */
              <div className="grid gap-4 sm:grid-cols-2">
                {sortedBusinesses.map((business) => (
                  <BusinessCard 
                    key={business.id}
                    business={business}
                    tier={tier}
                    canVerifyCAC={canVerifyCAC()}
                    onDelete={handleDelete}
                    onVerify={handleVerify}
                    navigate={navigate}
                  />
                ))}
              </div>
            )}

            {/* Quick Stats */}
            {savedBusinesses.length > 0 && (
              <div className="mt-8 grid gap-4 sm:grid-cols-4">
                <StatCard 
                  label="Total Businesses"
                  value={savedBusinesses.length.toString()}
                  icon={<Building2 className="h-5 w-5" />}
                />
                <StatCard 
                  label="Companies"
                  value={savedBusinesses.filter(b => b.entityType === 'company').length.toString()}
                  icon={<Building2 className="h-5 w-5" />}
                />
                <StatCard 
                  label="Business Names"
                  value={savedBusinesses.filter(b => b.entityType === 'business_name').length.toString()}
                  icon={<Briefcase className="h-5 w-5" />}
                />
                <StatCard 
                  label="Verified"
                  value={savedBusinesses.filter(b => b.verificationStatus === 'verified').length.toString()}
                  icon={<CheckCircle2 className="h-5 w-5" />}
                />
              </div>
            )}

            {/* Future-proof tooltip */}
            <div className="mt-8 p-4 rounded-xl bg-secondary/50 text-center">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Mock data for prototype – live CAC VAS/third-party API integration (e.g., Mono/Dojah) coming soon for real-time checks!
              </p>
            </div>
          </div>
        </main>

        {/* Verify Dialog */}
        <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                CAC Verification
              </DialogTitle>
              <DialogDescription>
                {selectedBusiness?.name && `Verify CAC registration for ${selectedBusiness.name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  RC/BN Number
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Enter your CAC registration number. RC numbers are for Limited Companies (e.g., RC1234567). BN numbers are for Business Names (e.g., BN111111).</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <Input
                  placeholder="e.g., RC1234567 or BN111111"
                  value={rcBnInput}
                  onChange={(e) => setRcBnInput(e.target.value.toUpperCase())}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Format: RC + 6-8 digits (companies) or BN + digits (business names)
                </p>
              </div>

              {!canVerifyCAC() && (
                <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
                  <p className="text-sm text-warning flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Manual verification only on {tier} tier. Upgrade for automatic checks!
                  </p>
                </div>
              )}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <a href="https://search.cac.gov.ng" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Check on CAC Portal
                </a>
              </Button>
              <Button onClick={submitVerification} disabled={!rcBnInput.trim()} className="w-full sm:w-auto">
                {canVerifyCAC() ? 'Verify Now' : 'Save Number'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

const BusinessCard = ({
  business,
  tier,
  canVerifyCAC,
  onDelete,
  onVerify,
  navigate
}: {
  business: SavedBusiness;
  tier: string;
  canVerifyCAC: boolean;
  onDelete: (id: string, name: string) => void;
  onVerify: (business: SavedBusiness) => void;
  navigate: (path: string, options?: any) => void;
}) => {
  const isVerified = business.verificationStatus === 'verified';
  const hasWarning = business.verificationStatus === 'not_verified';
  const isManual = business.verificationStatus === 'manual';

  return (
    <div 
      className={`rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all ${
        isVerified ? 'border-success/30' : hasWarning ? 'border-destructive/30' : 'border-border'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            business.entityType === 'company' 
              ? 'bg-primary/10 text-primary' 
              : 'bg-accent/10 text-accent'
          }`}>
            {business.entityType === 'company' 
              ? <Building2 className="h-5 w-5" />
              : <Briefcase className="h-5 w-5" />
            }
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{business.name}</h3>
              {isVerified && (
                <Tooltip>
                  <TooltipTrigger>
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">CAC Verified ✓</p>
                    {business.cacDetails && (
                      <div className="text-xs mt-1">
                        <p>{business.cacDetails.companyName}</p>
                        <p>Status: {business.cacDetails.status}</p>
                        <p>Reg: {business.cacDetails.registrationDate}</p>
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              )}
              {hasWarning && (
                <Tooltip>
                  <TooltipTrigger>
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Not Verified - Check manually at search.cac.gov.ng</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {business.entityType === 'company' ? 'Limited Company' : 'Business Name'}
              {business.rcBnNumber && ` • ${business.rcBnNumber}`}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(business.id, business.name)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* CAC Details (if verified) */}
      {isVerified && business.cacDetails && (
        <div className="mb-4 p-3 rounded-lg bg-success/5 border border-success/20">
          <p className="text-xs font-medium text-success mb-1">CAC Verified Details</p>
          <p className="text-sm text-foreground">{business.cacDetails.companyName}</p>
          <p className="text-xs text-muted-foreground">
            Status: {business.cacDetails.status} • Registered: {business.cacDetails.registrationDate}
          </p>
        </div>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Annual Turnover
          </span>
          <span className="font-medium text-foreground">
            {formatCurrency(business.turnover)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Added
          </span>
          <span className="text-foreground">
            {new Date(business.createdAt).toLocaleDateString('en-NG', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => navigate('/calculator', { 
            state: { entityType: business.entityType } 
          })}
        >
          <Calculator className="h-4 w-4" />
          Calculate
        </Button>
        <Button 
          variant={isVerified ? "secondary" : "outline"} 
          size="sm"
          onClick={() => onVerify(business)}
        >
          <Shield className="h-4 w-4" />
          {isVerified ? 'Details' : 'Verify'}
        </Button>
        {(tier === 'business' || tier === 'corporate') && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/tax-filing')}
          >
            File Taxes
          </Button>
        )}
      </div>
    </div>
  );
};

const Header = () => {
  const { tier } = useSubscription();
  
  return (
    <header className="container mx-auto px-4 py-6">
      <nav className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
            <Calculator className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">NaijaTaxPro</span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/calculator" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Calculator
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {tier !== 'free' && (
            <span className="hidden sm:inline text-xs bg-success/20 text-success px-2 py-1 rounded-full font-medium">
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </span>
          )}
          <ThemeToggle />
          <Link to="/pricing">
            <Button variant="outline" size="sm">
              {tier === 'free' ? 'Upgrade' : 'Plans'}
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};

const StatCard = ({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  </div>
);

export default SavedBusinesses;